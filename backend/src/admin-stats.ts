import { HandlerEvent, HandlerContext } from "@netlify/functions";
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
    const publishedNews = allNews.filter((news: NewsPost) => news.published && news.approved);
    const draftNews = allNews.filter((news: NewsPost) => !news.published || news.approved !== true);
    
    const publishedAds = allAds.filter((ad: Advertisement) => ad.published && ad.approved);
    const draftAds = allAds.filter((ad: Advertisement) => !ad.published || ad.approved !== true);

    const stats = {
      users: userCount,
      news: {
        published: publishedNews.length,
        draft: draftNews.length,
        total: allNews.length
      },
      ads: {
        published: publishedAds.length,
        draft: draftAds.length,
        total: allAds.length
      }
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(stats),
    };

  } catch (error) {
    console.error('Admin stats error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
    };
  }
};
