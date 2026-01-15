"""
Admin submission management endpoints.
Allows admins to view, confirm, reject submissions and export to CSV.
"""
import csv
import io
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import NotFoundError, BadRequestError
from app.database import get_db
from app.models.user import User
from app.models.category import Category
from app.models.submission import PaymentSubmission, SubmissionStatus
from app.schemas.submission import SubmissionResponse, ConfirmSubmissionRequest, RejectSubmissionRequest
from app.services.storage_service import storage_service

router = APIRouter(prefix="/api", tags=["submissions"])


def get_category_by_id_and_owner(category_id: int, user: User, db: Session) -> Category:
    """Helper to fetch category and verify ownership."""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.admin_id == user.id
    ).first()

    if not category:
        raise NotFoundError(detail="Category not found or access denied")

    return category


def get_submission_with_category_check(submission_id: int, user: User, db: Session) -> PaymentSubmission:
    """Fetch submission and verify user owns the category."""
    submission = db.query(PaymentSubmission).filter(
        PaymentSubmission.id == submission_id
    ).first()

    if not submission:
        raise NotFoundError(detail="Submission not found")

    # Verify user owns the category
    category = db.query(Category).filter(
        Category.id == submission.category_id,
        Category.admin_id == user.id
    ).first()

    if not category:
        raise NotFoundError(detail="Submission not found or access denied")

    return submission


