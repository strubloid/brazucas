export interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
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
