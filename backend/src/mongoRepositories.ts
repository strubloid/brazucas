import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
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
    const result = await this.collection.findOne({ _id: new ObjectId(id) }) as any;
    if (!result) return null;
    
    return {
      ...result,
      id: result._id.toString(),
    } as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.collection.findOne({ email }) as any;
    if (!result) return null;
    
    return {
      ...result,
      id: result._id.toString(),
    } as User;
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
      { _id: new ObjectId(id) },
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
    const results = await this.collection.find({}).sort({ createdAt: -1 }).toArray() as any[];
    return results.map(result => ({
      ...result,
      id: result._id.toString(),
    })) as NewsPost[];
  }

  async findById(id: string): Promise<NewsPost | null> {
    const result = await this.collection.findOne({ _id: new ObjectId(id) }) as any;
    if (!result) return null;
    
    return {
      ...result,
      id: result._id.toString(),
    } as NewsPost;
  }

  async findByAuthor(authorId: string): Promise<NewsPost[]> {
    const results = await this.collection.find({ authorId }).sort({ createdAt: -1 }).toArray() as any[];
    return results.map(result => ({
      ...result,
      id: result._id.toString(),
    })) as NewsPost[];
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
      { _id: new ObjectId(id) },
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
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

export class MongoAdRepository implements IAdRepository {
  private collection: Collection<Advertisement>;

  constructor(db: Db) {
    this.collection = db.collection<Advertisement>('advertisements');
  }

  async findAll(): Promise<Advertisement[]> {
    const ads = await this.collection.find({}).sort({ createdAt: -1 }).toArray();
    return ads.map(ad => ({
      ...ad,
      id: ad._id.toString(),
    })) as Advertisement[];
  }

  async findById(id: string): Promise<Advertisement | null> {
    const ad = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!ad) return null;
    
    return {
      ...ad,
      id: ad._id.toString(),
    } as Advertisement;
  }

  async findByAdvertiser(authorId: string): Promise<Advertisement[]> {
    const ads = await this.collection.find({ authorId }).sort({ createdAt: -1 }).toArray();
    return ads.map(ad => ({
      ...ad,
      id: ad._id.toString(),
    })) as Advertisement[];
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
      { _id: new ObjectId(id) },
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
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}
