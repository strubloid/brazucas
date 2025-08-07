import { apiClient } from './apiClient';

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  adsCount: number;
  newsCount: number;
}

export class CategoryStatsService {
  static async getCategoryStats(): Promise<CategoryStats[]> {
    const response = await apiClient.get<CategoryStats[]>('/service-categories/stats');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch category stats');
  }
}
