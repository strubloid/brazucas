import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { UserService } from './services';
import { MongoUserRepository } from './mongoRepositories';
import { dbConnection } from './database';
import { createResponse, handleError, requireAuth, handleCors } from './utils';

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(event);
    if (corsResponse) return corsResponse;

    if (event.httpMethod !== 'GET') {
      return createResponse(405, {
        success: false,
        error: 'Method not allowed',
      });
    }

    // Connect to MongoDB
    const db = await dbConnection.connect();
    const userRepository = new MongoUserRepository(db);
    const userService = new UserService(userRepository);

    // Require authentication
    const user = requireAuth(event);
    
    // Get user details
    const userData = await userService.getUserById(user.userId);
    
    if (!userData) {
      return createResponse(404, {
        success: false,
        error: 'User not found',
      });
    }
    
    return createResponse(200, {
      success: true,
      data: userData,
    });
  } catch (error) {
    return handleError(error);
  }
};
