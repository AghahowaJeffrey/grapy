"""
Pydantic schemas for category endpoints.
These define request and response models for category operations.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    """Request model for creating a new category."""
    title: str = Field(..., min_length=1, max_length=255, description="Category title")
    description: Optional[str] = Field(None, description="Optional description of the payment")
    amount_expected: Optional[Decimal] = Field(None, ge=0, description="Optional expected amount")
    expires_at: Optional[datetime] = Field(None, description="Optional expiration date/time")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "June Course Materials",
                    "description": "Payment for course textbooks and materials",
                    "amount_expected": 50.00,
                    "expires_at": "2026-06-30T23:59:59"
                }
            ]
        }
    }


class CategoryUpdate(BaseModel):
    """Request model for updating a category."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    amount_expected: Optional[Decimal] = Field(None, ge=0)
    expires_at: Optional[datetime] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "Updated Title",
                    "amount_expected": 55.00
                }
            ]
        }
    }


class CategoryResponse(BaseModel):
    """Response model for category data."""
    id: int = Field(..., description="Category ID")
    admin_id: int = Field(..., description="ID of admin who created this category")
    title: str = Field(..., description="Category title")
    description: Optional[str] = Field(None, description="Category description")
    amount_expected: Optional[Decimal] = Field(None, description="Expected payment amount")
    public_token: str = Field(..., description="Public token for submission link")
    is_active: bool = Field(..., description="Whether category is active")
    created_at: datetime = Field(..., description="Creation timestamp")
    expires_at: Optional[datetime] = Field(None, description="Expiration timestamp")

    # Submission counts (added dynamically in endpoint)
    pending_count: Optional[int] = Field(0, description="Number of pending submissions")
    confirmed_count: Optional[int] = Field(0, description="Number of confirmed submissions")
    rejected_count: Optional[int] = Field(0, description="Number of rejected submissions")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "admin_id": 1,
                    "title": "June Course Materials",
                    "description": "Payment for course textbooks",
                    "amount_expected": 50.00,
                    "public_token": "8f3a9c2e1d4b5a7f9e0c1a2b3d4e5f6a",
                    "is_active": True,
                    "created_at": "2026-01-15T10:00:00",
                    "expires_at": "2026-06-30T23:59:59",
                    "pending_count": 5,
                    "confirmed_count": 10,
                    "rejected_count": 2
                }
            ]
        }
    }


class CategoryListResponse(BaseModel):
    """Response model for list of categories."""
    categories: list[CategoryResponse]
    total: int = Field(..., description="Total number of categories")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "categories": [],
                    "total": 0
                }
            ]
        }
    }
