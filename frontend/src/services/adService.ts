import { apiClient } from './apiClient';
import { Advertisement, CreateAdRequest } from '../types/ads';

export class AdService {
  static async getAllAds(): Promise<Advertisement[]> {
    const response = await apiClient.get<Advertisement[]>('/ads');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch advertisements');
  }

  static async getAdById(id: string): Promise<Advertisement> {
    const response = await apiClient.get<Advertisement>(`/ads?id=${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch advertisement');
  }

  static async createAd(adData: CreateAdRequest): Promise<Advertisement> {
    const response = await apiClient.post<Advertisement>('/ads', adData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to submit advertisement');
  }
}
