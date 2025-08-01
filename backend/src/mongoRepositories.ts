import { MongoClient, Db, Collection } from 'mongodb';
import { User, NewsPost, Advertisement } from './types';
import { IUserRepository, INewsRepository, IAdRepository } from './repositories';

export class MongoUserRepository implements IUserRepository {
  private collection: Collection<User>;

  constructor(db: Db) {
    this.collection = db.collection<User>('users');
    // Create unique index on email
    this.collection.createIndex({ email: 1 }, { unique: true });
  }

  async findById(id: string): Promise<User | null> {
    return await this.collection.findOne({ _id: id as any }) as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.collection.findOne({ email }) as User | null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(user as any);
    
    return {
      ...user,
      id: result.insertedId.toString(),
    } as User;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id as any },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('User not found');
    }

    return {
      ...result,
      id: result._id.toString(),
    } as User;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id as any });
    return result.deletedCount > 0;
  }
}

export class MongoNewsRepository implements INewsRepository {
  private collection: Collection<NewsPost>;

  constructor(db: Db) {
    this.collection = db.collection<NewsPost>('news');
  }

  async findAll(): Promise<NewsPost[]> {
    return await this.collection.find({}).sort({ createdAt: -1 }).toArray() as NewsPost[];
  }

  async findById(id: string): Promise<NewsPost | null> {
    return await this.collection.findOne({ _id: id as any }) as NewsPost | null;
  }

  async findByAuthor(authorId: string): Promise<NewsPost[]> {
    return await this.collection.find({ authorId }).sort({ createdAt: -1 }).toArray() as NewsPost[];
  }

  async create(newsData: Omit<NewsPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsPost> {
    const news = {
      ...newsData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(news as any);
    
    return {
      ...news,
      id: result.insertedId.toString(),
    } as NewsPost;
  }

  async update(id: string, updates: Partial<NewsPost>): Promise<NewsPost> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id as any },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('News post not found');
    }

    return {
      ...result,
      id: result._id.toString(),
    } as NewsPost;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id as any });
    return result.deletedCount > 0;
  }
}

export class MongoAdRepository implements IAdRepository {
  private collection: Collection<Advertisement>;

  constructor(db: Db) {
    this.collection = db.collection<Advertisement>('advertisements');
  }

  async findAll(): Promise<Advertisement[]> {
    return await this.collection.find({}).sort({ createdAt: -1 }).toArray() as Advertisement[];
  }

  async findById(id: string): Promise<Advertisement | null> {
    return await this.collection.findOne({ _id: id as any }) as Advertisement | null;
  }

  async findByAdvertiser(advertiserId: string): Promise<Advertisement[]> {
    return await this.collection.find({ advertiserId }).sort({ createdAt: -1 }).toArray() as Advertisement[];
  }

  async create(adData: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Advertisement> {
    const ad = {
      ...adData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(ad as any);
    
    return {
      ...ad,
      id: result.insertedId.toString(),
    } as Advertisement;
  }

  async update(id: string, updates: Partial<Advertisement>): Promise<Advertisement> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id as any },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Advertisement not found');
    }

    return {
      ...result,
      id: result._id.toString(),
    } as Advertisement;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id as any });
    return result.deletedCount > 0;
  }
}
