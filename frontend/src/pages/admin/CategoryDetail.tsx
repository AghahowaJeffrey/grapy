/**
 * Category Detail Page - Submission Management
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchCategoryApi } from "../../api/categories";
import {
  fetchSubmissionsApi,
  confirmSubmissionApi,
  rejectSubmissionApi,
  exportSubmissionsApi
} from "../../api/submissions";
import type {
  SubmissionStatus,
  PaymentSubmission
} from "../../types/submission";
import SubmissionTable from "../../components/SubmissionTable";
import SubmissionModal from "../../components/SubmissionModal";

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SubmissionStatus | "all">(
    "pending"
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<PaymentSubmission | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch category
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: () => fetchCategoryApi(id!),
    enabled: !!id
  });

  // Fetch submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ["submissions", id, activeTab],
    queryFn: () =>
      fetchSubmissionsApi(
        id!,
        activeTab === "all" ? undefined : (activeTab as SubmissionStatus)
      ),
    enabled: !!id
  });

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      confirmSubmissionApi(id, note ? { admin_note: note } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", id] });
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      setSelectedSubmission(null);
      toast.success("Submission confirmed successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Failed to confirm submission"
      );
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      rejectSubmissionApi(id, { admin_note: note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", id] });
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      setSelectedSubmission(null);
      toast.success("Submission rejected");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Failed to reject submission"
      );
    }
  });

  const handleExport = async () => {
    if (!id) return;
    try {
      setIsExporting(true);
      const blob = await exportSubmissionsApi(id!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `category_${id}_submissions_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Submissions exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export submissions");
    } finally {
      setIsExporting(false);
    }
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
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
          <p className="text-gray-600 font-medium">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl mb-4 block">⚠️</span>
          <p className="text-gray-900 font-semibold mb-6">Category not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      key: "all",
      label: "All",
      count:
        (category.pending_count || 0) +
        (category.confirmed_count || 0) +
        (category.rejected_count || 0)
    },
    { key: "pending", label: "Pending", count: category.pending_count || 0 },
    {
      key: "confirmed",
      label: "Confirmed",
      count: category.confirmed_count || 0
    },
    { key: "rejected", label: "Rejected", count: category.rejected_count || 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {category.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {category.description || "No description"}
              </p>
              {category.amount_expected && (
                <p className="text-lg font-semibold text-blue-600">
                  Expected Amount: $
                  {typeof category.amount_expected === "number"
                    ? category.amount_expected.toFixed(2)
                    : category.amount_expected}
                </p>
              )}
            </div>
            <button
              onClick={handleExport}
              className="btn-secondary"
              disabled={isExporting || !submissions || submissions.length === 0}
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
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
                  Exporting...
                </span>
              ) : (
                "📊 Export CSV"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              {tab.label}
              <span className="ml-2 font-bold text-sm">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Submissions Table */}
        <div className="card">
          {submissionsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                className="animate-spin h-12 w-12 text-blue-600 mb-4"
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
              <p className="text-gray-600 font-medium">
                Loading submissions...
              </p>
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="text-4xl mb-2">📭</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No submissions yet
              </h3>
              <p className="text-gray-600">
                {activeTab === "pending"
                  ? "No pending submissions to review"
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
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onConfirm={(note) =>
            confirmMutation.mutate({ id: selectedSubmission.id, note })
          }
          onReject={(note) =>
            rejectMutation.mutate({ id: selectedSubmission.id, note })
          }
          isConfirming={confirmMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />
      )}
    </div>
  );
};

export default CategoryDetail;
