/**
 * Category Card Component
 */
import { Category } from '../types/category';
import '../styles/components.css';

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
  isCopied,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = category.expires_at && new Date(category.expires_at) < new Date();

  return (
    <div className={`category-card ${!category.is_active ? 'inactive' : ''} ${isExpired ? 'expired' : ''}`}>
      {/* Header */}
      <div className="category-card-header">
        <div>
          <h3 className="category-title">{category.title}</h3>
          <p className="category-description">{category.description || 'No description'}</p>
        </div>
        <div className="category-status">
          {!category.is_active && <span className="badge badge-inactive">Inactive</span>}
          {isExpired && <span className="badge badge-expired">Expired</span>}
          {category.is_active && !isExpired && <span className="badge badge-active">Active</span>}
        </div>
      </div>

      {/* Amount */}
      {category.amount_expected && (
        <div className="category-amount">
          <span>Expected Amount:</span>
          <strong>${category.amount_expected.toFixed(2)}</strong>
        </div>
      )}

      {/* Submission Counts */}
      <div className="category-stats">
        <div className="stat">
          <span className="stat-icon pending">⏳</span>
          <div>
            <div className="stat-number">{category.pending_count || 0}</div>
            <div className="stat-text">Pending</div>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon confirmed">✅</span>
          <div>
            <div className="stat-number">{category.confirmed_count || 0}</div>
            <div className="stat-text">Confirmed</div>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon rejected">❌</span>
          <div>
            <div className="stat-number">{category.rejected_count || 0}</div>
            <div className="stat-text">Rejected</div>
          </div>
        </div>
      </div>

      {/* Expiration */}
      <div className="category-meta">
        <span>Expires: {formatDate(category.expires_at)}</span>
      </div>

      {/* Actions */}
      <div className="category-actions">
        <button onClick={onViewDetails} className="btn-action btn-view">
          View Details
        </button>
        <button
          onClick={onCopyLink}
          className={`btn-action btn-copy ${isCopied ? 'copied' : ''}`}
        >
          {isCopied ? '✓ Copied!' : '📋 Copy Link'}
        </button>
        <button
          onClick={onToggleActive}
          className={`btn-action ${category.is_active ? 'btn-deactivate' : 'btn-activate'}`}
        >
          {category.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
