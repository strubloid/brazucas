import {
  User,
  NewsPost,
  Advertisement,
  CreateUserRequest,
  LoginRequest,
  AuthResponse,
  CreateNewsRequest,
  UpdateNewsRequest,
  CreateAdvertisementRequest,
  UpdateAdvertisementRequest,
  ApproveAdvertisementRequest,
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
  getPublishedNews(): Promise<NewsPost[]>;
  getPendingNews(): Promise<NewsPost[]>;
  getMyNews(userId: string): Promise<NewsPost[]>;
  getNewsById(id: string): Promise<NewsPost | null>;
  createNews(authorId: string, newsData: CreateNewsRequest): Promise<NewsPost>;
  updateNews(authorId: string, newsData: UpdateNewsRequest): Promise<NewsPost>;
  deleteNews(authorId: string, newsId: string): Promise<boolean>;
  approveNews(newsId: string, approved: boolean): Promise<NewsPost>;
}

export interface IAdService {
  getAllAds(): Promise<Advertisement[]>;
  getPublishedAds(): Promise<Advertisement[]>;
  getPendingAds(): Promise<Advertisement[]>;
  getMyAds(userId: string): Promise<Advertisement[]>;
  getAdById(id: string): Promise<Advertisement | null>;
  createAd(authorId: string, adData: CreateAdvertisementRequest): Promise<Advertisement>;
  updateAd(authorId: string, adData: UpdateAdvertisementRequest): Promise<Advertisement>;
  deleteAd(authorId: string, adId: string): Promise<boolean>;
  approveAd(adId: string, approved: boolean): Promise<Advertisement>;
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
  constructor(
    private newsRepository: INewsRepository,
    private userRepository: IUserRepository
  ) {}

  private async enrichWithAuthorNickname(newsPost: NewsPost): Promise<NewsPost> {
    try {
      const author = await this.userRepository.findById(newsPost.authorId);
      return {
        ...newsPost,
        authorNickname: author?.nickname || 'Usuário Desconhecido'
      };
    } catch (error) {
      console.warn('Failed to fetch author nickname for post:', newsPost.id, error);
      return {
        ...newsPost,
        authorNickname: 'Usuário Desconhecido'
      };
    }
  }

  private async enrichNewsListWithAuthorNicknames(newsList: NewsPost[]): Promise<NewsPost[]> {
    return Promise.all(newsList.map(news => this.enrichWithAuthorNickname(news)));
  }

  async getAllNews(): Promise<NewsPost[]> {
    const newsList = await this.newsRepository.findAll();
    return this.enrichNewsListWithAuthorNicknames(newsList);
  }

  async getPublishedNews(): Promise<NewsPost[]> {
    const allNews = await this.newsRepository.findAll();
    // Only return published AND approved news for public viewing
    const filteredNews = allNews.filter(news => news.published && news.approved === true);
    return this.enrichNewsListWithAuthorNicknames(filteredNews);
  }

  async getNewsById(id: string): Promise<NewsPost | null> {
    const newsPost = await this.newsRepository.findById(id);
    if (!newsPost) return null;
    return this.enrichWithAuthorNickname(newsPost);
  }

  async createNews(authorId: string, newsData: CreateNewsRequest): Promise<NewsPost> {
    return this.newsRepository.create({
      ...newsData,
      authorId,
      published: newsData.published ?? false,
      approved: null, // All new posts start as pending approval
    });
  }

  async getPendingNews(): Promise<NewsPost[]> {
    const allNews = await this.newsRepository.findAll();
    console.log('Debug - All news posts:', allNews.length);
    console.log('Debug - News approval statuses:', allNews.map(n => ({ id: n.id, title: n.title, approved: n.approved, published: n.published })));
    
    // Return posts that are pending approval (approved is null AND published is true)
    // This excludes drafts (published: false) from the pending queue
    const pending = allNews.filter(news => news.approved === null && news.published === true);
    console.log('Debug - Pending news found (excluding drafts):', pending.length);
    
    return this.enrichNewsListWithAuthorNicknames(pending);
  }

  async getMyNews(userId: string): Promise<NewsPost[]> {
    const allNews = await this.newsRepository.findAll();
    
    // Return only posts by the current user
    const myNews = allNews.filter(news => news.authorId === userId);
    
    return this.enrichNewsListWithAuthorNicknames(myNews);
  }

