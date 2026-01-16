/**
 * Create Category Modal Component
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CategoryCreate } from '../types/category';
import '../styles/components.css';

const categorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  amount_expected: z.number().min(0, 'Amount must be positive').optional().or(z.literal('')),
  expires_at: z.string().optional().or(z.literal('')),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CreateCategoryModalProps {
  onClose: () => void;
  onSubmit: (data: CategoryCreate) => void;
  isLoading: boolean;
  error: any;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  onClose,
  onSubmit,
  isLoading,
  error,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const handleFormSubmit = (data: CategoryFormData) => {
    const payload: CategoryCreate = {
      title: data.title,
      description: data.description || undefined,
      amount_expected: data.amount_expected || undefined,
      expires_at: data.expires_at || undefined,
    };
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Category</h2>
          <button onClick={onClose} className="modal-close" disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="modal-form">
          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              <p>{error.response?.data?.detail || 'Failed to create category'}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Category Title *</label>
            <input
              id="title"
              type="text"
              placeholder="e.g., June Course Materials"
              {...register('title')}
              className={errors.title ? 'input-error' : ''}
              disabled={isLoading}
            />
            {errors.title && <span className="error-text">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Optional description of what this payment is for"
              {...register('description')}
              className={errors.description ? 'input-error' : ''}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && <span className="error-text">{errors.description.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount_expected">Expected Amount ($)</label>
              <input
                id="amount_expected"
                type="number"
                step="0.01"
                placeholder="50.00"
                {...register('amount_expected', { valueAsNumber: true })}
                className={errors.amount_expected ? 'input-error' : ''}
                disabled={isLoading}
              />
              {errors.amount_expected && (
                <span className="error-text">{errors.amount_expected.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="expires_at">Expiration Date</label>
              <input
                id="expires_at"
                type="datetime-local"
                {...register('expires_at')}
                className={errors.expires_at ? 'input-error' : ''}
                disabled={isLoading}
              />
              {errors.expires_at && <span className="error-text">{errors.expires_at.message}</span>}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
