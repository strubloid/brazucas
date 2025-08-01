export interface Advertisement {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  contactEmail: string;
  authorId: string;
  authorNickname?: string;
  approved: boolean | null; // null = pending, true = approved, false = rejected
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface CreateAdvertisementRequest {
  title: string;
  description: string;
  category: string;
  price: string;
  contactEmail: string;
  published: boolean;
}

export interface UpdateAdvertisementRequest {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  price?: string;
  contactEmail?: string;
  published?: boolean;
}

export interface ApproveAdvertisementRequest {
  id: string;
  approved: boolean;
}
