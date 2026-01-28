/**
 * Create Category Modal Component
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CategoryCreate } from "../types/category";

const categorySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  amount_expected: z
    .number()
    .min(0, "Amount must be positive")
    .optional()
    .or(z.literal("")),
  expires_at: z.string().optional().or(z.literal(""))
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
  error
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema)
  });

  const handleFormSubmit = (data: CategoryFormData) => {
    const payload: CategoryCreate = {
      title: data.title,
      description: data.description || undefined,
      amount_expected: data.amount_expected || undefined,
      expires_at: data.expires_at || undefined
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Create New Category</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-light" disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600 text-lg mt-0.5">⚠️</span>
              <p className="text-red-700 text-sm font-medium">
                {error.response?.data?.detail || "Failed to create category"}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-900">
              Category Title <span className="text-red-600">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., June Course Materials"
              {...register("title")}
              className={`input ${errors.title ? "input-error" : ""}`}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-600 text-sm font-medium">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-900">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Optional description of what this payment is for"
              {...register("description")}
              className={`input resize-none ${errors.description ? "input-error" : ""}`}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && (
              <p className="text-red-600 text-sm font-medium">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="amount_expected" className="block text-sm font-medium text-gray-900">
                Expected Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input
                  id="amount_expected"
                  type="number"
                  step="0.01"
                  placeholder="50.00"
                  {...register("amount_expected", { valueAsNumber: true })}
                  className={`input pl-8 ${errors.amount_expected ? "input-error" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.amount_expected && (
                <p className="text-red-600 text-sm font-medium">
                  {errors.amount_expected.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="expires_at" className="block text-sm font-medium text-gray-900">
                Expiration Date
              </label>
              <input
                id="expires_at"
                type="datetime-local"
                {...register("expires_at")}
                className={`input ${errors.expires_at ? "input-error" : ""}`}
                disabled={isLoading}
              />
              {errors.expires_at && (
                <p className="text-red-600 text-sm font-medium">{errors.expires_at.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
