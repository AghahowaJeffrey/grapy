/**
 * Category Detail Page - Submission Management
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchCategoryApi } from '../../api/categories';
import {
  fetchSubmissionsApi,
  confirmSubmissionApi,
  rejectSubmissionApi,
  exportSubmissionsApi,
} from '../../api/submissions';
import type { SubmissionStatus, PaymentSubmission } from '../../types/submission';
import SubmissionTable from '../../components/SubmissionTable';
import SubmissionModal from '../../components/SubmissionModal';
import '../../styles/category-detail.css';

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SubmissionStatus | 'all'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<PaymentSubmission | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch category
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: () => fetchCategoryApi(id!),
    enabled: !!id,
  });

  // Fetch submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', id, activeTab],
    queryFn: () =>
      fetchSubmissionsApi(
        id!,
        activeTab === 'all' ? undefined : (activeTab as SubmissionStatus)
      ),
    enabled: !!id,
  });

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      confirmSubmissionApi(id, note ? { admin_note: note } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', id] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSelectedSubmission(null);
      toast.success('Submission confirmed successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to confirm submission');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      rejectSubmissionApi(id, { admin_note: note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', id] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSelectedSubmission(null);
      toast.success('Submission rejected');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to reject submission');
    },
  });

  const handleExport = async () => {
    if (!id) return;
    try {
      setIsExporting(true);
      const blob = await exportSubmissionsApi(id!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `category_${id}_submissions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Submissions exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export submissions');
    } finally {
      setIsExporting(false);
    }
  };

  if (categoryLoading) {
    return (
      <div className="category-detail-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-detail-container">
        <div className="error-state">
          <span>⚠️</span>
          <p>Category not found</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'all', label: 'All', count: (category.pending_count || 0) + (category.confirmed_count || 0) + (category.rejected_count || 0) },
    { key: 'pending', label: 'Pending', count: category.pending_count || 0 },
    { key: 'confirmed', label: 'Confirmed', count: category.confirmed_count || 0 },
    { key: 'rejected', label: 'Rejected', count: category.rejected_count || 0 },
  ];

  return (
    <div className="category-detail-container">
      {/* Header */}
      <div className="category-detail-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back
        </button>
        <div className="header-info">
          <h1>{category.title}</h1>
          <p className="description">{category.description || 'No description'}</p>
          {category.amount_expected && (
            <p className="amount">Expected Amount: ${
              typeof category.amount_expected === "number" ? category.amount_expected.toFixed(2) : category.amount_expected
            }</p>
          )}
        </div>
        <div className="header-actions">
          <button
            onClick={handleExport}
            className="btn-secondary"
            disabled={isExporting || !submissions || submissions.length === 0}
          >
            {isExporting ? '⏳ Exporting...' : '📊 Export CSV'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label} <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Submissions Table */}
      <div className="submissions-content">
        {submissionsLoading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading submissions...</p>
          </div>
        ) : !submissions || submissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No submissions yet</h3>
            <p>
              {activeTab === 'pending'
                ? 'No pending submissions to review'
                : `No ${activeTab} submissions`}
            </p>
          </div>
        ) : (
          <SubmissionTable
            submissions={submissions}
            onViewSubmission={setSelectedSubmission}
          />
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onConfirm={(note) => confirmMutation.mutate({ id: selectedSubmission.id, note })}
          onReject={(note) => rejectMutation.mutate({ id: selectedSubmission.id, note })}
          isConfirming={confirmMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />
      )}
    </div>
  );
};

export default CategoryDetail;
