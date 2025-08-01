import { apiClient } from './apiClient';
import { Advertisement, CreateAdvertisementRequest, UpdateAdvertisementRequest, ApproveAdvertisementRequest } from '../types/ads';

export class AdService {
  static async getAllAds(): Promise<Advertisement[]> {
    const response = await apiClient.get<Advertisement[]>('/ads');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch advertisements');
  }

  static async getPublishedAds(): Promise<Advertisement[]> {
    const response = await apiClient.get<Advertisement[]>('/ads?published=true');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch published advertisements');
  }

  static async getPendingAds(): Promise<Advertisement[]> {
    const response = await apiClient.get<Advertisement[]>('/ads?pending=true');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch pending advertisements');
  }

  static async getMyAds(): Promise<Advertisement[]> {
    const response = await apiClient.get<Advertisement[]>('/ads?my=true');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch my advertisements');
  }

  static async getAdById(id: string): Promise<Advertisement> {
    const response = await apiClient.get<Advertisement>(`/ads?id=${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch advertisement');
  }

  static async createAd(adData: CreateAdvertisementRequest): Promise<Advertisement> {
    const response = await apiClient.post<Advertisement>('/ads', adData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to create advertisement');
  }

  static async updateAd(adData: UpdateAdvertisementRequest): Promise<Advertisement> {
    const response = await apiClient.put<Advertisement>('/ads', adData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update advertisement');
  }

  static async deleteAd(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`/ads?id=${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete advertisement');
    }
  }

  static async approveAd(request: ApproveAdvertisementRequest): Promise<Advertisement> {
    const response = await apiClient.patch<Advertisement>('/ads', request);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to approve advertisement');
  }
}
