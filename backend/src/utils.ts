import { HandlerContext, HandlerEvent } from '@netlify/functions';
import { ApiResponse, JWTPayload } from './types';
import { AuthService } from './auth';
import { ZodError } from 'zod';

export interface AuthenticatedEvent extends HandlerEvent {
  user?: JWTPayload;
}

export function createResponse<T>(
  statusCode: number,
  body: ApiResponse<T>
): {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
} {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...handleCors({} as HandlerEvent), // Get consistent CORS headers
    },
    body: JSON.stringify(body),
  };
}

export function handleError(error: unknown): {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
} {
  console.error('Function error:', error);
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    return createResponse(400, {
      success: false,
      error: 'Validation failed',
      data: validationErrors,
    });
  }
  
  const message = error instanceof Error ? error.message : 'Internal server error';
  const statusCode = getStatusCodeFromError(error);
  
  return createResponse(statusCode, {
    success: false,
    error: message,
  });
}

function getStatusCodeFromError(error: unknown): number {
  if (error instanceof Error) {
    if (error.message.includes('not found')) return 404;
    if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) return 401;
    if (error.message.includes('already exists') || error.message.includes('Invalid')) return 400;
    if (error.message.includes('Forbidden')) return 403;
  }
  return 500;
}

export function requireAuth(event: HandlerEvent): JWTPayload {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }

  const token = AuthService.extractTokenFromHeader(authHeader);
  return AuthService.verifyToken(token);
}

export function requireRole(user: JWTPayload, allowedRoles: string[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}

export function parseRequestBody<T>(event: HandlerEvent): T {
  if (!event.body) {
    throw new Error('Request body is required');
  }

  try {
    return JSON.parse(event.body) as T;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

export function handleCors(event: HandlerEvent): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  };
}

export function handleOptionsRequest(event: HandlerEvent): {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
} | null {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: handleCors(event),
      body: '',
    };
  }
  return null;
}
