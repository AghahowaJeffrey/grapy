/**
 * Category API functions
 */
import apiClient from './client';
import { Category, CategoryCreate, CategoryUpdate } from '../types/category';

export const fetchCategoriesApi = async (): Promise<Category[]> => {
  const { data } = await apiClient.get<Category[]>('/api/categories');
  return data;
};

export const fetchCategoryApi = async (id: string): Promise<Category> => {
  const { data } = await apiClient.get<Category>(`/api/categories/${id}`);
  return data;
};

export const createCategoryApi = async (categoryData: CategoryCreate): Promise<Category> => {
  const { data} = await apiClient.post<Category>('/api/categories', categoryData);
  return data;
};

export const updateCategoryApi = async (id: string, categoryData: CategoryUpdate): Promise<Category> => {
  const { data } = await apiClient.patch<Category>(`/api/categories/${id}`, categoryData);
  return data;
};

export const deactivateCategoryApi = async (id: string): Promise<void> => {
  await apiClient.post(`/api/categories/${id}/deactivate`);
};

export const activateCategoryApi = async (id: string): Promise<void> => {
  await apiClient.post(`/api/categories/${id}/activate`);
};
