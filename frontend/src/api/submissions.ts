/**
 * Submission API functions
 */
import apiClient from './client';
import {
  PaymentSubmission,
  ConfirmSubmissionRequest,
  RejectSubmissionRequest,
  SubmissionStatus
} from '../types/submission';

export const fetchSubmissionsApi = async (
  categoryId: string,
  statusFilter?: SubmissionStatus
): Promise<PaymentSubmission[]> => {
  const params = statusFilter ? { status_filter: statusFilter } : {};
  const { data } = await apiClient.get<PaymentSubmission[]>(
    `/api/categories/${categoryId}/submissions`,
    { params }
  );
  return data;
};

export const fetchSubmissionApi = async (id: string): Promise<PaymentSubmission> => {
  const { data } = await apiClient.get<PaymentSubmission>(`/api/submissions/${id}`);
  return data;
};

export const confirmSubmissionApi = async (
  id: string,
  request?: ConfirmSubmissionRequest
): Promise<PaymentSubmission> => {
  const { data } = await apiClient.patch<PaymentSubmission>(
    `/api/submissions/${id}/confirm`,
    request || {}
  );
  return data;
};

export const rejectSubmissionApi = async (
  id: string,
  request: RejectSubmissionRequest
): Promise<PaymentSubmission> => {
  const { data } = await apiClient.patch<PaymentSubmission>(
    `/api/submissions/${id}/reject`,
    request
  );
  return data;
};

export const exportSubmissionsApi = async (categoryId: string): Promise<Blob> => {
  const { data } = await apiClient.get(`/api/categories/${categoryId}/export.csv`, {
    responseType: 'blob',
  });
  return data;
};
