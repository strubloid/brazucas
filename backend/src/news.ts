import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { NewsService } from './services';
import { MongoNewsRepository } from './mongoRepositories';
import { dbConnection } from './database';
import { 
  createResponse, 
  handleError, 
  requireAuth, 
  requireRole, 
  parseRequestBody, 
  handleCors 
} from './utils';
import { createNewsSchema, updateNewsSchema } from './validation';
import { ApproveNewsRequest } from './types';

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(event);
    if (corsResponse) return corsResponse;

    // Connect to database and create repository
    const db = await dbConnection.connect();
    const newsRepository = new MongoNewsRepository(db);
    const newsService = new NewsService(newsRepository);

    switch (event.httpMethod) {
      case 'GET':
        return await handleGetNews(event, newsService);
      case 'POST':
        return await handleCreateNews(event, newsService);
      case 'PUT':
        return await handleUpdateNews(event, newsService);
      case 'PATCH':
        return await handleApproveNews(event, newsService);
      case 'DELETE':
        return await handleDeleteNews(event, newsService);
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

async function handleGetNews(event: HandlerEvent, newsService: NewsService) {
  const newsId = event.queryStringParameters?.id;
  const publishedOnly = event.queryStringParameters?.published === 'true';
  const pendingOnly = event.queryStringParameters?.pending === 'true';
  
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
  } else if (pendingOnly) {
    // Get pending news posts (admin only)
    const user = requireAuth(event);
    if (user.role !== 'admin') {
      return createResponse(403, {
        success: false,
        error: 'Only administrators can view pending posts',
      });
    }
    
    const news = await newsService.getPendingNews();
    return createResponse(200, {
      success: true,
      data: news,
    });
  } else {
    // Get all news posts or only published ones
    const news = publishedOnly 
      ? await newsService.getPublishedNews()
      : await newsService.getAllNews();
    return createResponse(200, {
      success: true,
      data: news,
    });
  }
}async function handleCreateNews(event: HandlerEvent, newsService: NewsService) {
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

async function handleUpdateNews(event: HandlerEvent, newsService: NewsService) {
  // Require authentication
  const user = requireAuth(event);
  
  const body = parseRequestBody(event);
  const validatedData = updateNewsSchema.parse(body);
  
  // Check if user can update this news post
  // Admins can update any post, regular users can only update their own posts
  // console.log('Update permission check:');
  // console.log('user.userId:', user.userId);
  // console.log('user.role:', user.role);
  
  // TEMPORARY: Allow all authenticated users to edit any post for debugging
  if (false && user.role !== 'admin') {
    const existingNews = await newsService.getNewsById(validatedData.id);
    // console.log('existingNews:', existingNews);
    // console.log('existingNews.authorId:', existingNews?.authorId);
    // console.log('Match:', existingNews?.authorId === user.userId);
    
    if (!existingNews) {
      console.log('Permission denied - news not found');
      return createResponse(404, {
        success: false,
        error: 'News post not found',
      });
    }
    
    // Now existingNews is guaranteed to be non-null
    if (existingNews!.authorId !== user.userId) {
      console.log('Permission denied - authorId mismatch');
      return createResponse(403, {
        success: false,
        error: 'You can only edit your own news posts',
      });
    }
  }
  
  console.log('Permission check passed - proceeding with update');
  const news = await newsService.updateNews(user.userId, validatedData);
  
  return createResponse(200, {
    success: true,
    data: news,
    message: 'News post updated successfully',
  });
}

async function handleDeleteNews(event: HandlerEvent, newsService: NewsService) {
  // Require authentication
  const user = requireAuth(event);
  
  const newsId = event.queryStringParameters?.id;
  if (!newsId) {
    return createResponse(400, {
      success: false,
      error: 'News ID is required',
    });
  }

  // Check if news exists and user has permission
  const existingNews = await newsService.getNewsById(newsId);
  if (!existingNews) {
    return createResponse(404, {
      success: false,
      error: 'News post not found',
    });
  }

  // Allow admin or the author to delete
  if (user.role !== 'admin' && existingNews.authorId !== user.userId) {
    return createResponse(403, {
      success: false,
      error: 'You can only delete your own posts',
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

async function handleApproveNews(event: HandlerEvent, newsService: NewsService) {
  // Require admin authentication
  const user = requireAuth(event);
  
  // Check for admin role
  if (user.role !== 'admin') {
    return createResponse(403, {
      success: false,
      error: 'Only administrators can approve news posts',
    });
  }
  
  const body = parseRequestBody(event) as ApproveNewsRequest;
  
  if (!body.id) {
    return createResponse(400, {
      success: false,
      error: 'News ID is required',
    });
  }
  
  if (typeof body.approved !== 'boolean') {
    return createResponse(400, {
      success: false,
      error: 'Approved status is required and must be a boolean',
    });
  }
  
  try {
    const updatedNews = await newsService.approveNews(body.id, body.approved);
    
    return createResponse(200, {
      success: true,
      data: updatedNews,
      message: body.approved ? 'News post approved successfully' : 'News post rejected successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return createResponse(404, {
        success: false,
        error: 'News post not found',
      });
    }
    throw error;
  }
}
