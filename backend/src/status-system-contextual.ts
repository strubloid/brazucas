// Handler function type definition
type Handler = (event: any, context: any) => Promise<{
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}>;

import { StatusSystemService } from './status-system';
import { StatusSystemContext } from './types/statusSystem';

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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { contentType, context: contextName } = event.queryStringParameters || {};
    
    if (!contentType || !contextName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'contentType and context are required' })
      };
    }

    const statusContext: StatusSystemContext = {
      contentType: contentType as 'news' | 'ads',
      context: contextName as 'management' | 'approval' | 'public'
    };

    const result = await statusService.getContextualStatuses(statusContext);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error fetching contextual statuses:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch contextual statuses',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
