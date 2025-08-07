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

import { UserService } from './services';
import { MongoUserRepository } from './mongoRepositories';
import { dbConnection } from './database';
import { createResponse, handleError, requireAuth, handleOptionsRequest } from './utils';

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle CORS preflight
    const optionsResponse = handleOptionsRequest(event);
    if (optionsResponse) return optionsResponse;

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
    console.log('ME endpoint - JWT user:', user);
    
    // Get user details
    const userData = await userService.getUserById(user.userId);
    console.log('ME endpoint - getUserById result:', userData);
    
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
