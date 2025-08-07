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

import { AdService } from './services';
import { MongoAdRepository, MongoUserRepository } from './mongoRepositories';
import { dbConnection } from './database';
import { 
  createResponse, 
  handleError, 
  requireAuth, 
  requireRole, 
  parseRequestBody, 
  handleOptionsRequest 
} from './utils';
import { createAdvertisementSchema, updateAdvertisementSchema } from './validation';
import { ApproveAdvertisementRequest } from './types';

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle CORS preflight
    const optionsResponse = handleOptionsRequest(event);
    if (optionsResponse) return optionsResponse;

    // Connect to database and create repository
    const db = await dbConnection.connect();
    const adRepository = new MongoAdRepository(db);
    const userRepository = new MongoUserRepository(db);
    const adService = new AdService(adRepository, userRepository);

    switch (event.httpMethod) {
      case 'GET':
        return await handleGetAds(event, adService);
      case 'POST':
        return await handleCreateAd(event, adService);
      case 'PUT':
        return await handleUpdateAd(event, adService);
      case 'PATCH':
        return await handleApproveAd(event, adService);
      case 'DELETE':
        return await handleDeleteAd(event, adService);
      default:
        return createResponse(405, {
          success: false,
          error: 'Method not allowed',
        });
    }
  } catch (error) {
    return handleError(error);
  }
};

async function handleGetAds(event: HandlerEvent, adService: AdService) {
  const adId = event.queryStringParameters?.id;
  const publishedOnly = event.queryStringParameters?.published === 'true';
  const pendingOnly = event.queryStringParameters?.pending === 'true';
  const myOnly = event.queryStringParameters?.my === 'true';
  
  if (adId) {
    // Get specific advertisement
    const ad = await adService.getAdById(adId);
    if (!ad) {
      return createResponse(404, {
        success: false,
        error: 'Advertisement not found',
      });
    }

    return createResponse(200, {
      success: true,
      data: ad,
    });
  } else if (pendingOnly) {
    // Get pending advertisements (admin only)
    const user = requireAuth(event);
    if (user.role !== 'admin') {
      return createResponse(403, {
        success: false,
        error: 'Only administrators can view pending advertisements',
      });
    }
    
    const ads = await adService.getPendingAds();
    return createResponse(200, {
      success: true,
      data: ads,
    });
  } else if (myOnly) {
    // Get only current user's advertisements
    const user = requireAuth(event);
    const ads = await adService.getMyAds(user.userId);
    return createResponse(200, {
      success: true,
      data: ads,
    });
  } else {
    // Get all advertisements or only published ones
    const ads = publishedOnly 
      ? await adService.getPublishedAds()
      : await adService.getAllAds();
    return createResponse(200, {
      success: true,
      data: ads,
    });
  }
}

async function handleCreateAd(event: HandlerEvent, adService: AdService) {
  // Require authentication (any logged-in user can create ads)
  const user = requireAuth(event);
  
  const body = parseRequestBody(event);
  const validatedData = createAdvertisementSchema.parse(body);
  
  const ad = await adService.createAd(user.userId, validatedData);
  
  return createResponse(201, {
    success: true,
    data: ad,
    message: 'Advertisement created successfully',
  });
}

async function handleUpdateAd(event: HandlerEvent, adService: AdService) {
  // Require authentication
  const user = requireAuth(event);
  
  const body = parseRequestBody(event);
  const validatedData = updateAdvertisementSchema.parse(body);
  
  const ad = await adService.updateAd(user.userId, validatedData);
  
  return createResponse(200, {
    success: true,
    data: ad,
    message: 'Advertisement updated successfully',
  });
}

async function handleDeleteAd(event: HandlerEvent, adService: AdService) {
  // Require authentication
  const user = requireAuth(event);
  
  const adId = event.queryStringParameters?.id;
  if (!adId) {
    return createResponse(400, {
      success: false,
      error: 'Advertisement ID is required',
    });
  }

  // Check if ad exists and user has permission
  const existingAd = await adService.getAdById(adId);
  if (!existingAd) {
    return createResponse(404, {
      success: false,
      error: 'Advertisement not found',
    });
  }

  // Allow admin or the author to delete
  if (user.role !== 'admin' && existingAd.authorId !== user.userId) {
    return createResponse(403, {
      success: false,
      error: 'You can only delete your own advertisements',
    });
  }
  
  const deleted = await adService.deleteAd(user.userId, adId);
  
  if (!deleted) {
    return createResponse(404, {
      success: false,
      error: 'Advertisement not found',
    });
  }
  
  return createResponse(200, {
    success: true,
    message: 'Advertisement deleted successfully',
  });
}

async function handleApproveAd(event: HandlerEvent, adService: AdService) {
  // Require admin authentication
  const user = requireAuth(event);
  
  // Check for admin role
  if (user.role !== 'admin') {
    return createResponse(403, {
      success: false,
      error: 'Only administrators can approve advertisements',
    });
  }
  
  const body = parseRequestBody(event) as ApproveAdvertisementRequest;
  
  if (!body.id) {
    return createResponse(400, {
      success: false,
      error: 'Advertisement ID is required',
    });
  }
  
  if (typeof body.approved !== 'boolean') {
    return createResponse(400, {
      success: false,
      error: 'Approved status is required and must be a boolean',
    });
  }
  
  try {
    const updatedAd = await adService.approveAd(body.id, body.approved);
    
    return createResponse(200, {
      success: true,
      data: updatedAd,
      message: body.approved ? 'Advertisement approved successfully' : 'Advertisement rejected successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return createResponse(404, {
        success: false,
        error: 'Advertisement not found',
      });
    }
    throw error;
  }
}
