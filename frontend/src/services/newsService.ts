import { apiClient } from './apiClient';
import { NewsPost, CreateNewsRequest, UpdateNewsRequest } from '../types/news';

export class NewsService {
  static async getAllNews(): Promise<NewsPost[]> {
    const response = await apiClient.get<NewsPost[]>('/news');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch news');
  }

  static async getPublishedNews(): Promise<NewsPost[]> {
    const response = await apiClient.get<NewsPost[]>('/news?published=true');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch published news');
  }

  static async getNewsById(id: string): Promise<NewsPost> {
    const response = await apiClient.get<NewsPost>(`/news?id=${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch news post');
  }

  static async createNews(newsData: CreateNewsRequest): Promise<NewsPost> {
    const response = await apiClient.post<NewsPost>('/news', newsData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to create news post');
  }

  static async updateNews(newsData: UpdateNewsRequest): Promise<NewsPost> {
    const response = await apiClient.put<NewsPost>('/news', newsData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update news post');
  }

  static async deleteNews(id: string): Promise<void> {
    const response = await apiClient.delete(`/news?id=${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete news post');
    }
  }

  static async getPendingNews(): Promise<NewsPost[]> {
    const response = await apiClient.get<NewsPost[]>('/news?pending=true');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch pending news');
  }

  static async approveNews(id: string, approved: boolean): Promise<NewsPost> {
    const response = await apiClient.patch<NewsPost>('/news', { id, approved });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to approve/reject news post');
  }
}
