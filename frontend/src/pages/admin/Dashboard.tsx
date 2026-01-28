/**
 * Admin Dashboard - Category management
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  fetchCategoriesApi,
  createCategoryApi,
  deactivateCategoryApi,
  activateCategoryApi
} from "../../api/categories";
import type { Category } from "../../types/category";
import CategoryCard from "../../components/CategoryCard";
import CreateCategoryModal from "../../components/CreateCategoryModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Fetch categories
  const {
    data: categories,
    isLoading,
    error
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategoriesApi
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
      toast.success("Category created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to create category");
    }
  });

  // Deactivate category mutation
  const deactivateMutation = useMutation({
    mutationFn: deactivateCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deactivated");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Failed to deactivate category"
      );
    }
  });

  // Activate category mutation
  const activateMutation = useMutation({
    mutationFn: activateCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category activated");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Failed to activate category"
      );
    }
  });

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/submit/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
    toast.success("Link copied to clipboard!");
  };

  const handleToggleActive = (category: Category) => {
    if (category.is_active) {
      deactivateMutation.mutate(category.id);
    } else {
      activateMutation.mutate(category.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600"
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
          <p className="text-gray-600 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">⚠️</span>
          <p className="text-gray-600 font-medium mb-6">
            Failed to load categories
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name || "Admin"} 👋
              </p>
            </div>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center gap-4">
              <div className="text-3xl">📁</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {categories?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Categories</div>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-yellow-50 to-white">
            <div className="flex items-center gap-4">
              <div className="text-3xl">⏳</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {categories?.reduce(
                    (sum, c) => sum + (c.pending_count || 0),
                    0
                  ) || 0}
                </div>
                <div className="text-sm text-gray-600">Pending Submissions</div>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center gap-4">
              <div className="text-3xl">✅</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {categories?.reduce(
                    (sum, c) => sum + (c.confirmed_count || 0),
                    0
                  ) || 0}
                </div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-red-50 to-white">
            <div className="flex items-center gap-4">
              <div className="text-3xl">❌</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {categories?.reduce(
                    (sum, c) => sum + (c.rejected_count || 0),
                    0
                  ) || 0}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Payment Categories
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your payment collection categories
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              + Create Category
            </button>
          </div>

          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onCopyLink={() => handleCopyLink(category.public_token)}
                  onToggleActive={() => handleToggleActive(category)}
                  onViewDetails={() => navigate(`/categories/${category.id}`)}
                  isCopied={copiedToken === category.public_token}
                />
              ))}
            </div>
          ) : (
            <div className="card bg-white text-center py-12">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No categories yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first category to start collecting payment proofs
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
              >
                Create Your First Category
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Category Modal */}
      {isModalOpen && (
        <CreateCategoryModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={createMutation.mutate}
          isLoading={createMutation.isPending}
          error={createMutation.error}
        />
      )}
    </div>
  );
};

export default Dashboard;