@router.get("/categories/{category_id}/submissions", response_model=List[SubmissionResponse])
def list_submissions(
    category_id: int,
    status_filter: Optional[SubmissionStatus] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all submissions for a category.

    Only the category owner can access submissions.
    Optionally filter by status (pending, confirmed, rejected).

    Args:
        category_id: ID of the category
        status_filter: Optional status filter
        current_user: Authenticated admin user
        db: Database session

    Returns:
        List of SubmissionResponse objects with signed URLs for receipts

    Raises:
        NotFoundError: If category not found or user doesn't own it
    """
    # Verify category ownership
    category = get_category_by_id_and_owner(category_id, current_user, db)

    # Query submissions
    query = db.query(PaymentSubmission).filter(
        PaymentSubmission.category_id == category_id
    )

    if status_filter:
        query = query.filter(PaymentSubmission.status == status_filter)

    submissions = query.order_by(PaymentSubmission.submitted_at.desc()).all()

    # Add signed URLs for receipts
    result = []
    for sub in submissions:
        sub_dict = {
            "id": sub.id,
            "category_id": sub.category_id,
            "student_name": sub.student_name,
            "student_phone": sub.student_phone,
            "amount_paid": sub.amount_paid,
            "receipt_url": sub.receipt_url,
            "receipt_signed_url": storage_service.generate_presigned_url(sub.receipt_url),
            "status": sub.status,
            "admin_note": sub.admin_note,
            "submitted_at": sub.submitted_at,
            "reviewed_at": sub.reviewed_at,
            "reviewed_by": sub.reviewed_by
        }
        result.append(SubmissionResponse(**sub_dict))

    return result


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single submission by ID.

    Only the category owner can access the submission.

    Args:
        submission_id: ID of the submission
        current_user: Authenticated admin user
        db: Database session

    Returns:
        SubmissionResponse with submission details and signed URL

    Raises:
        NotFoundError: If submission not found or user doesn't own the category
    """
    submission = get_submission_with_category_check(submission_id, current_user, db)

    return SubmissionResponse(
        id=submission.id,
        category_id=submission.category_id,
        student_name=submission.student_name,
        student_phone=submission.student_phone,
        amount_paid=submission.amount_paid,
        receipt_url=submission.receipt_url,
        receipt_signed_url=storage_service.generate_presigned_url(submission.receipt_url),
        status=submission.status,
        admin_note=submission.admin_note,
        submitted_at=submission.submitted_at,
        reviewed_at=submission.reviewed_at,
        reviewed_by=submission.reviewed_by
    )


@router.patch("/submissions/{submission_id}/confirm", response_model=SubmissionResponse)
def confirm_submission(
    submission_id: int,
    request: ConfirmSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Confirm a pending submission.

    State transition: pending → confirmed (irreversible).

    Args:
        submission_id: ID of the submission to confirm
        request: Optional admin note
        current_user: Authenticated admin user
        db: Database session

    Returns:
        SubmissionResponse with updated status

    Raises:
        NotFoundError: If submission not found or access denied
        BadRequestError: If submission is not in pending status
    """
    submission = get_submission_with_category_check(submission_id, current_user, db)

    # Validate status transition
    if submission.status != SubmissionStatus.PENDING:
        raise BadRequestError(
            detail=f"Cannot confirm submission with status '{submission.status.value}'. Only pending submissions can be confirmed."
        )

    # Update submission
    submission.status = SubmissionStatus.CONFIRMED
    submission.admin_note = request.admin_note
    submission.reviewed_at = datetime.utcnow()
    submission.reviewed_by = current_user.id

    db.commit()
    db.refresh(submission)

    return SubmissionResponse(
        id=submission.id,
        category_id=submission.category_id,
        student_name=submission.student_name,
        student_phone=submission.student_phone,
        amount_paid=submission.amount_paid,
        receipt_url=submission.receipt_url,
        receipt_signed_url=storage_service.generate_presigned_url(submission.receipt_url),
        status=submission.status,
        admin_note=submission.admin_note,
        submitted_at=submission.submitted_at,
        reviewed_at=submission.reviewed_at,
        reviewed_by=submission.reviewed_by
    )


@router.patch("/submissions/{submission_id}/reject", response_model=SubmissionResponse)
def reject_submission(
    submission_id: int,
    request: RejectSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reject a pending submission.

    State transition: pending → rejected (irreversible).
    Requires an admin note explaining the rejection reason.

    Args:
        submission_id: ID of the submission to reject
        request: Rejection reason (required)
        current_user: Authenticated admin user
        db: Database session

    Returns:
        SubmissionResponse with updated status

    Raises:
        NotFoundError: If submission not found or access denied
        BadRequestError: If submission is not in pending status
    """
    submission = get_submission_with_category_check(submission_id, current_user, db)

    # Validate status transition
    if submission.status != SubmissionStatus.PENDING:
        raise BadRequestError(
            detail=f"Cannot reject submission with status '{submission.status.value}'. Only pending submissions can be rejected."
        )

    # Update submission
    submission.status = SubmissionStatus.REJECTED
    submission.admin_note = request.admin_note
    submission.reviewed_at = datetime.utcnow()
    submission.reviewed_by = current_user.id

    db.commit()
    db.refresh(submission)

    return SubmissionResponse(
        id=submission.id,
        category_id=submission.category_id,
        student_name=submission.student_name,
        student_phone=submission.student_phone,
        amount_paid=submission.amount_paid,
        receipt_url=submission.receipt_url,
        receipt_signed_url=storage_service.generate_presigned_url(submission.receipt_url),
        status=submission.status,
        admin_note=submission.admin_note,
        submitted_at=submission.submitted_at,
        reviewed_at=submission.reviewed_at,
        reviewed_by=submission.reviewed_by
    )


@router.get("/categories/{category_id}/export.csv")
def export_submissions_csv(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all submissions for a category as CSV.

    Downloads a CSV file with all submission data for recordkeeping.

    Args:
        category_id: ID of the category
        current_user: Authenticated admin user
        db: Database session

    Returns:
        CSV file as StreamingResponse

    Raises:
        NotFoundError: If category not found or user doesn't own it
    """
    # Verify category ownership
    category = get_category_by_id_and_owner(category_id, current_user, db)

    # Fetch all submissions
    submissions = db.query(PaymentSubmission).filter(
        PaymentSubmission.category_id == category_id
    ).order_by(PaymentSubmission.submitted_at.asc()).all()

    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        "ID",
        "Student Name",
        "Phone",
        "Amount Paid",
        "Status",
        "Submitted At",
        "Reviewed At",
        "Reviewed By",
        "Admin Note",
        "Receipt URL"
    ])

    # Write data rows
    for sub in submissions:
        writer.writerow([
            sub.id,
            sub.student_name,
            sub.student_phone,
            str(sub.amount_paid),
            sub.status.value,
            sub.submitted_at.isoformat() if sub.submitted_at else "",
            sub.reviewed_at.isoformat() if sub.reviewed_at else "",
            sub.reviewed_by if sub.reviewed_by else "",
            sub.admin_note or "",
            sub.receipt_url
        ])

    output.seek(0)

    # Return as downloadable CSV
    filename = f"category_{category_id}_submissions_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
