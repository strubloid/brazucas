import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { AdService } from './services';
import { InMemoryAdRepository } from './repositories';
import { 
  createResponse, 
  handleError, 
  requireAuth, 
  requireRole, 
  parseRequestBody, 
  handleCors 
} from './utils';
import { createAdSchema, validateAdMedia } from './validation';

const adRepository = new InMemoryAdRepository();
const adService = new AdService(adRepository);

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(event);
    if (corsResponse) return corsResponse;

    switch (event.httpMethod) {
      case 'GET':
        return await handleGetAds(event);
      case 'POST':
        return await handleCreateAd(event);
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

async function handleGetAds(event: HandlerEvent) {
  const adId = event.queryStringParameters?.id;
  
  if (adId) {
    // Get specific ad
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
  } else {
    // Get all approved ads
    const ads = await adService.getAllAds();
    return createResponse(200, {
      success: true,
      data: ads,
    });
  }
}

async function handleCreateAd(event: HandlerEvent) {
  // Require advertiser role
  const user = requireAuth(event);
  requireRole(user, ['advertiser']);
  
  const body = parseRequestBody(event);
  const validatedData = createAdSchema.parse(body);
  
  // Validate that either imageUrl or youtubeUrl is provided
  if (!validateAdMedia(validatedData)) {
    return createResponse(400, {
      success: false,
      error: 'Either image URL or YouTube URL must be provided',
    });
  }
  
  const ad = await adService.createAd(user.userId, validatedData);
  
  return createResponse(201, {
    success: true,
    data: ad,
    message: 'Advertisement submitted successfully and is pending approval',
  });
}
