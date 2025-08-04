import { Handler } from '@netlify/functions';
import { StatusSystemService } from './status-system';
import { StatusChangeRequest } from './types/statusSystem';

const statusService = new StatusSystemService();

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const statusRequest: StatusChangeRequest = JSON.parse(event.body);
    const result = await statusService.changeStatus(statusRequest);
    
    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(result)
      };
    }
  } catch (error) {
    console.error('Error changing status:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to change status',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
