import { Request, Response } from 'express';
import {
  StatusSystemResponse,
  ContextualStatusResponse,
  StatusChangeRequest,
  StatusSystemContext,
  AvailableStatus,
  StatusChangeResult,
  ApprovalAction,
  BulkStatusChangeRequest,
  ContentStatusHistory,
  StatusContextMapping,
  StatusDefinition,
  ContentType,
  StatusContext
} from './types/statusSystem';
import { MongoStatusSystemRepository } from './mongoStatusRepository';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'admin' | 'user';
  };
}

// Service class
export class StatusSystemService {
  private repository = new MongoStatusSystemRepository();

  async initializeIfNeeded(): Promise<void> {
    try {
      await this.repository.initializeStatusSystem();
    } catch (error) {
      console.error('Error initializing status system:', error);
    }
  }

  async getFullStatusSystem(): Promise<StatusSystemResponse> {
    await this.initializeIfNeeded();
    
    // For now, return a basic structure
    return {
      contentTypes: [
        { id: 1, name: 'news', displayName: 'Notícias', createdAt: new Date().toISOString() },
        { id: 2, name: 'ads', displayName: 'Anúncios', createdAt: new Date().toISOString() }
      ],
      contexts: [
        { id: 1, name: 'management', displayName: 'Gerenciar', description: 'Contexto para gerenciar conteúdo próprio', createdAt: new Date().toISOString() },
        { id: 2, name: 'approval', displayName: 'Aprovar', description: 'Contexto para aprovar/rejeitar conteúdo de outros', createdAt: new Date().toISOString() },
        { id: 3, name: 'public', displayName: 'Público', description: 'Contexto para visualização pública', createdAt: new Date().toISOString() }
      ],
      statuses: [],
      mappings: []
    };
  }

  async getContextualStatuses(
    context: StatusSystemContext
  ): Promise<ContextualStatusResponse> {
    await this.initializeIfNeeded();
    
    const availableStatuses = await this.repository.getAvailableStatusesForContext(
      context.contentType,
      context.context
    );

    const defaultStatus = availableStatuses.find(s => s.isDefault)?.code || 
                         availableStatuses[0]?.code || 
                         'draft';

    return {
      context,
      availableStatuses,
      defaultStatus
    };
  }

  async changeStatus(request: StatusChangeRequest, changedBy?: number): Promise<StatusChangeResult> {
    return this.repository.changeContentStatus(
      request.contentType,
      request.contentId,
      request.newStatusCode,
      changedBy,
      request.reason,
      request.metadata
    );
  }

  async bulkChangeStatus(
    request: BulkStatusChangeRequest, 
    changedBy?: number
  ): Promise<StatusChangeResult[]> {
    const results: StatusChangeResult[] = [];
    
    for (const item of request.items) {
      const result = await this.changeStatus({
        contentType: item.contentType,
        contentId: item.contentId,
        newStatusCode: request.newStatusCode,
        reason: request.reason,
        metadata: request.metadata
      }, changedBy);
      
      results.push(result);
    }
    
    return results;
  }

  async processApprovalAction(
    action: ApprovalAction,
    adminId: number
  ): Promise<StatusChangeResult> {
    const statusCode = action.action === 'approve' ? 'approved' : 'rejected';
    
    return this.changeStatus({
      contentType: action.contentType,
      contentId: action.contentId,
      newStatusCode: statusCode,
      reason: action.reason,
      metadata: {
        action: action.action,
        adminId,
        ...action.metadata
      }
    }, adminId);
  }
}

// Express route handlers
const statusService = new StatusSystemService();

export const getStatusSystem = async (req: Request, res: Response) => {
  try {
    const result = await statusService.getFullStatusSystem();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status system' });
  }
};

export const getContextualStatuses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contentType, context } = req.query;
    
    if (!contentType || !context) {
      return res.status(400).json({ error: 'contentType and context are required' });
    }

    const statusContext: StatusSystemContext = {
      contentType: contentType as 'news' | 'ads',
      context: context as 'management' | 'approval' | 'public',
      userId: req.user?.id,
      userRole: req.user?.role
    };

    const result = await statusService.getContextualStatuses(statusContext);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contextual statuses' });
  }
};

export const changeContentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const statusRequest: StatusChangeRequest = req.body;
    const changedBy = req.user?.id;

    const result = await statusService.changeStatus(statusRequest, changedBy);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to change status' });
  }
};

export const bulkChangeStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bulkRequest: BulkStatusChangeRequest = req.body;
    const changedBy = req.user?.id;

    const results = await statusService.bulkChangeStatus(bulkRequest, changedBy);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk change status' });
  }
};

export const processApproval = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const approvalAction: ApprovalAction = req.body;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await statusService.processApprovalAction(approvalAction, adminId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process approval' });
  }
};
