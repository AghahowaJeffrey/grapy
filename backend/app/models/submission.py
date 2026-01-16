"""
PaymentSubmission model for tracking student payment proofs.
Implements immutable audit trail with strict state machine.
"""
import uuid
import enum
from sqlalchemy import Column, String, Text, Numeric, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SubmissionStatus(str, enum.Enum):
    """
    Payment submission status.
    State transitions (immutable):
    - pending → confirmed (by admin)
    - pending → rejected (by admin)
    No other transitions allowed, no deletion.
    """
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"


class PaymentSubmission(Base):
    """
    Payment submission model.
    Stores student payment proof with receipt file and status.
    Once reviewed, status cannot be changed (audit trail).
    """
    __tablename__ = "payment_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    student_name = Column(String(255), nullable=False)
    student_phone = Column(String(20), nullable=False)
    amount_paid = Column(Numeric(10, 2), nullable=False)
    receipt_url = Column(Text, nullable=False)  # S3 key, not full URL
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.PENDING, nullable=False, index=True)
    admin_note = Column(Text, nullable=True)  # Optional note when confirming/rejecting
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)  # Timestamp when status changed
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # Admin who reviewed

    # Relationships
    category = relationship("Category", back_populates="submissions")
    reviewer = relationship("User", foreign_keys=[reviewed_by])

    def __repr__(self):
        return f"<PaymentSubmission(id={self.id}, student='{self.student_name}', status={self.status.value})>"
