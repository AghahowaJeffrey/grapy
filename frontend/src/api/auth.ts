/**
 * Authentication API functions
 */
import apiClient from './client';
import { LoginRequest, RegisterRequest, TokenResponse } from '../types/auth';

export const loginApi = async (credentials: LoginRequest): Promise<TokenResponse> => {
  const { data } = await apiClient.post<TokenResponse>('/api/auth/login', credentials);
  return data;
};

export const registerApi = async (userData: RegisterRequest): Promise<TokenResponse> => {
  const { data } = await apiClient.post<TokenResponse>('/api/auth/register', userData);
  return data;
};

export const refreshTokenApi = async (refreshToken: string): Promise<TokenResponse> => {
  const { data } = await apiClient.post<TokenResponse>('/api/auth/refresh', {
    refresh_token: refreshToken,
  });
  return data;
};
