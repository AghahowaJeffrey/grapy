"""
Public endpoints for student payment submissions.
These endpoints don't require authentication - students access via public token.
"""
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, BadRequestError
from app.database import get_db
from app.models.category import Category
from app.models.submission import PaymentSubmission, SubmissionStatus
from app.schemas.submission import PublicCategoryResponse, PublicSubmissionResponse
from app.services.storage_service import (
    storage_service,
    validate_file_extension,
    validate_file_size,
    generate_receipt_key
)

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/categories/{token}", response_model=PublicCategoryResponse)
def get_public_category(token: str, db: Session = Depends(get_db)):
    """
    Fetch category details by public token for the submission form.

    This endpoint is public and doesn't require authentication.
    Students use this to see what they're paying for before submitting.

    Args:
        token: Public token from the shareable link
        db: Database session

    Returns:
        PublicCategoryResponse with basic category details

    Raises:
        NotFoundError: If category not found, inactive, or expired
    """
    category = db.query(Category).filter(
        Category.public_token == token,
        Category.is_active == True
    ).first()

    if not category:
        raise NotFoundError(detail="Category not found or no longer active")

    # Check if category has expired
    if category.expires_at and category.expires_at < datetime.utcnow():
        raise NotFoundError(detail="This category has expired and is no longer accepting submissions")

    return PublicCategoryResponse(
        id=category.id,
        title=category.title,
        description=category.description,
        amount_expected=category.amount_expected
    )


@router.post("/categories/{token}/submissions", response_model=PublicSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_payment(
    token: str,
    student_name: str = Form(..., min_length=2, max_length=255),
    student_phone: str = Form(..., min_length=5, max_length=20),
    amount_paid: float = Form(..., gt=0),
    receipt: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Submit a payment proof (public endpoint - no authentication required).

    Students fill out a form with their details and upload a receipt.
    The submission is created with 'pending' status for admin review.

    Args:
        token: Public token from the shareable link
        student_name: Student's full name
        student_phone: Student's phone number
        amount_paid: Amount paid
        receipt: Receipt file (JPG, PNG, or PDF)
        db: Database session

    Returns:
        PublicSubmissionResponse with submission ID and status

    Raises:
        NotFoundError: If category not found or expired
        BadRequestError: If file validation fails
    """
    # Validate category exists and is active
    category = db.query(Category).filter(
        Category.public_token == token,
        Category.is_active == True
    ).first()

    if not category:
        raise NotFoundError(detail="Category not found or no longer active")

    # Check expiration
    if category.expires_at and category.expires_at < datetime.utcnow():
        raise BadRequestError(detail="This category has expired and is no longer accepting submissions")

    # Validate file extension
    validate_file_extension(receipt.filename)

    # Validate file size
    validate_file_size(receipt.file)

    # Create submission record first (to get ID for S3 key)
    submission = PaymentSubmission(
        category_id=category.id,
        student_name=student_name,
        student_phone=student_phone,
        amount_paid=amount_paid,
        receipt_url="",  # Placeholder, will update after upload
        status=SubmissionStatus.PENDING
    )

    db.add(submission)
    db.flush()  # Get submission ID without committing

    try:
        # Generate S3 key and upload file
        receipt_key = generate_receipt_key(category.id, submission.id, receipt.filename)
        storage_service.upload_file(receipt.file, receipt_key, receipt.content_type)

        # Update submission with S3 key
        submission.receipt_url = receipt_key
        db.commit()
        db.refresh(submission)

    except Exception as e:
        db.rollback()
        raise BadRequestError(detail=f"File upload failed: {str(e)}")

    return PublicSubmissionResponse(
        id=submission.id,
        status="pending",
        message="Payment proof submitted successfully. The course representative will review it soon."
    )
