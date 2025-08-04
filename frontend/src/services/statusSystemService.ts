import { apiClient } from './apiClient';
import {
  StatusSystemResponse,
  ContextualStatusResponse,
  StatusChangeRequest,
  StatusSystemContext,
  StatusChangeResult,
  ApprovalAction,
  BulkStatusChangeRequest
} from '../types/statusSystem';

class StatusSystemService {
  
  /**
   * Get the complete status system configuration
   */
  async getStatusSystem(): Promise<StatusSystemResponse> {
    const response = await apiClient.get('/status-system-get');
    return response.data as StatusSystemResponse;
  }

  /**
   * Get available statuses for a specific context
   */
  async getContextualStatuses(context: StatusSystemContext): Promise<ContextualStatusResponse> {
    try {
      // For development environment, use mock data first
      if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_MOCK_STATUS_SYSTEM === 'true') {
        console.log('Using mock status data in development environment');
        return this.getMockContextualStatuses(context);
      }

      const response = await apiClient.get('/status-system-contextual', {
        params: {
          contentType: context.contentType,
          context: context.context
        }
      });
      
      // Validate the response data structure
      if (response && response.data && 
          typeof response.data === 'object' && 
          'availableStatuses' in response.data) {
        return response.data as ContextualStatusResponse;
      } else {
        console.warn('Invalid status system response:', response);
        // Fallback to mock data if API response is invalid
        console.log('Falling back to mock data due to invalid API response');
        return this.getMockContextualStatuses(context);
      }
    } catch (error) {
      console.error('Error fetching contextual statuses:', error);
      // Instead of rethrowing, return mock data as fallback
      console.log('Falling back to mock data due to API error');
      return this.getMockContextualStatuses(context);
    }
  }
  
  /**
   * Generate mock status data for development and fallback
   */
  private getMockContextualStatuses(context: StatusSystemContext): ContextualStatusResponse {
    // Define the structure of a status object
    interface StatusObject {
      code: string;
      displayName: string;
      colors: {
        background: string;
        border: string;
        text: string;
        headerBg: string;
      };
      isDefault: boolean;
      sortOrder: number;
    }
    
    const baseStatuses: Record<string, StatusObject> = {
      draft: {
        code: 'draft',
        displayName: 'Rascunho',
        colors: {
          background: 'rgba(107, 114, 128, 0.15)',
          border: '#6b7280',
          text: '#787893',
          headerBg: 'rgba(107, 114, 128, 0.1)'
        },
        isDefault: true,
        sortOrder: 1
      },
      pending_approval: {
        code: 'pending_approval',
        displayName: 'Aguardando Aprovação',
        colors: {
          background: 'rgba(251, 146, 60, 0.15)',
          border: '#fb923c',
          text: '#c2410c',
          headerBg: 'rgba(251, 146, 60, 0.1)'
        },
        isDefault: false,
        sortOrder: 2
      },
      approved: {
        code: 'approved',
        displayName: 'Aprovado',
        colors: {
          background: 'rgba(34, 197, 94, 0.15)',
          border: '#22c55e',
          text: '#166534',
          headerBg: 'rgba(34, 197, 94, 0.1)'
        },
        isDefault: false,
        sortOrder: 3
      },
      published: {
        code: 'published',
        displayName: 'Publicado',
        colors: {
          background: 'rgba(34, 197, 94, 0.15)',
          border: '#22c55e',
          text: '#166534',
          headerBg: 'rgba(34, 197, 94, 0.1)'
        },
        isDefault: false,
        sortOrder: 4
      },
      rejected: {
        code: 'rejected',
        displayName: 'Rejeitado',
        colors: {
          background: 'rgba(239, 68, 68, 0.15)',
          border: '#ef4444',
          text: '#dc2626',
          headerBg: 'rgba(239, 68, 68, 0.1)'
        },
        isDefault: false,
        sortOrder: 5
      },
      expired: {
        code: 'expired',
        displayName: 'Expirado',
        colors: {
          background: 'rgba(107, 114, 128, 0.15)',
          border: '#6b7280',
          text: '#787893',
          headerBg: 'rgba(107, 114, 128, 0.1)'
        },
        isDefault: false,
        sortOrder: 6
      }
    };

    // Create an array that matches the AvailableStatus type from the imported type
    let availableStatuses: Array<{
      code: string;
      displayName: string;
      colors: {
        background: string;
        border: string;
        text: string;
        headerBg: string;
      };
      isDefault: boolean;
      sortOrder: number;
    }> = [];
    
    if (context.context === 'management') {
      if (context.contentType === 'news') {
        availableStatuses = [
          baseStatuses.draft,
          baseStatuses.pending_approval,
          baseStatuses.approved,
          baseStatuses.published,
          baseStatuses.rejected
        ];
      } else if (context.contentType === 'ads') {
        availableStatuses = [
          baseStatuses.draft,
          baseStatuses.pending_approval,
          baseStatuses.approved,
          baseStatuses.published,
          baseStatuses.rejected,
          baseStatuses.expired
        ];
      }
    } else if (context.context === 'approval') {
      // Only show "Pendente Aprovação" for approval screens
      availableStatuses = [
        { ...baseStatuses.pending_approval, isDefault: true }
      ];
    } else {
      availableStatuses = [baseStatuses.published];
    }
    
    const defaultStatus = availableStatuses.find(status => status.isDefault)?.code || 'draft';
    
    // Create a valid ContextualStatusResponse object based on the imported type
    return {
      context: context,
      availableStatuses: availableStatuses,
      defaultStatus: defaultStatus
    };
  }

  /**
   * Change the status of a content item
   */
  async changeContentStatus(request: StatusChangeRequest): Promise<StatusChangeResult> {
    const response = await apiClient.post('/status-system-change', request);
    return response.data as StatusChangeResult;
  }

  /**
   * Bulk change status for multiple content items
   */
  async bulkChangeStatus(request: BulkStatusChangeRequest): Promise<{ results: StatusChangeResult[] }> {
    const response = await apiClient.post('/api/status-system/bulk-change', request);
    return response.data as { results: StatusChangeResult[] };
  }

  /**
   * Process approval action (admin only)
   */
  async processApproval(action: ApprovalAction): Promise<StatusChangeResult> {
    const response = await apiClient.post('/api/status-system/approval', action);
    return response.data as StatusChangeResult;
  }

  /**
   * Batch approve multiple items
   */
  async batchApprove(
    items: Array<{ contentType: string; contentId: number }>,
    reason?: string
  ): Promise<{ results: StatusChangeResult[] }> {
    return this.bulkChangeStatus({
      items,
      newStatusCode: 'approved',
      reason,
      metadata: { action: 'batch_approve' }
    });
  }

  /**
   * Batch reject multiple items
   */
  async batchReject(
    items: Array<{ contentType: string; contentId: number }>,
    reason?: string
  ): Promise<{ results: StatusChangeResult[] }> {
    return this.bulkChangeStatus({
      items,
      newStatusCode: 'rejected',
      reason,
      metadata: { action: 'batch_reject' }
    });
  }

  /**
   * Publish content (move from approved to published)
   */
  async publishContent(
    contentType: string,
    contentId: number,
    reason?: string
  ): Promise<StatusChangeResult> {
    return this.changeContentStatus({
      contentType,
      contentId,
      newStatusCode: 'published',
      reason,
      metadata: { action: 'publish' }
    });
  }

  /**
   * Archive content
   */
  async archiveContent(
    contentType: string,
    contentId: number,
    reason?: string
  ): Promise<StatusChangeResult> {
    return this.changeContentStatus({
      contentType,
      contentId,
      newStatusCode: 'rejected',
      reason,
      metadata: { action: 'archive' }
    });
  }

  /**
   * Submit content for approval
   */
  async submitForApproval(
    contentType: string,
    contentId: number,
    reason?: string
  ): Promise<StatusChangeResult> {
    return this.changeContentStatus({
      contentType,
      contentId,
      newStatusCode: 'pending_approval',
      reason,
      metadata: { action: 'submit_for_approval' }
    });
  }
}

export const statusSystemService = new StatusSystemService();
