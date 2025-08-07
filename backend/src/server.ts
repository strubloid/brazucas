import express from 'express';
import cors from 'cors';
import path from 'path';
import { dbConnection } from './database';

console.log('🚀 Starting Brazucas Backend Server...');
console.log('📊 Environment Variables Check:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`  PORT: ${process.env.PORT || 'NOT SET (will use 3001)'}`);
console.log(`  MONGODB_URI: ${process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 20)}... (${process.env.MONGODB_URI.length} chars)` : 'NOT SET'}`);
console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}... (${process.env.JWT_SECRET.length} chars)` : 'NOT SET'}`);
console.log(`  SESSION_SECRET: ${process.env.SESSION_SECRET ? `${process.env.SESSION_SECRET.substring(0, 10)}... (${process.env.SESSION_SECRET.length} chars)` : 'NOT SET'}`);
console.log(`  ADMIN_SECRET_KEY: ${process.env.ADMIN_SECRET_KEY ? `${process.env.ADMIN_SECRET_KEY.substring(0, 10)}... (${process.env.ADMIN_SECRET_KEY.length} chars)` : 'NOT SET'}`);
console.log(`  JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || 'NOT SET'}`);

console.log('📦 Loading modules...');

// Import all handlers
import { handler as registerHandler } from './register';
import { handler as loginHandler } from './login';
import { handler as meHandler } from './me';
import { handler as newsHandler } from './news';
import { handler as adsHandler } from './ads';
import { handler as serviceCategoriesHandler } from './service-categories';
import { handler as adminStatsHandler } from './admin-stats';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
const buildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(buildPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Convert Netlify function to Express route
const wrapHandler = (handler: any) => {
  return async (req: express.Request, res: express.Response) => {
    try {
      const event = {
        httpMethod: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
        queryStringParameters: req.query,
        path: req.path,
      };

      const response = await handler(event, {});
      
      res.status(response.statusCode);
      if (response.headers) {
        Object.entries(response.headers).forEach(([key, value]) => {
          res.set(key, value as string);
        });
      }
      res.send(response.body);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// API Routes
app.all('/api/register', wrapHandler(registerHandler));
app.all('/api/login', wrapHandler(loginHandler));
app.all('/api/me', wrapHandler(meHandler));
app.all('/api/news', wrapHandler(newsHandler));
app.all('/api/ads', wrapHandler(adsHandler));
app.all('/api/service-categories', wrapHandler(serviceCategoriesHandler));
app.all('/api/admin-stats', wrapHandler(adminStatsHandler));

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Initialize database connection
async function startServer() {
  try {
    await dbConnection.connect();
    console.log('Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
