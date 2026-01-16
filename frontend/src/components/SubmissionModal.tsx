/**
 * Submission Modal Component
 * Displays submission details with confirm/reject actions
 */
import { useState } from 'react';
import { PaymentSubmission } from '../types/submission';
import ConfirmDialog from './ConfirmDialog';
import '../styles/components.css';
import '../styles/category-detail.css';

interface SubmissionModalProps {
  submission: PaymentSubmission;
  onClose: () => void;
  onConfirm: (note?: string) => void;
  onReject: (note: string) => void;
  isConfirming: boolean;
  isRejecting: boolean;
}

const SubmissionModal = ({
  submission,
  onClose,
  onConfirm,
  onReject,
  isConfirming,
  isRejecting,
}: SubmissionModalProps) => {
  const [adminNote, setAdminNote] = useState('');
  const [action, setAction] = useState<'confirm' | 'reject' | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirm = () => {
    onConfirm(adminNote || undefined);
  };

  const handleRejectClick = () => {
    if (!adminNote.trim()) {
      alert('Please provide a rejection reason in the admin note.');
      return;
    }
    setShowRejectConfirm(true);
  };

  const handleRejectConfirm = () => {
    onReject(adminNote);
    setShowRejectConfirm(false);
  };

  const isProcessing = isConfirming || isRejecting;
  const isPending = submission.status === 'pending';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content submission-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Submission Details</h2>
          <button
            onClick={onClose}
            className="modal-close"
            disabled={isProcessing}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-form">
          {/* Student Information */}
          <div className="submission-section">
            <h3>Student Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{submission.student_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{submission.student_phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Amount Paid:</span>
                <span className="info-value">${submission.amount_paid.toFixed(2)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`status-badge status-${submission.status}`}>
                  {submission.status.toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Submitted At:</span>
                <span className="info-value">{formatDate(submission.submitted_at)}</span>
              </div>
              {submission.reviewed_at && (
                <div className="info-item">
                  <span className="info-label">Reviewed At:</span>
                  <span className="info-value">{formatDate(submission.reviewed_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Receipt */}
          <div className="submission-section">
            <h3>Payment Receipt</h3>
            <div className="receipt-preview">
              {submission.receipt_signed_url ? (
                submission.receipt_url.toLowerCase().endsWith('.pdf') ? (
                  <div className="pdf-preview">
                    <p>PDF Receipt</p>
                    <a
                      href={submission.receipt_signed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-view-receipt"
                    >
                      Open PDF in New Tab
                    </a>
                  </div>
                ) : (
                  <img
                    src={submission.receipt_signed_url}
                    alt="Payment receipt"
                    className="receipt-image"
                  />
                )
              ) : (
                <p className="no-receipt">No receipt available</p>
              )}
            </div>
          </div>

          {/* Admin Note */}
          {submission.admin_note && (
            <div className="submission-section">
              <h3>Admin Note</h3>
              <p className="admin-note-display">{submission.admin_note}</p>
            </div>
          )}

          {/* Admin Actions (only for pending submissions) */}
          {isPending && (
            <div className="submission-section">
              <h3>Admin Actions</h3>
              <div className="form-group">
                <label htmlFor="adminNote">
                  Admin Note {action === 'reject' && <span className="required">*</span>}
                </label>
                <textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    action === 'reject'
                      ? 'Please provide a reason for rejection...'
                      : 'Optional note about this submission...'
                  }
                  rows={3}
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="modal-actions">
            {isPending ? (
              <>
                <button
                  onClick={handleConfirm}
                  className="btn-confirm"
                  disabled={isProcessing}
                >
                  {isConfirming ? (
                    <>
                      <span className="spinner"></span>
                      Confirming...
                    </>
                  ) : (
                    '✓ Confirm'
                  )}
                </button>
                <button
                  onClick={handleRejectClick}
                  className="btn-reject"
                  disabled={isProcessing}
                >
                  {isRejecting ? (
                    <>
                      <span className="spinner"></span>
                      Rejecting...
                    </>
                  ) : (
                    '✕ Reject'
                  )}
                </button>
              </>
            ) : (
              <button onClick={onClose} className="btn-close-modal">
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRejectConfirm}
        title="Reject Submission"
        message="Are you sure you want to reject this payment submission? This action cannot be undone."
        confirmText="Reject"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleRejectConfirm}
        onCancel={() => setShowRejectConfirm(false)}
        isLoading={isRejecting}
      />
    </div>
  );
};

export default SubmissionModal;
