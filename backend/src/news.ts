import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { NewsService } from './services';
import { InMemoryNewsRepository } from './repositories';
import { 
  createResponse, 
  handleError, 
  requireAuth, 
  requireRole, 
  parseRequestBody, 
  handleCors 
} from './utils';
import { createNewsSchema, updateNewsSchema } from './validation';

const newsRepository = new InMemoryNewsRepository();
const newsService = new NewsService(newsRepository);

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(event);
    if (corsResponse) return corsResponse;

    switch (event.httpMethod) {
      case 'GET':
        return await handleGetNews(event);
      case 'POST':
        return await handleCreateNews(event);
      case 'PUT':
        return await handleUpdateNews(event);
      case 'DELETE':
        return await handleDeleteNews(event);
      default:
        return createResponse(405, {
          success: false,
          error: 'Method not allowed',
        });
    }
  } catch (error) {
    return handleError(error);
  }
};

async function handleGetNews(event: HandlerEvent) {
  const newsId = event.queryStringParameters?.id;
  
  if (newsId) {
    // Get specific news post
    const news = await newsService.getNewsById(newsId);
    if (!news) {
      return createResponse(404, {
        success: false,
        error: 'News post not found',
      });
    }
    
    return createResponse(200, {
      success: true,
      data: news,
    });
  } else {
    // Get all news posts
    const news = await newsService.getAllNews();
    return createResponse(200, {
      success: true,
      data: news,
    });
  }
}

async function handleCreateNews(event: HandlerEvent) {
  // Require authentication (any logged-in user can create news)
  const user = requireAuth(event);
  
  const body = parseRequestBody(event);
  const validatedData = createNewsSchema.parse(body);
  
  const news = await newsService.createNews(user.userId, validatedData);
  
  return createResponse(201, {
    success: true,
    data: news,
    message: 'News post created successfully',
  });
}

async function handleUpdateNews(event: HandlerEvent) {
  // Require authentication
  const user = requireAuth(event);
  
  const body = parseRequestBody(event);
  const validatedData = updateNewsSchema.parse(body);
  
  // Check if user can update this news post
  // Admins can update any post, regular users can only update their own posts
  if (user.role !== 'admin') {
    const existingNews = await newsService.getNewsById(validatedData.id);
    if (!existingNews || existingNews.authorId !== user.userId) {
      return createResponse(403, {
        success: false,
        error: 'You can only edit your own news posts',
      });
    }
  }
  
  const news = await newsService.updateNews(user.userId, validatedData);
  
  return createResponse(200, {
    success: true,
    data: news,
    message: 'News post updated successfully',
  });
}

async function handleDeleteNews(event: HandlerEvent) {
  // Require admin role for deletion
  const user = requireAuth(event);
  requireRole(user, ['admin']);
  
  const newsId = event.queryStringParameters?.id;
  if (!newsId) {
    return createResponse(400, {
      success: false,
      error: 'News ID is required',
    });
  }
  
  const deleted = await newsService.deleteNews(user.userId, newsId);
  
  if (!deleted) {
    return createResponse(404, {
      success: false,
      error: 'News post not found',
    });
  }
  
  return createResponse(200, {
    success: true,
    message: 'News post deleted successfully',
  });
}
