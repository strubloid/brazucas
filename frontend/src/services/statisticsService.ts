import { apiClient } from './apiClient';

export interface DashboardStatistics {
  totalUsers: number;
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  totalAds: number;
  publishedAds: number;
  draftAds: number;
  pendingPosts: number;
  pendingAds: number;
}

export class StatisticsService {
  static async getDashboardStatistics(): Promise<DashboardStatistics> {
    try {
      // Use the new admin-stats endpoint
      const response = await apiClient.get<{
        users: number;
        news: { published: number; draft: number; total: number };
        ads: { published: number; draft: number; total: number };
      }>('/admin-stats');
      
      if (response.success && response.data) {
        const data = response.data;
        return {
          totalUsers: data.users,
          totalNews: data.news.total,
          publishedNews: data.news.published,
          draftNews: data.news.draft,
          totalAds: data.ads.total,
          publishedAds: data.ads.published,
          draftAds: data.ads.draft,
          pendingPosts: data.news.draft, // Draft news are pending
          pendingAds: data.ads.draft, // Draft ads are pending
        };
      }
      
      throw new Error(response.error || 'Failed to get statistics');
    } catch (error) {
      // Fallback: Return basic statistics
      console.warn('Statistics endpoint not available, using fallback:', error);
      return {
        totalUsers: 0,
        totalNews: 0,
        publishedNews: 0,
        draftNews: 0,
        totalAds: 0,
        publishedAds: 0,
        draftAds: 0,
        pendingPosts: 0,
        pendingAds: 0
      };
    }
  }

  static async getUserCount(): Promise<number> {
    try {
      // Use the new admin-stats endpoint
      const response = await apiClient.get<{
        users: number;
      }>('/admin-stats');
      
      if (response.success && response.data) {
        return response.data.users;
      }
      
      throw new Error('User count endpoint not available');
    } catch (error) {
      console.warn('User count endpoint not available, using fallback:', error);
      return 0;
    }
  }
}
