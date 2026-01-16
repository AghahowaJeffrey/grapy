"""
Pydantic schemas for payment submission endpoints.
These define request and response models for submission operations.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.submission import SubmissionStatus


class SubmissionResponse(BaseModel):
    """Response model for payment submission data."""
    id: UUID = Field(..., description="Submission ID")
    category_id: UUID = Field(..., description="Category ID")
    student_name: str = Field(..., description="Student's name")
    student_phone: str = Field(..., description="Student's phone number")
    amount_paid: Decimal = Field(..., description="Amount paid")
    receipt_url: str = Field(..., description="Receipt S3 key")
    receipt_signed_url: Optional[str] = Field(None, description="Pre-signed URL for viewing receipt")
    status: SubmissionStatus = Field(..., description="Submission status")
    admin_note: Optional[str] = Field(None, description="Admin's note (for confirmed/rejected)")
    submitted_at: datetime = Field(..., description="Submission timestamp")
    reviewed_at: Optional[datetime] = Field(None, description="Review timestamp")
    reviewed_by: Optional[UUID] = Field(None, description="ID of admin who reviewed")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "category_id": "550e8400-e29b-41d4-a716-446655440001",
                    "student_name": "Jane Smith",
                    "student_phone": "+1234567890",
                    "amount_paid": 50.00,
                    "receipt_url": "receipts/1/1/20260115_120000_receipt.jpg",
                    "receipt_signed_url": "https://s3.amazonaws.com/...",
                    "status": "pending",
                    "admin_note": None,
                    "submitted_at": "2026-01-15T12:00:00",
                    "reviewed_at": None,
                    "reviewed_by": None
                }
            ]
        }
    }


class ConfirmSubmissionRequest(BaseModel):
    """Request model for confirming a submission."""
    admin_note: Optional[str] = Field(None, max_length=1000, description="Optional note about confirmation")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "admin_note": "Receipt verified. Payment confirmed."
                }
            ]
        }
    }


class RejectSubmissionRequest(BaseModel):
    """Request model for rejecting a submission."""
    admin_note: str = Field(..., min_length=1, max_length=1000, description="Reason for rejection")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "admin_note": "Receipt is unclear. Please resubmit with a clearer image."
                }
            ]
        }
    }


class PublicCategoryResponse(BaseModel):
    """Public response model for category (for submission form)."""
    id: UUID = Field(..., description="Category ID")
    title: str = Field(..., description="Category title")
    description: Optional[str] = Field(None, description="Category description")
    amount_expected: Optional[Decimal] = Field(None, description="Expected payment amount")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "title": "June Course Materials",
                    "description": "Payment for course textbooks",
                    "amount_expected": 50.00
                }
            ]
        }
    }


class PublicSubmissionResponse(BaseModel):
    """Response model for public submission."""
    id: UUID = Field(..., description="Submission ID")
    status: str = Field(..., description="Submission status")
    message: str = Field(..., description="Success message")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "status": "pending",
                    "message": "Payment proof submitted successfully. The course representative will review it soon."
                }
            ]
        }
    }
