import { HandlerContext, HandlerEvent } from '@netlify/functions';
import { ApiResponse, JWTPayload } from './types';
import { AuthService } from './auth';

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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

export function handleCors(event: HandlerEvent): {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
} | null {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }
  return null;
}
