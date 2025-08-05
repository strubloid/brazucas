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
  _updatedAt?: number; // Internal timestamp to force re-renders
}

export class StatisticsService {
  static async getDashboardStatistics(): Promise<DashboardStatistics> {
    try {
      console.log('StatisticsService: Fetching dashboard statistics');
      // Use the getWithCacheBusting method for reliable cache prevention
      const response = await apiClient.getWithCacheBusting<{
        users: number;
        news: { published: number; draft: number; total: number; pendingApproval: number };
        ads: { published: number; draft: number; total: number; pendingApproval: number };
        timestamp?: number;
      }>('/admin-stats');
      
      console.log('StatisticsService: Response received', response);
      
      if (response.success && response.data) {
        const data = response.data;
        console.log('StatisticsService: Processing data:', data);
        
        // Validate the data structure
        if (!data || !data.news || !data.ads) {
          console.error('StatisticsService: Invalid data structure', data);
          throw new Error('Invalid statistics data structure');
        }
        
        // Get pending posts and ads from the new fields or fallback to calculating them
        const pendingPosts = data.news.pendingApproval !== undefined ? 
          data.news.pendingApproval : 
          data.news.draft;
          
        const pendingAds = data.ads.pendingApproval !== undefined ? 
          data.ads.pendingApproval : 
          data.ads.draft;
        
        const stats = {
          totalUsers: data.users || 0,
          totalNews: data.news.total || 0,
          publishedNews: data.news.published || 0,
          draftNews: data.news.draft || 0,
          totalAds: data.ads.total || 0,
          publishedAds: data.ads.published || 0,
          draftAds: data.ads.draft || 0,
          pendingPosts: pendingPosts || 0, // Posts awaiting approval
          pendingAds: pendingAds || 0, // Ads awaiting approval
          _updatedAt: Date.now() // Add timestamp to force re-renders
        };
        
        console.log('StatisticsService: Processed statistics:', stats);
        return stats;
      }
      
      console.error('StatisticsService: Failed response', response);
      throw new Error(response.error || 'Failed to get statistics');
    } catch (error) {
      console.error('StatisticsService: Error fetching statistics:', error);
      
      // Throw the error to be handled by the caller
      throw error;
    }
  }

  static async getUserCount(): Promise<number> {
    try {
      // Add cache-busting query parameter to prevent caching
      const timestamp = new Date().getTime();
      // Use the new admin-stats endpoint to get all users count with no-cache headers
      const response = await apiClient.get<{
        users: number;
      }>(`/admin-stats?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.success && response.data) {
        return response.data.users;
      }
      
      throw new Error('User count endpoint not available');
    } catch (error) {
      return 0;
    }
  }
}
