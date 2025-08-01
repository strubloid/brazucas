export interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  authorId: string;
  authorNickname?: string; // Optional for backward compatibility
  createdAt: string;
  updatedAt: string;
  published: boolean;
  approved: boolean | null; // null = pending, true = approved, false = denied
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  published?: boolean;
}

export interface UpdateNewsRequest extends Partial<CreateNewsRequest> {
  id: string;
}
