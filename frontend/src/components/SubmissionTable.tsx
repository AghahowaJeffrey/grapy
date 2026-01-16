/**
 * Submission Table Component
 * Displays list of payment submissions with actions
 */
import type { PaymentSubmission } from '../types/submission';
import '../styles/category-detail.css';

interface SubmissionTableProps {
  submissions: PaymentSubmission[];
  onViewSubmission: (submission: PaymentSubmission) => void;
}

const SubmissionTable = ({ submissions, onViewSubmission }: SubmissionTableProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-badge status-pending';
      case 'confirmed':
        return 'status-badge status-confirmed';
      case 'rejected':
        return 'status-badge status-rejected';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="submission-table-wrapper">
      <table className="submission-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Phone</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td>{submission.student_name}</td>
              <td>{submission.student_phone}</td>
              <td>${submission.amount_paid.toFixed(2)}</td>
              <td>
                <span className={getStatusBadgeClass(submission.status)}>
                  {submission.status.toUpperCase()}
                </span>
              </td>
              <td>{formatDate(submission.submitted_at)}</td>
              <td>
                <button
                  onClick={() => onViewSubmission(submission)}
                  className="btn-view-submission"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionTable;
