import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { MongoServiceCategoryRepository } from './mongoRepositories';
import { dbConnection } from './database';
import { 
  createResponse, 
  handleError, 
  requireAuth, 
  requireRole, 
  parseRequestBody, 
  handleOptionsRequest 
} from './utils';
import { UserRole } from './types';
import { ServiceCategory, CreateServiceCategoryRequest } from './types/serviceCategory';

// Service for managing categories
class ServiceCategoryService {
  constructor(private repository: MongoServiceCategoryRepository) {}

  async getAllCategories(): Promise<ServiceCategory[]> {
    return this.repository.findAll();
  }

  async getActiveCategories(): Promise<ServiceCategory[]> {
    return this.repository.findActive();
  }

  async getCategoryById(id: string): Promise<ServiceCategory | null> {
    return this.repository.findById(id);
  }

  async createCategory(data: CreateServiceCategoryRequest): Promise<ServiceCategory> {
    // Check if category with same name already exists
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      throw new Error(`Category with name '${data.name}' already exists`);
    }

    // Ensure we handle the active property correctly
    const categoryData = {
      name: data.name,
      active: data.active ?? true
    };

    return this.repository.create(categoryData);
  }

  async updateCategory(id: string, data: Partial<ServiceCategory>): Promise<ServiceCategory> {
    if (data.name) {
      // Check if another category with same name already exists
      const existing = await this.repository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new Error(`Another category with name '${data.name}' already exists`);
      }
    }

    return this.repository.update(id, data);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle CORS preflight
    const optionsResponse = handleOptionsRequest(event);
    if (optionsResponse) return optionsResponse;

    // Connect to database and create service
    const db = await dbConnection.connect();
    const categoryRepository = new MongoServiceCategoryRepository(db);
    const categoryService = new ServiceCategoryService(categoryRepository);

    switch (event.httpMethod) {
      case 'GET':
        return await handleGetCategories(event, categoryService);
      case 'POST':
        return await handleCreateCategory(event, categoryService);
      case 'PUT':
        return await handleUpdateCategory(event, categoryService);
      case 'DELETE':
        return await handleDeleteCategory(event, categoryService);
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

async function handleGetCategories(event: HandlerEvent, service: ServiceCategoryService) {
  const queryParams = event.queryStringParameters || {};
  const id = queryParams.id;
  const activeOnly = queryParams.active === 'true';

  try {
    if (id) {
      const category = await service.getCategoryById(id);
      if (!category) {
        return createResponse(404, {
          success: false,
          error: `Category with id ${id} not found`,
        });
      }
      return createResponse(200, {
        success: true,
        data: category,
      });
    }

    const categories = activeOnly 
      ? await service.getActiveCategories()
      : await service.getAllCategories();

    return createResponse(200, {
      success: true,
      data: categories,
    });
  } catch (error) {
    return handleError(error);
  }
}

async function handleCreateCategory(event: HandlerEvent, service: ServiceCategoryService) {
  try {
    // Check auth - only admins can create categories
    const user = requireAuth(event);
    requireRole(user, [UserRole.ADMIN]);

    const data = parseRequestBody<CreateServiceCategoryRequest>(event);
    const category = await service.createCategory(data);

    return createResponse(201, {
      success: true,
      data: category,
    });
  } catch (error) {
    return handleError(error);
  }
}

async function handleUpdateCategory(event: HandlerEvent, service: ServiceCategoryService) {
  try {
    // Check auth - only admins can update categories
    const user = requireAuth(event);
    requireRole(user, [UserRole.ADMIN]);

    const queryParams = event.queryStringParameters || {};
    const id = queryParams.id;
    
    if (!id) {
      return createResponse(400, {
        success: false,
        error: 'Category ID is required',
      });
    }

    const updates = parseRequestBody<Partial<ServiceCategory>>(event);
    const updatedCategory = await service.updateCategory(id, updates);

    return createResponse(200, {
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    return handleError(error);
  }
}

async function handleDeleteCategory(event: HandlerEvent, service: ServiceCategoryService) {
  try {
    // Check auth - only admins can delete categories
    const user = requireAuth(event);
    requireRole(user, [UserRole.ADMIN]);

    const queryParams = event.queryStringParameters || {};
    const id = queryParams.id;
    
    if (!id) {
      return createResponse(400, {
        success: false,
        error: 'Category ID is required',
      });
    }

    const success = await service.deleteCategory(id);

    if (!success) {
      return createResponse(404, {
        success: false,
        error: `Category with id ${id} not found`,
      });
    }

    return createResponse(200, {
      success: true,
      data: { id, deleted: true },
    });
  } catch (error) {
    return handleError(error);
  }
}
