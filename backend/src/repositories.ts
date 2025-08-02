import { User, NewsPost, Advertisement, UserRole } from './types';

// Repository interfaces (Dependency Inversion Principle)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

export interface INewsRepository {
  findAll(): Promise<NewsPost[]>;
  findById(id: string): Promise<NewsPost | null>;
  findByAuthor(authorId: string): Promise<NewsPost[]>;
  create(news: Omit<NewsPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsPost>;
  update(id: string, updates: Partial<NewsPost>): Promise<NewsPost>;
  delete(id: string): Promise<boolean>;
}

export interface IAdRepository {
  findAll(): Promise<Advertisement[]>;
  findById(id: string): Promise<Advertisement | null>;
  findByAdvertiser(authorId: string): Promise<Advertisement[]>;
  create(ad: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Advertisement>;
  update(id: string, updates: Partial<Advertisement>): Promise<Advertisement>;
  delete(id: string): Promise<boolean>;
}

// In-memory implementations (can be replaced with real database later)
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];
  private nextId = 1;

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: this.nextId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.nextId++;
    this.users.push(user);
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.users[userIndex];
  }

  async delete(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }
    
    this.users.splice(userIndex, 1);
    return true;
  }

  async count(): Promise<number> {
    return this.users.length;
  }
}

export class InMemoryNewsRepository implements INewsRepository {
  private news: NewsPost[] = [];
  private nextId = 1;

  async findAll(): Promise<NewsPost[]> {
    return this.news.filter(post => post.published);
  }

  async findById(id: string): Promise<NewsPost | null> {
    return this.news.find(post => post.id === id) || null;
  }

  async findByAuthor(authorId: string): Promise<NewsPost[]> {
    return this.news.filter(post => post.authorId === authorId);
  }

  async create(newsData: Omit<NewsPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsPost> {
    const post: NewsPost = {
      ...newsData,
      id: this.nextId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.nextId++;
    this.news.push(post);
    return post;
  }

  async update(id: string, updates: Partial<NewsPost>): Promise<NewsPost> {
    const postIndex = this.news.findIndex(post => post.id === id);
    if (postIndex === -1) {
      throw new Error('News post not found');
    }
    
    this.news[postIndex] = {
      ...this.news[postIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.news[postIndex];
  }

  async delete(id: string): Promise<boolean> {
    const postIndex = this.news.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return false;
    }
    
    this.news.splice(postIndex, 1);
    return true;
  }
}

export class InMemoryAdRepository implements IAdRepository {
  private ads: Advertisement[] = [];
  private nextId = 1;

  async findAll(): Promise<Advertisement[]> {
    return this.ads.filter(ad => ad.approved);
  }

  async findById(id: string): Promise<Advertisement | null> {
    return this.ads.find(ad => ad.id === id) || null;
  }

  async findByAdvertiser(authorId: string): Promise<Advertisement[]> {
    return this.ads.filter(ad => ad.authorId === authorId);
  }

  async create(adData: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Advertisement> {
    const ad: Advertisement = {
      ...adData,
      id: this.nextId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.nextId++;
    this.ads.push(ad);
    return ad;
  }

  async update(id: string, updates: Partial<Advertisement>): Promise<Advertisement> {
    const adIndex = this.ads.findIndex(ad => ad.id === id);
    if (adIndex === -1) {
      throw new Error('Advertisement not found');
    }
    
    this.ads[adIndex] = {
      ...this.ads[adIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.ads[adIndex];
  }

  async delete(id: string): Promise<boolean> {
    const adIndex = this.ads.findIndex(ad => ad.id === id);
    if (adIndex === -1) {
      return false;
    }
    
    this.ads.splice(adIndex, 1);
    return true;
  }
}