  async approveNews(newsId: string, approved: boolean): Promise<NewsPost> {
    const existingNews = await this.newsRepository.findById(newsId);
    if (!existingNews) {
      throw new Error('News post not found');
    }

    const updatedNews = await this.newsRepository.update(newsId, { 
      approved, 
      approvedAt: new Date() 
    });

    return this.enrichWithAuthorNickname(updatedNews);
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
  constructor(
    private adRepository: IAdRepository,
    private userRepository: IUserRepository
  ) {}

  async getAllAds(): Promise<Advertisement[]> {
    const allAds = await this.adRepository.findAll();
    return this.enrichAdsListWithAuthorNicknames(allAds);
  }

  async getPublishedAds(): Promise<Advertisement[]> {
    const allAds = await this.adRepository.findAll();
    const publishedAds = allAds.filter(ad => ad.published && ad.approved === true);
    return this.enrichAdsListWithAuthorNicknames(publishedAds);
  }

  async getPendingAds(): Promise<Advertisement[]> {
    const allAds = await this.adRepository.findAll();
    console.log('Debug - All ads:', allAds.length);
    console.log('Debug - Ads approval statuses:', allAds.map(a => ({ id: a.id, title: a.title, approved: a.approved, published: a.published })));
    
    // Return ads that are pending approval (approved is null AND published is true)
    // This excludes drafts (published: false) from the pending queue
    const pending = allAds.filter(ad => ad.approved === null && ad.published === true);
    console.log('Debug - Pending ads found (excluding drafts):', pending.length);
    
    return this.enrichAdsListWithAuthorNicknames(pending);
  }

  async getMyAds(userId: string): Promise<Advertisement[]> {
    const allAds = await this.adRepository.findAll();
    
    // Return only ads by the current user
    const myAds = allAds.filter(ad => ad.authorId === userId);
    
    return this.enrichAdsListWithAuthorNicknames(myAds);
  }

  async getAdById(id: string): Promise<Advertisement | null> {
    const ad = await this.adRepository.findById(id);
    if (!ad) return null;
    
    return this.enrichAdWithAuthorNickname(ad);
  }

  async createAd(authorId: string, adData: CreateAdvertisementRequest): Promise<Advertisement> {
    const ad = await this.adRepository.create({
      ...adData,
      authorId,
      approved: null, // null = pending approval
      approvedAt: undefined,
    });

    return this.enrichAdWithAuthorNickname(ad);
  }

  async updateAd(authorId: string, adData: UpdateAdvertisementRequest): Promise<Advertisement> {
    // Get existing ad
    const existingAd = await this.adRepository.findById(adData.id);
    if (!existingAd) {
      throw new Error('Advertisement not found');
    }

    // Check ownership (non-admin users can only update their own ads)
    if (existingAd.authorId !== authorId) {
      throw new Error('You can only update your own advertisements');
    }

    // Build update object with only provided fields
    const updateFields: Partial<Advertisement> = {};
    
    if (adData.title !== undefined) updateFields.title = adData.title;
    if (adData.description !== undefined) updateFields.description = adData.description;
    if (adData.category !== undefined) updateFields.category = adData.category;
    if (adData.price !== undefined) updateFields.price = adData.price;
    if (adData.contactEmail !== undefined) updateFields.contactEmail = adData.contactEmail;
    if (adData.published !== undefined) updateFields.published = adData.published;
    
    // Handle approval logic
    if (adData.published !== undefined) {
      updateFields.approved = adData.published ? null : existingAd.approved;
      updateFields.approvedAt = adData.published ? undefined : existingAd.approvedAt;
    }

    const updatedAd = await this.adRepository.update(adData.id, updateFields);

    return this.enrichAdWithAuthorNickname(updatedAd);
  }

  async deleteAd(authorId: string, adId: string): Promise<boolean> {
    // Get existing ad
    const existingAd = await this.adRepository.findById(adId);
    if (!existingAd) {
      return false;
    }

    // Check ownership (non-admin users can only delete their own ads)
    if (existingAd.authorId !== authorId) {
      throw new Error('You can only delete your own advertisements');
    }

    return this.adRepository.delete(adId);
  }

  async approveAd(adId: string, approved: boolean): Promise<Advertisement> {
    const existingAd = await this.adRepository.findById(adId);
    if (!existingAd) {
      throw new Error('Advertisement not found');
    }

    const updatedAd = await this.adRepository.update(adId, {
      approved,
      approvedAt: new Date(),
    });

    return this.enrichAdWithAuthorNickname(updatedAd);
  }

  private async enrichAdWithAuthorNickname(ad: Advertisement): Promise<Advertisement> {
    try {
      const author = await this.userRepository.findById(ad.authorId);
      return {
        ...ad,
        authorNickname: author?.nickname || 'Usuário Desconhecido'
      };
    } catch (error) {
      console.error('Error enriching ad with author nickname:', error);
      return {
        ...ad,
        authorNickname: 'Usuário Desconhecido'
      };
    }
  }

  private async enrichAdsListWithAuthorNicknames(ads: Advertisement[]): Promise<Advertisement[]> {
    return Promise.all(ads.map(ad => this.enrichAdWithAuthorNickname(ad)));
  }
}
