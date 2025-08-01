import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { UserService } from '../services';
import { InMemoryUserRepository } from '../repositories';
import { createResponse, handleError, parseRequestBody, handleCors } from '../utils';
import { loginSchema } from '../validation';

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
