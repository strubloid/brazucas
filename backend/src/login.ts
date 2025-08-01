import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { UserService } from './services';
import { MongoUserRepository } from './mongoRepositories';
import { dbConnection } from './database';
import { createResponse, handleError, parseRequestBody, handleCors } from './utils';
import { loginSchema } from './validation';

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(event);
    if (corsResponse) return corsResponse;

    if (event.httpMethod !== 'POST') {
      return createResponse(405, {
        success: false,
        error: 'Method not allowed',
      });
    }

    // Connect to MongoDB
    const db = await dbConnection.connect();
    const userRepository = new MongoUserRepository(db);
    const userService = new UserService(userRepository);

    const body = parseRequestBody(event);
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Login user
    const result = await userService.login(validatedData);
    
    return createResponse(200, {
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    return handleError(error);
  }
};
