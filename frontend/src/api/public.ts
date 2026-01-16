/**
 * Public API functions (no authentication required)
 */
import axios from 'axios';
import { PublicCategory } from '../types/category';
import { PublicSubmissionResponse } from '../types/submission';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchPublicCategoryApi = async (token: string): Promise<PublicCategory> => {
  const { data } = await axios.get<PublicCategory>(`${API_URL}/api/public/categories/${token}`);
  return data;
};

export const submitPaymentApi = async (
  token: string,
  formData: FormData
): Promise<PublicSubmissionResponse> => {
  const { data } = await axios.post<PublicSubmissionResponse>(
    `${API_URL}/api/public/categories/${token}/submissions`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
};
