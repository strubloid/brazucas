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
import { createResponse, handleError, parseRequestBody, handleOptionsRequest } from './utils';
import { loginSchema } from './validation';

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle CORS preflight
    const optionsResponse = handleOptionsRequest(event);
    if (optionsResponse) return optionsResponse;

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
