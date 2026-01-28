/**
 * Submission Table Component
 * Displays list of payment submissions with actions
 */
import type { PaymentSubmission } from "../types/submission";

interface SubmissionTableProps {
  submissions: PaymentSubmission[];
  onViewSubmission: (submission: PaymentSubmission) => void;
}

const SubmissionTable = ({
  submissions,
  onViewSubmission
}: SubmissionTableProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-yellow";
      case "confirmed":
        return "badge-green";
      case "rejected":
        return "badge-red";
      default:
        return "badge-blue";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Student Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Phone
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Submitted
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {submissions.map((submission) => (
            <tr
              key={submission.id}
              className="hover:bg-blue-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {submission.student_name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {submission.student_phone}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                ${Number(submission.amount_paid).toFixed(2)}
              </td>
              <td className="px-6 py-4">
                <span className={`badge ${getStatusBadge(submission.status)}`}>
                  {submission.status.charAt(0).toUpperCase() +
                    submission.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(submission.submitted_at)}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onViewSubmission(submission)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
