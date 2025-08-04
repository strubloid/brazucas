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
    const response = await apiClient.get('/status-system-contextual', {
      params: {
        contentType: context.contentType,
        context: context.context
      }
    });
    return response.data as ContextualStatusResponse;
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
