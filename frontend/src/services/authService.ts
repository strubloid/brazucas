import { apiClient } from './apiClient';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/login', credentials);
    
    if (response.success && response.data) {
      apiClient.setAuthToken(response.data.token);
      return response.data;
    }
    
    throw new Error(response.error || 'Login failed');
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/register', userData);
    
    if (response.success && response.data) {
      apiClient.setAuthToken(response.data.token);
      return response.data;
    }
    
    throw new Error(response.error || 'Registration failed');
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/me');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get user data');
  }

  static logout(): void {
    localStorage.removeItem('authToken');
  }

  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
