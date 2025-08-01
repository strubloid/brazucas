import {
  User,
  NewsPost,
  Advertisement,
  CreateUserRequest,
  LoginRequest,
  AuthResponse,
  CreateNewsRequest,
  UpdateNewsRequest,
  CreateAdRequest,
  UserRole,
} from './types';
import {
  IUserRepository,
  INewsRepository,
  IAdRepository,
} from './repositories';
import { AuthService } from './auth';

// Service interfaces (Single Responsibility + Interface Segregation)
export interface IUserService {
  register(userData: CreateUserRequest): Promise<AuthResponse>;
  login(credentials: LoginRequest): Promise<AuthResponse>;
  getUserById(id: string): Promise<Omit<User, 'password'> | null>;
}

export interface INewsService {
  getAllNews(): Promise<NewsPost[]>;
  getNewsById(id: string): Promise<NewsPost | null>;
  createNews(authorId: string, newsData: CreateNewsRequest): Promise<NewsPost>;
  updateNews(authorId: string, newsData: UpdateNewsRequest): Promise<NewsPost>;
  deleteNews(authorId: string, newsId: string): Promise<boolean>;
}

export interface IAdService {
  getAllAds(): Promise<Advertisement[]>;
  getAdById(id: string): Promise<Advertisement | null>;
  createAd(advertiserId: string, adData: CreateAdRequest): Promise<Advertisement>;
  getAdsByAdvertiser(advertiserId: string): Promise<Advertisement[]>;
}

// Service implementations
export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(userData.password);

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    // Generate token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: this.removePassword(user),
    };
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Find user
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await AuthService.comparePassword(
      credentials.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: this.removePassword(user),
    };
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.removePassword(user) : null;
  }

  private removePassword(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export class NewsService implements INewsService {
  constructor(private newsRepository: INewsRepository) {}

  async getAllNews(): Promise<NewsPost[]> {
    return this.newsRepository.findAll();
  }

  async getNewsById(id: string): Promise<NewsPost | null> {
    return this.newsRepository.findById(id);
  }

  async createNews(authorId: string, newsData: CreateNewsRequest): Promise<NewsPost> {
    return this.newsRepository.create({
      ...newsData,
      authorId,
      published: newsData.published ?? false,
    });
  }

  async updateNews(authorId: string, newsData: UpdateNewsRequest): Promise<NewsPost> {
    const existingNews = await this.newsRepository.findById(newsData.id);
    if (!existingNews) {
      throw new Error('News post not found');
    }

    // Only allow author to update their own posts
    if (existingNews.authorId !== authorId) {
      throw new Error('Unauthorized to update this news post');
    }

    const { id, ...updates } = newsData;
    return this.newsRepository.update(id, updates);
  }

  async deleteNews(authorId: string, newsId: string): Promise<boolean> {
    const existingNews = await this.newsRepository.findById(newsId);
    if (!existingNews) {
      throw new Error('News post not found');
    }

    // Only allow author to delete their own posts
    if (existingNews.authorId !== authorId) {
      throw new Error('Unauthorized to delete this news post');
    }

    return this.newsRepository.delete(newsId);
  }
}

export class AdService implements IAdService {
  constructor(private adRepository: IAdRepository) {}

  async getAllAds(): Promise<Advertisement[]> {
    return this.adRepository.findAll();
  }

  async getAdById(id: string): Promise<Advertisement | null> {
    return this.adRepository.findById(id);
  }

  async createAd(advertiserId: string, adData: CreateAdRequest): Promise<Advertisement> {
    // Check if advertiser already has an ad
    const existingAds = await this.adRepository.findByAdvertiser(advertiserId);
    if (existingAds.length > 0) {
      throw new Error('Advertiser can only submit one advertisement');
    }

    return this.adRepository.create({
      ...adData,
      advertiserId,
      approved: false, // Ads need approval by default
    });
  }

  async getAdsByAdvertiser(advertiserId: string): Promise<Advertisement[]> {
    return this.adRepository.findByAdvertiser(advertiserId);
  }
}
