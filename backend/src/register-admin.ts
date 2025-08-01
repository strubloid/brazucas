import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { UserService } from './services';
import { InMemoryUserRepository } from './repositories';
import { createResponse, handleError, parseRequestBody, handleCors } from './utils';
import { UserRole } from './types';
import { z } from 'zod';

const userRepository = new InMemoryUserRepository();
const userService = new UserService(userRepository);

// Schema for admin registration
const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  adminSecretKey: z.string(),
});

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
    const validatedData = createAdminSchema.parse(body);
    
    // Check admin secret key
    const adminSecretKey = process.env.ADMIN_SECRET_KEY || 'your-super-secret-admin-key';
    if (validatedData.adminSecretKey !== adminSecretKey) {
      return createResponse(403, {
        success: false,
        error: 'Invalid admin secret key',
      });
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(validatedData.email);
    if (existingUser) {
      return createResponse(400, {
        success: false,
        error: 'User with this email already exists',
      });
    }
    
    // Register admin user
    const result = await userService.register({
      email: validatedData.email,
      password: validatedData.password,
      role: UserRole.ADMIN,
    });
    
    return createResponse(201, {
      success: true,
      data: result,
      message: 'Admin user registered successfully',
    });
  } catch (error) {
    return handleError(error);
  }
};
