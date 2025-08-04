import { Db, Collection } from 'mongodb';
import { dbConnection } from './database';
import {
  StatusSystemContext,
  AvailableStatus,
  StatusChangeResult,
  ContentStatusHistory
} from './types/statusSystem';

export class MongoStatusSystemRepository {
  private async getDatabase(): Promise<Db> {
    return await dbConnection.connect();
  }

  async initializeStatusSystem(): Promise<void> {
    const db = await this.getDatabase();
    
    // Initialize status definitions collection
    const statusDefinitions = db.collection('status_definitions');
    const statusCount = await statusDefinitions.countDocuments();
    
    if (statusCount === 0) {
      await statusDefinitions.insertMany([
        {
          code: 'draft',
          displayName: 'Rascunho',
          description: 'Conteúdo em elaboração',
          colorBackground: 'rgba(156, 163, 175, 0.15)',
          colorBorder: '#9ca3af',
          colorText: '#374151',
          colorHeaderBg: 'rgba(156, 163, 175, 0.1)',
          sortOrder: 1,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          code: 'pending_approval',
          displayName: 'Aguardando Aprovação',
          description: 'Aguardando aprovação administrativa',
          colorBackground: 'rgba(251, 146, 60, 0.15)',
          colorBorder: '#fb923c',
          colorText: '#c2410c',
          colorHeaderBg: 'rgba(251, 146, 60, 0.1)',
          sortOrder: 2,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          code: 'approved',
          displayName: 'Aprovado',
          description: 'Conteúdo aprovado mas não publicado',
          colorBackground: 'rgba(34, 197, 94, 0.15)',
          colorBorder: '#22c55e',
          colorText: '#166534',
          colorHeaderBg: 'rgba(34, 197, 94, 0.1)',
          sortOrder: 3,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          code: 'published',
          displayName: 'Publicado',
          description: 'Conteúdo público e visível',
          colorBackground: 'rgba(34, 197, 94, 0.15)',
          colorBorder: '#22c55e',
          colorText: '#166534',
          colorHeaderBg: 'rgba(34, 197, 94, 0.1)',
          sortOrder: 4,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          code: 'rejected',
          displayName: 'Rejeitado',
          description: 'Conteúdo rejeitado',
          colorBackground: 'rgba(239, 68, 68, 0.15)',
          colorBorder: '#ef4444',
          colorText: '#dc2626',
          colorHeaderBg: 'rgba(239, 68, 68, 0.1)',
          sortOrder: 5,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          code: 'expired',
          displayName: 'Expirado',
          description: 'Conteúdo expirado',
          colorBackground: 'rgba(107, 114, 128, 0.15)',
          colorBorder: '#6b7280',
          colorText: '#374151',
          colorHeaderBg: 'rgba(107, 114, 128, 0.1)',
          sortOrder: 6,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]);
    }

    // Initialize status context mappings
    const mappings = db.collection('status_context_mappings');
    const mappingsCount = await mappings.countDocuments();
    
    if (mappingsCount === 0) {
      await mappings.insertMany([
        // News management context
        { contentType: 'news', context: 'management', statusCode: 'draft', isDefault: true, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'news', context: 'management', statusCode: 'pending_approval', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'news', context: 'management', statusCode: 'published', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'news', context: 'management', statusCode: 'rejected', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        
        // News approval context
        { contentType: 'news', context: 'approval', statusCode: 'pending_approval', isDefault: true, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'news', context: 'approval', statusCode: 'approved', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'news', context: 'approval', statusCode: 'rejected', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        
        // Ads management context
        { contentType: 'ads', context: 'management', statusCode: 'draft', isDefault: true, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'ads', context: 'management', statusCode: 'pending_approval', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'ads', context: 'management', statusCode: 'approved', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'ads', context: 'management', statusCode: 'published', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'ads', context: 'management', statusCode: 'rejected', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'ads', context: 'management', statusCode: 'expired', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        
        // Ads approval context
        { contentType: 'ads', context: 'approval', statusCode: 'pending_approval', isDefault: true, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'ads', context: 'approval', statusCode: 'approved', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'ads', context: 'approval', statusCode: 'rejected', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        
        // Public context
        { contentType: 'news', context: 'public', statusCode: 'published', isDefault: false, isVisible: true, createdAt: new Date().toISOString() },
        { contentType: 'ads', context: 'public', statusCode: 'published', isDefault: false, isVisible: true, createdAt: new Date().toISOString() }
      ]);
    }
  }

  async getAvailableStatusesForContext(
    contentType: string,
    context: string
  ): Promise<AvailableStatus[]> {
    const db = await this.getDatabase();
    
    // Get mappings for this content type and context
    const mappings = await db.collection('status_context_mappings').find({
      contentType,
      context,
      isVisible: true
    }).toArray();

    if (mappings.length === 0) {
      return [];
    }

    // Get status definitions for these mappings
    const statusCodes = mappings.map(m => m.statusCode);
    const statusDefs = await db.collection('status_definitions').find({
      code: { $in: statusCodes },
      isActive: true
    }).sort({ sortOrder: 1 }).toArray();

    // Convert to AvailableStatus format
    return statusDefs.map(status => {
      const mapping = mappings.find(m => m.statusCode === status.code);
      return {
        code: status.code,
        displayName: status.displayName,
        description: status.description,
        colors: {
          background: status.colorBackground || '',
          border: status.colorBorder || '',
          text: status.colorText || '',
          headerBg: status.colorHeaderBg || ''
        },
        isDefault: mapping?.isDefault || false,
        sortOrder: status.sortOrder
      };
    });
  }

  async addStatusHistory(entry: Omit<ContentStatusHistory, 'id' | 'changedAt'>): Promise<ContentStatusHistory> {
    const db = await this.getDatabase();
    
    const historyEntry = {
      ...entry,
      changedAt: new Date().toISOString()
    };

    const result = await db.collection('content_status_history').insertOne(historyEntry);
    
    return {
      id: parseInt(result.insertedId.toString()),
      changedAt: historyEntry.changedAt,
      ...entry
    };
  }

  async changeContentStatus(
    contentType: string,
    contentId: number,
    newStatusCode: string,
    changedBy?: number,
    reason?: string,
    metadata?: Record<string, any>
  ): Promise<StatusChangeResult> {
    try {
      // Add to history
      const historyEntry = await this.addStatusHistory({
        contentType,
        contentId,
        statusCode: newStatusCode,
        changedBy,
        reason,
        metadata
      });

      // In a real implementation, you would also update the actual content document
      // For now, we'll just return success
      return {
        success: true,
        newStatus: newStatusCode,
        historyEntry
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
