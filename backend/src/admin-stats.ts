// Event and context interfaces for serverless functions
interface HandlerEvent {
  httpMethod: string;
  headers: any;
  body: string | null;
  queryStringParameters: any;
  path: string;
  rawQuery: string;
  rawUrl: string;
}

interface HandlerContext {
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  getRemainingTimeInMillis: () => number;
}

import { UserService, NewsService, AdService } from './services';
import { MongoUserRepository, MongoNewsRepository, MongoAdRepository } from './mongoRepositories';
import { dbConnection } from './database';
import { requireAuth, handleCors, handleOptionsRequest } from './utils';
import { UserRole, NewsPost, Advertisement } from './types';

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  const optionsResponse = handleOptionsRequest(event);
  if (optionsResponse) {
    return optionsResponse;
  }

  // Get CORS headers for all responses
  const corsHeaders = handleCors(event);

  try {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Require authentication and admin role
    const authUser = requireAuth(event);
    if (authUser.role !== UserRole.ADMIN) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Admin access required' }),
      };
    }

    // Connect to database and create services
    const db = await dbConnection.connect();
    const userRepository = new MongoUserRepository(db);
    const newsRepository = new MongoNewsRepository(db);
    const adRepository = new MongoAdRepository(db);
    
    const userService = new UserService(userRepository);
    const newsService = new NewsService(newsRepository, userRepository);
    const adService = new AdService(adRepository, userRepository);

    // Get statistics
    const userCount = await userService.getUserCount();
    const allNews = await newsService.getAllNews();
    const allAds = await adService.getAllAds();

    // Calculate statistics
    const publishedNews = allNews.filter((news: NewsPost) => news.published && news.approved === true);
    const draftNews = allNews.filter((news: NewsPost) => !news.published || news.approved !== true);
    
    // Further separate drafts from posts pending approval
    const pendingApprovalNews = draftNews.filter((news: NewsPost) => news.published && news.approved === null);
    
    const publishedAds = allAds.filter((ad: Advertisement) => ad.published && ad.approved === true);
    const draftAds = allAds.filter((ad: Advertisement) => !ad.published || ad.approved !== true);
    
    // Further separate drafts from ads pending approval
    const pendingApprovalAds = draftAds.filter((ad: Advertisement) => ad.published && ad.approved === null);

    const stats = {
      users: userCount,
      news: {
        published: publishedNews.length,
        draft: draftNews.length,
        total: allNews.length,
        pendingApproval: pendingApprovalNews.length
      },
      ads: {
        published: publishedAds.length,
        draft: draftAds.length,
        total: allAds.length,
        pendingApproval: pendingApprovalAds.length
      }
    };

    // Add timestamp to ensure clients always see it as fresh data
    const statsWithTimestamp = {
      ...stats,
      timestamp: Date.now()
    };
    
    console.log('[admin-stats] Returning statistics:', statsWithTimestamp);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: statsWithTimestamp,
        error: null
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
    };
  }
};
