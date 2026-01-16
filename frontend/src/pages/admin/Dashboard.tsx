/**
 * Admin Dashboard - Category management
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { fetchCategoriesApi, createCategoryApi, deactivateCategoryApi, activateCategoryApi } from '../../api/categories';
import type { Category } from '../../types/category';
import CategoryCard from '../../components/CategoryCard';
import CreateCategoryModal from '../../components/CreateCategoryModal';
import '../../styles/dashboard.css';

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
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesApi,
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      toast.success('Category created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create category');
    },
  });

  // Deactivate category mutation
  const deactivateMutation = useMutation({
    mutationFn: deactivateCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deactivated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to deactivate category');
    },
  });

  // Activate category mutation
  const activateMutation = useMutation({
    mutationFn: activateCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category activated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to activate category');
    },
  });

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/submit/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
    toast.success('Link copied to clipboard!');
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
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <span>⚠️</span>
          <p>Failed to load categories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Payment Proof Dashboard</h1>
            <p>Welcome back, {user?.name || 'Admin'}</p>
          </div>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <div className="stat-value">{categories?.length || 0}</div>
            <div className="stat-label">Total Categories</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">
              {categories?.reduce((sum, c) => sum + (c.pending_count || 0), 0) || 0}
            </div>
            <div className="stat-label">Pending Submissions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">
              {categories?.reduce((sum, c) => sum + (c.confirmed_count || 0), 0) || 0}
            </div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-value">
              {categories?.reduce((sum, c) => sum + (c.rejected_count || 0), 0) || 0}
            </div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="categories-section">
        <div className="section-header">
          <h2>Payment Categories</h2>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            + Create Category
          </button>
        </div>

        {categories && categories.length > 0 ? (
          <div className="categories-grid">
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
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No categories yet</h3>
            <p>Create your first category to start collecting payment proofs</p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              Create Your First Category
            </button>
          </div>
        )}
      </div>

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
