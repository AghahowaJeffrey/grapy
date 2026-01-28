/**
 * Submission Modal Component
 * Displays submission details with confirm/reject actions
 */
import { useState } from "react";
import type { PaymentSubmission } from "../types/submission";
import ConfirmDialog from "./ConfirmDialog";

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
  isRejecting
}: SubmissionModalProps) => {
  const [adminNote, setAdminNote] = useState("");
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleConfirm = () => {
    onConfirm(adminNote || undefined);
  };

  const handleRejectClick = () => {
    if (!adminNote.trim()) {
      alert("Please provide a rejection reason in the admin note.");
      return;
    }
    setShowRejectConfirm(true);
  };

  const handleRejectConfirm = () => {
    onReject(adminNote);
    setShowRejectConfirm(false);
  };

  const isProcessing = isConfirming || isRejecting;
  const isPending = submission.status === "pending";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Submission Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            disabled={isProcessing}
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {submission.student_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-base font-semibold text-gray-900">
                  {submission.student_phone}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Paid</p>
                <p className="text-lg font-bold text-blue-600">
                  ${Number(submission.amount_paid).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="mt-1">
                  <span
                    className={`badge ${
                      submission.status === "pending"
                        ? "badge-yellow"
                        : submission.status === "confirmed"
                          ? "badge-green"
                          : "badge-red"
                    }`}
                  >
                    {submission.status.charAt(0).toUpperCase() +
                      submission.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-600">
                  Submitted At
                </p>
                <p className="text-base text-gray-900">
                  {formatDate(submission.submitted_at)}
                </p>
              </div>
              {submission.reviewed_at && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">
                    Reviewed At
                  </p>
                  <p className="text-base text-gray-900">
                    {formatDate(submission.reviewed_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Receipt */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Receipt
            </h3>
            {submission.receipt_signed_url ? (
              submission.receipt_url.toLowerCase().endsWith(".pdf") ? (
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <svg
                    className="w-12 h-12 text-red-500 mb-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-. 9-2zm0-7c-1.1 0-1.99.9-1.99 2S5.9 15 7 15s2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  <p className="text-gray-700 font-medium mb-3">PDF Receipt</p>
                  <a
                    href={submission.receipt_signed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Open PDF
                  </a>
                </div>
              ) : (
                <img
                  src={submission.receipt_signed_url}
                  alt="Payment receipt"
                  className="w-full rounded-lg border border-gray-200 shadow-sm"
                />
              )
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">No receipt available</p>
              </div>
            )}
          </div>

          {/* Admin Note Display */}
          {submission.admin_note && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Admin Note
              </h3>
              <p className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 text-sm">
                {submission.admin_note}
              </p>
            </div>
          )}

          {/* Admin Actions (only for pending submissions) */}
          {isPending && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Actions
              </h3>
              <div>
                <label
                  htmlFor="adminNote"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Admin Note (Optional)
                </label>
                <textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note about this submission..."
                  rows={3}
                  disabled={isProcessing}
                  className="input resize-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {isPending ? (
              <>
                <button
                  onClick={handleConfirm}
                  className="btn-primary flex-1"
                  disabled={isProcessing}
                >
                  {isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Confirming...
                    </span>
                  ) : (
                    "✓ Confirm Payment"
                  )}
                </button>
                <button
                  onClick={handleRejectClick}
                  className="btn-danger flex-1"
                  disabled={isProcessing}
                >
                  {isRejecting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Rejecting...
                    </span>
                  ) : (
                    "✕ Reject"
                  )}
                </button>
              </>
            ) : (
              <button onClick={onClose} className="btn-secondary w-full">
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
