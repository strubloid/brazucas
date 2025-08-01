import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { UserService } from './services';
import { InMemoryUserRepository } from './repositories';
import { createResponse, handleError, parseRequestBody, handleCors } from './utils';
import { createUserSchema } from './validation';

const userRepository = new InMemoryUserRepository();
const userService = new UserService(userRepository);

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

    const body = parseRequestBody(event);
    
    // Validate input
    const validatedData = createUserSchema.parse(body);
    
    // Register user
    const result = await userService.register(validatedData);
    
    return createResponse(201, {
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  } catch (error) {
    return handleError(error);
  }
};
