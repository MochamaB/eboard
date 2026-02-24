/**
 * API Client
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// API base URL - will be configured based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const ACCESS_TOKEN_KEY = 'eboard_access_token';
const REFRESH_TOKEN_KEY = 'eboard_refresh_token';

// Token management functions
export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  
  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  
  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  setTokens: (accessToken: string, refreshToken?: string): void => {
    tokenManager.setAccessToken(accessToken);
    if (refreshToken) {
      tokenManager.setRefreshToken(refreshToken);
    }
  },
};

// Request interceptor - attach auth token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - unwrap ApiResponse<T> envelope and handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps all responses in ApiResponse<T>: { success, data, message, errors }
    // Unwrap so downstream code gets the actual payload directly
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success && response.data.data !== undefined) {
        response.data = response.data.data;
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Don't intercept 401 on auth endpoints — let the caller handle it
      const url = originalRequest?.url || '';
      if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/dev-users')) {
        return Promise.reject(error);
      }

      // Clear tokens and redirect to login
      tokenManager.clearTokens();
      
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/auth')) {
        // Save current location to redirect back after login
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth/login?returnUrl=${returnUrl}`;
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied:', originalRequest?.url);
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
