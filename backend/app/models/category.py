"""
Category model for payment collections.
Each category represents a specific payment event (e.g., "June Materials").
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Category(Base):
    """
    Payment category model.
    Contains a public token for students to submit payments without authentication.
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    amount_expected = Column(Numeric(10, 2), nullable=True)  # Optional expected amount
    public_token = Column(String(64), unique=True, nullable=False, index=True)  # Unguessable token for public access
    is_active = Column(Boolean, default=True, nullable=False)  # Soft delete flag
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Optional expiration

    # Relationships
    admin = relationship("User", backref="categories")
    submissions = relationship("PaymentSubmission", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Category(id={self.id}, title='{self.title}', admin_id={self.admin_id})>"
