import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../types/api';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      (error) => {
        // If we have a response with validation errors
        if (error.response?.data?.error === 'Validation failed' && error.response?.data?.data) {
          const validationErrors = error.response.data.data;
          const errorMessage = validationErrors.map((err: any) => 
            `${err.field}: ${err.message}`
          ).join(', ');
          
          const apiError: ApiError = {
            message: errorMessage,
            status: error.response?.status || 400,
          };
          return Promise.reject(apiError);
        }

        const apiError: ApiError = {
          message: error.response?.data?.error || error.message || 'An error occurred',
          status: error.response?.status || 500,
        };

        // Handle unauthorized errors
        if (apiError.status === 401) {
          this.removeAuthToken();
          window.location.href = '/login';
        }

        return Promise.reject(apiError);
      }
    );
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }

  public setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }
  
  // Special method for fetching data with cache-busting
  public async getWithCacheBusting<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log(`ApiClient: Cache-busting request to ${url}`);
      
      // Add timestamp to URL for cache busting - use unique value for each request
      const timestamp = Date.now();
      const randomValue = Math.random().toString(36).substring(2, 15);
      const separator = url.includes('?') ? '&' : '?';
      const urlWithTimestamp = `${url}${separator}_t=${timestamp}&_r=${randomValue}`;
      
      // Add cache headers
      const configWithHeaders = {
        ...config,
        headers: {
          ...config?.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        // Set timeout to ensure request doesn't hang
        timeout: 10000
      };
      
      console.log(`ApiClient: Making request to ${urlWithTimestamp} with headers:`, configWithHeaders.headers);
      
      const response = await this.instance.get<ApiResponse<T>>(urlWithTimestamp, configWithHeaders);
      
      if (!response.data) {
        console.error(`ApiClient: Empty response from ${url}`);
        throw new Error('Empty response received');
      }
      
      console.log(`ApiClient: Response from ${url}:`, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`ApiClient: Error making cache-busting request to ${url}:`, error);
      throw error;
    }
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
