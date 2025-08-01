import { MongoClient, Db } from 'mongodb';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    try {
      this.client = new MongoClient(mongoUri);
      await this.client.connect();
      
      // Use the database name from the URI or default to 'brazucas'
      const dbName = this.extractDatabaseName(mongoUri) || 'brazucas';
      this.db = this.client.db(dbName);
      
      console.log('Connected to MongoDB successfully');
      return this.db;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  private extractDatabaseName(uri: string): string | null {
    try {
      const url = new URL(uri);
      return url.pathname.substring(1) || null;
    } catch {
      return null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }
}

export const dbConnection = DatabaseConnection.getInstance();
