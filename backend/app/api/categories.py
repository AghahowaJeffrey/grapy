"""
Category management endpoints for admins.
Allows creating, reading, updating, and deactivating payment categories.
"""
import secrets
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_current_user
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.database import get_db
from app.models.user import User
from app.models.category import Category
from app.models.submission import PaymentSubmission, SubmissionStatus
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["categories"])


def get_category_by_id_and_owner(category_id: UUID, user: User, db: Session) -> Category:
    """
    Fetch category and verify ownership.

    Args:
        category_id: ID of the category
        user: Current authenticated user
        db: Database session

    Returns:
        Category object

    Raises:
        NotFoundError: If category not found or user doesn't own it
    """
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.admin_id == user.id
    ).first()

    if not category:
        raise NotFoundError(detail="Category not found or access denied")

    return category


def add_submission_counts(category: Category, db: Session) -> dict:
    """
    Add submission counts to category response.

    Args:
        category: Category object
        db: Database session

    Returns:
        Dictionary with category data plus submission counts
    """
    # Count submissions by status
    status_counts = db.query(
        PaymentSubmission.status,
        func.count(PaymentSubmission.id)
    ).filter(
        PaymentSubmission.category_id == category.id
    ).group_by(PaymentSubmission.status).all()

    counts = {
        "pending_count": 0,
        "confirmed_count": 0,
        "rejected_count": 0
    }

    for status_value, count in status_counts:
        if status_value == SubmissionStatus.PENDING:
            counts["pending_count"] = count
        elif status_value == SubmissionStatus.CONFIRMED:
            counts["confirmed_count"] = count
        elif status_value == SubmissionStatus.REJECTED:
            counts["rejected_count"] = count

    # Combine category data with counts
    category_dict = {
        "id": category.id,
        "admin_id": category.admin_id,
        "title": category.title,
        "description": category.description,
        "amount_expected": category.amount_expected,
        "public_token": category.public_token,
        "is_active": category.is_active,
        "created_at": category.created_at,
        "expires_at": category.expires_at,
        **counts
    }

    return category_dict


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    request: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new payment category.

    Generates a unique public token for the category that students can use
    to submit payments without authentication.

    Args:
        request: Category creation data
        current_user: Authenticated admin user
        db: Database session

    Returns:
        CategoryResponse with created category details including public token
    """
    # Generate cryptographically secure public token (32 bytes = 43 characters urlsafe)
    public_token = secrets.token_urlsafe(32)

    category = Category(
        admin_id=current_user.id,
        title=request.title,
        description=request.description,
        amount_expected=request.amount_expected,
        public_token=public_token,
        expires_at=request.expires_at,
        is_active=True
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return add_submission_counts(category, db)


@router.get("/", response_model=List[CategoryResponse])
def list_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all categories created by the current user.

    Returns categories ordered by creation date (newest first).
    Includes submission counts for each category.

    Args:
        current_user: Authenticated admin user
        db: Database session

    Returns:
        List of CategoryResponse objects
    """
    categories = db.query(Category).filter(
        Category.admin_id == current_user.id
    ).order_by(Category.created_at.desc()).all()

    # Add submission counts to each category
    return [add_submission_counts(cat, db) for cat in categories]


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single category by ID.

    Only the category owner can access this endpoint.

    Args:
        category_id: ID of the category to retrieve
        current_user: Authenticated admin user
        db: Database session

    Returns:
        CategoryResponse with category details and submission counts

    Raises:
        NotFoundError: If category not found or user doesn't own it
    """
    category = get_category_by_id_and_owner(category_id, current_user, db)
    return add_submission_counts(category, db)


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: UUID,
    request: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing category.

    Only the category owner can update it.
    Public token cannot be changed (it's permanent).

    Args:
        category_id: ID of the category to update
        request: Fields to update (only provided fields are updated)
        current_user: Authenticated admin user
        db: Database session

    Returns:
        CategoryResponse with updated category details

    Raises:
        NotFoundError: If category not found or user doesn't own it
    """
    category = get_category_by_id_and_owner(category_id, current_user, db)

    # Update only provided fields
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return add_submission_counts(category, db)


@router.post("/{category_id}/deactivate", status_code=status.HTTP_200_OK)
def deactivate_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deactivate a category (soft delete).

    Sets is_active=False, which prevents new submissions via the public link.
    Existing submissions remain accessible.

    Args:
        category_id: ID of the category to deactivate
        current_user: Authenticated admin user
        db: Database session

    Returns:
        Success message

    Raises:
        NotFoundError: If category not found or user doesn't own it
    """
    category = get_category_by_id_and_owner(category_id, current_user, db)

    category.is_active = False
    db.commit()

    return {
        "message": "Category deactivated successfully",
        "category_id": category_id
    }


@router.post("/{category_id}/activate", status_code=status.HTTP_200_OK)
def activate_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Re-activate a previously deactivated category.

    Sets is_active=True, allowing new submissions again.

    Args:
        category_id: ID of the category to activate
        current_user: Authenticated admin user
        db: Database session

    Returns:
        Success message

    Raises:
        NotFoundError: If category not found or user doesn't own it
    """
    category = get_category_by_id_and_owner(category_id, current_user, db)

    category.is_active = True
    db.commit()

    return {
        "message": "Category activated successfully",
        "category_id": category_id
    }
