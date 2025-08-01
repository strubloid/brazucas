export interface Advertisement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  youtubeUrl?: string;
  advertiserId: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdRequest {
  title: string;
  content: string;
  imageUrl?: string;
  youtubeUrl?: string;
}
