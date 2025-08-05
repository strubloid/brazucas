import { apiClient } from './apiClient';
import { ServiceCategory, CreateServiceCategoryRequest } from '../types/serviceCategory';

export class ServiceCategoryService {
  static async getAllCategories(): Promise<ServiceCategory[]> {
    const response = await apiClient.get<ServiceCategory[]>('/service-categories');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch service categories');
  }

  static async getActiveCategories(): Promise<ServiceCategory[]> {
    const response = await apiClient.get<ServiceCategory[]>('/service-categories?active=true');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch active service categories');
  }

  static async getCategoryById(id: string): Promise<ServiceCategory> {
    const response = await apiClient.get<ServiceCategory>(`/service-categories?id=${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch service category');
  }

  static async createCategory(data: CreateServiceCategoryRequest): Promise<ServiceCategory> {
    const response = await apiClient.post<ServiceCategory>('/service-categories', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to create service category');
  }

  static async updateCategory(id: string, data: Partial<ServiceCategory>): Promise<ServiceCategory> {
    const response = await apiClient.put<ServiceCategory>(`/service-categories?id=${id}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update service category');
  }

  static async deleteCategory(id: string): Promise<{ id: string; deleted: boolean }> {
    const response = await apiClient.delete<{ id: string; deleted: boolean }>(`/service-categories?id=${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to delete service category');
  }
}
