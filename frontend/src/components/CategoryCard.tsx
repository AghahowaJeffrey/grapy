/**
 * Category Card Component
 */
import type { Category } from "../types/category";

interface CategoryCardProps {
  category: Category;
  onCopyLink: () => void;
  onToggleActive: () => void;
  onViewDetails: () => void;
  isCopied: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onCopyLink,
  onToggleActive,
  onViewDetails,
  isCopied
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiration";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const isExpired =
    category.expires_at && new Date(category.expires_at) < new Date();

  return (
    <div
      className={`card hover:shadow-lg transition-all duration-300 ${isExpired ? "opacity-75" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {category.title}
          </h3>
          <p className="text-sm text-gray-600">
            {category.description || "No description"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {!category.is_active && (
            <span className="badge badge-yellow">Inactive</span>
          )}
          {isExpired && <span className="badge badge-red">Expired</span>}
          {category.is_active && !isExpired && (
            <span className="badge badge-green">Active</span>
          )}
        </div>
      </div>

      {/* Amount */}
      {category.amount_expected && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Expected Amount</p>
          <p className="text-2xl font-bold text-blue-600">
            $
            {typeof category.amount_expected === "number"
              ? category.amount_expected.toFixed(2)
              : category.amount_expected}
          </p>
        </div>
      )}

      {/* Submission Counts */}
      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {category.pending_count || 0}
          </div>
          <div className="text-xs text-gray-600 font-medium">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {category.confirmed_count || 0}
          </div>
          <div className="text-xs text-gray-600 font-medium">Confirmed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {category.rejected_count || 0}
          </div>
          <div className="text-xs text-gray-600 font-medium">Rejected</div>
        </div>
      </div>

      {/* Expiration */}
      <div className="mb-4 text-sm">
        <p className="text-gray-600">
          <span className="font-medium">Expires:</span>{" "}
          {formatDate(category.expires_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          View Details
        </button>
        <button
          onClick={onCopyLink}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isCopied
              ? "bg-green-100 text-green-700"
              : "text-blue-600 hover:bg-blue-50"
          }`}
        >
          {isCopied ? "✓ Copied!" : "📋 Copy"}
        </button>
        <button
          onClick={onToggleActive}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            category.is_active
              ? "text-gray-600 hover:bg-gray-100"
              : "text-green-600 hover:bg-green-50"
          }`}
        >
          {category.is_active ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
