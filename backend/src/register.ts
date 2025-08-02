import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { UserService } from './services';
import { MongoUserRepository } from './mongoRepositories';
import { dbConnection } from './database';
import { createResponse, handleError, parseRequestBody, handleOptionsRequest } from './utils';
import { createUserSchema } from './validation';
import { UserRole } from './types';
import { z } from 'zod';

// Extended schema for admin registration
const createUserWithAdminSchema = createUserSchema.extend({
  adminSecretKey: z.string().optional(),
});

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    console.log('Register function called with method:', event.httpMethod);
    console.log('Headers:', event.headers);
    
    // Handle CORS preflight
    const optionsResponse = handleOptionsRequest(event);
    if (optionsResponse) {
      console.log('Returning CORS response');
      return optionsResponse;
    }

    if (event.httpMethod !== 'POST') {
      console.log('Method not allowed:', event.httpMethod);
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
    console.log('Request body received, parsing...');
    
    // Validate input with extended schema
    const validatedData = createUserWithAdminSchema.parse(body);
    console.log('Validation successful for role:', validatedData.role);
    
    // Check if trying to register as admin
    if (validatedData.role === UserRole.ADMIN) {
      const adminSecretKey = process.env.ADMIN_SECRET_KEY || 'brazucas-admin-secret-2024';
      console.log('Admin registration attempt, checking secret key...');
      
      if (!validatedData.adminSecretKey) {
        console.log('Admin secret key missing');
        return createResponse(400, {
          success: false,
          error: 'Admin secret key is required for admin registration',
        });
      }
      
      if (validatedData.adminSecretKey !== adminSecretKey) {
        console.log('Invalid admin secret key provided');
        return createResponse(403, {
          success: false,
          error: 'Invalid admin secret key',
        });
      }
      
      console.log('Admin secret key validated successfully');
    }
    
    // Remove adminSecretKey from data before registration
    const { adminSecretKey, ...userData } = validatedData;
    
    // Register user
    console.log('Attempting to register user with role:', userData.role);
    const result = await userService.register(userData);
    console.log('User registration successful');
    
    const message = validatedData.role === UserRole.ADMIN 
      ? 'Admin user registered successfully'
      : 'User registered successfully';
    
    return createResponse(201, {
      success: true,
      data: result,
      message,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return handleError(error);
  }
};
