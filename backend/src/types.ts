export interface User {
  id: string;
  email: string;
  nickname: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  NORMAL = 'normal',
  ADMIN = 'admin',
  ADVERTISER = 'advertiser',
}

export interface CreateUserRequest {
  email: string;
  nickname: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface Advertisement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  youtubeUrl?: string;
  advertiserId: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdRequest {
  title: string;
  content: string;
  imageUrl?: string;
  youtubeUrl?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}
