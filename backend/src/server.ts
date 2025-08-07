import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { dbConnection } from './database';

// Load environment variables from .env file
dotenv.config();

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
console.log('📂 Loading route handlers...');
import { handler as registerHandler } from './register';
console.log('  ✅ Register handler loaded');
import { handler as loginHandler } from './login';
console.log('  ✅ Login handler loaded');
import { handler as meHandler } from './me';
console.log('  ✅ Me handler loaded');
import { handler as newsHandler } from './news';
console.log('  ✅ News handler loaded');
import { handler as adsHandler } from './ads';
console.log('  ✅ Ads handler loaded');
import { handler as serviceCategoriesHandler } from './service-categories';
console.log('  ✅ Service categories handler loaded');
import { handler as adminStatsHandler } from './admin-stats';
console.log('  ✅ Admin stats handler loaded');

console.log('🔧 Initializing Express app...');
const app = express();
const PORT = process.env.PORT || 4444;
console.log(`🚪 Server will run on port: ${PORT}`);

// Middleware
console.log('🔧 Setting up middleware...');
app.use(cors());
console.log('  ✅ CORS middleware configured');
app.use(express.json());
console.log('  ✅ JSON parser middleware configured');

// Serve static files from React build
console.log('📁 Setting up static file serving...');
const buildPath = path.join(__dirname, '../../frontend/build');
console.log(`  📂 Build path: ${buildPath}`);
app.use(express.static(buildPath));
console.log('  ✅ Static file middleware configured');

// Health check
console.log('🏥 Setting up health check endpoint...');
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
console.log('  ✅ Health check endpoint configured');

// Convert handler function to Express route
console.log('🔄 Setting up route wrapper...');
const wrapHandler = (handler: any) => {
  return async (req: express.Request, res: express.Response) => {
    try {
      // Convert Express request to event format
      const event = {
        httpMethod: req.method,
        headers: req.headers,
        body: req.body ? JSON.stringify(req.body) : null,
        queryStringParameters: req.query || {},
        path: req.path,
        rawQuery: req.url?.split('?')[1] || '',
        rawUrl: req.url || '',
      };

      // Convert Express context to handler context
      const context = {
        functionName: req.path.replace('/api/', ''),
        functionVersion: '1',
        invokedFunctionArn: '',
        memoryLimitInMB: '1024',
        getRemainingTimeInMillis: () => 30000,
      };

      console.log(`📞 Calling handler for ${req.method} ${req.path}`);
      const response = await handler(event, context);
      
      // Convert handler response back to Express response
      if (response.statusCode) {
        res.status(response.statusCode);
      }
      
      if (response.headers) {
        Object.entries(response.headers).forEach(([key, value]) => {
          res.set(key, value as string);
        });
      }
      
      // Handle different response body types
      if (response.body) {
        try {
          // Try to parse as JSON first
          const jsonBody = JSON.parse(response.body);
          res.json(jsonBody);
        } catch {
          // If not JSON, send as text
          res.send(response.body);
        }
      } else {
        res.status(response.statusCode || 500).end();
      }
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
console.log('  ✅ Route wrapper configured');

// API Routes
console.log('🛣️  Setting up API routes...');
app.all('/api/register', wrapHandler(registerHandler));
console.log('  ✅ /api/register route configured');
app.all('/api/login', wrapHandler(loginHandler));
console.log('  ✅ /api/login route configured');
app.all('/api/me', wrapHandler(meHandler));
console.log('  ✅ /api/me route configured');
app.all('/api/news', wrapHandler(newsHandler));
console.log('  ✅ /api/news route configured');
app.all('/api/ads', wrapHandler(adsHandler));
console.log('  ✅ /api/ads route configured');
app.all('/api/service-categories', wrapHandler(serviceCategoriesHandler));
console.log('  ✅ /api/service-categories route configured');
app.all('/api/admin-stats', wrapHandler(adminStatsHandler));
console.log('  ✅ /api/admin-stats route configured');

// Serve React app for all non-API routes
console.log('🎯 Setting up SPA fallback route...');
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
console.log('  ✅ SPA fallback route configured');

// Initialize database connection
console.log('🗄️  Starting server initialization...');
async function startServer() {
  try {
    console.log('📡 Attempting to connect to MongoDB...');
    console.log(`   Connection string starts with: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'UNDEFINED'}`);
    
    await dbConnection.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    console.log('🚀 Starting Express server...');
    const port = Number(PORT);
    
    // Listen on all interfaces (0.0.0.0) to make it accessible from WSL
    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server running successfully on port ${port}`);
      console.log(`🌐 Server is ready to accept connections from all interfaces!`);
      console.log(`📋 Available endpoints:`);
      console.log(`   Windows: http://localhost:${port}/health`);
      console.log(`   WSL: http://localhost:${port}/health`);
      console.log(`   API: http://localhost:${port}/api/*`);
      console.log(`   Frontend: http://localhost:${port}/`);
      console.log(`   External: http://$(ip-address):${port}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    
    // Additional MongoDB-specific error information
    if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      console.error('🔍 This appears to be a DNS resolution error.');
      console.error('🔍 Check your MONGODB_URI environment variable.');
      console.error(`🔍 Current MONGODB_URI length: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0} characters`);
    }
    
    process.exit(1);
  }
}

console.log('🎬 Calling startServer function...');
startServer();
