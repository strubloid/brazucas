import { useState, useEffect, useCallback } from 'react';
import {
  StatusSystemContext,
  AvailableStatus,
  UseStatusSystemResult,
  UseStatusSystemOptions
} from '../types/statusSystem';
import { statusSystemService } from '../services/statusSystemService';

/**
 * React hook for managing status system state
 */
export const useStatusSystem = (
  context: StatusSystemContext,
  options: UseStatusSystemOptions = {}
): UseStatusSystemResult => {
  const {
    initialStatuses = [],
    autoFetch = true,
    persistSelection = false,
    storageKey = `status-selection-${context.contentType}-${context.context}`
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableStatuses, setAvailableStatuses] = useState<AvailableStatus[]>([]);
  const [selectedStatuses, setSelectedStatusesState] = useState<string[]>(() => {
    if (persistSelection) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall back to initial statuses
        }
      }
    }
    return initialStatuses;
  });

  // Fetch available statuses for the current context
  const fetchAvailableStatuses = useCallback(async () => {
    if (!autoFetch) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await statusSystemService.getContextualStatuses(context);
      
      // Check if response and availableStatuses exist
      if (response && response.availableStatuses && Array.isArray(response.availableStatuses)) {
        setAvailableStatuses(response.availableStatuses);
        
        // If no statuses are selected and we have available statuses, select the default
        if (selectedStatuses.length === 0 && response.availableStatuses.length > 0) {
          const defaultStatus = response.availableStatuses.find(s => s.isDefault);
          if (defaultStatus) {
            setSelectedStatusesState([defaultStatus.code]);
          }
        }
      } else {
        // Invalid API response, use fallback
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.warn('Failed to fetch statuses from API, using fallback data:', err);
      
      // Fallback mock data based on context
      const fallbackStatuses = getFallbackStatuses(context);
      setAvailableStatuses(fallbackStatuses);
      
      if (selectedStatuses.length === 0 && fallbackStatuses.length > 0) {
        const defaultStatus = fallbackStatuses.find(s => s.isDefault);
        if (defaultStatus) {
          setSelectedStatusesState([defaultStatus.code]);
        }
      }
      
      setError('Usando dados locais - API não disponível');
    } finally {
      setLoading(false);
    }
  }, [context, autoFetch, selectedStatuses.length]);

  // Fallback status data when API is not available
  const getFallbackStatuses = (ctx: StatusSystemContext): AvailableStatus[] => {
    const baseStatuses = {
      draft: {
        code: 'draft',
        displayName: 'Rascunho',
        colors: {
          background: 'rgba(107, 114, 128, 0.15)',
          border: '#6b7280',
          text: '#374151',
          headerBg: 'rgba(107, 114, 128, 0.1)'
        },
        isDefault: true,
        sortOrder: 1
      },
      pending_approval: {
        code: 'pending_approval',
        displayName: 'Pendente Aprovação',
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
      archived: {
        code: 'archived',
        displayName: 'Arquivado',
        colors: {
          background: 'rgba(107, 114, 128, 0.15)',
          border: '#6b7280',
          text: '#374151',
          headerBg: 'rgba(107, 114, 128, 0.1)'
        },
        isDefault: false,
        sortOrder: 6
      }
    };

    if (ctx.context === 'management') {
      return [
        baseStatuses.draft,
        baseStatuses.pending_approval,
        baseStatuses.published,
        baseStatuses.rejected,
        baseStatuses.archived
      ];
    } else if (ctx.context === 'approval') {
      return [
        { ...baseStatuses.pending_approval, isDefault: true },
        baseStatuses.approved,
        baseStatuses.rejected
      ];
    } else {
      return [baseStatuses.published];
    }
  };

  // Update selected statuses with persistence
  const setSelectedStatuses = useCallback((statuses: string[] | ((prev: string[]) => string[])) => {
    const newStatuses = typeof statuses === 'function' ? statuses(selectedStatuses) : statuses;
    setSelectedStatusesState(newStatuses);
    
    if (persistSelection) {
      localStorage.setItem(storageKey, JSON.stringify(newStatuses));
    }
  }, [persistSelection, storageKey, selectedStatuses]);

  // Toggle a specific status
  const toggleStatus = useCallback((statusCode: string) => {
    setSelectedStatuses((prev: string[]) => {
      if (prev.includes(statusCode)) {
        return prev.filter((s: string) => s !== statusCode);
      } else {
        return [...prev, statusCode];
      }
    });
  }, [setSelectedStatuses]);

  // Clear all selected statuses
  const clearAll = useCallback(() => {
    setSelectedStatuses([]);
  }, [setSelectedStatuses]);

  // Select all available statuses
  const selectAll = useCallback(() => {
    setSelectedStatuses(availableStatuses.map(s => s.code));
  }, [availableStatuses, setSelectedStatuses]);

  // Fetch statuses when context changes
  useEffect(() => {
    fetchAvailableStatuses();
  }, [fetchAvailableStatuses]);

  return {
    loading,
    error,
    availableStatuses,
    selectedStatuses,
    setSelectedStatuses,
    toggleStatus,
    clearAll,
    selectAll,
    context
  };
};

/**
 * Hook for status changes with optimistic updates
 */
export const useStatusChange = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = useCallback(async (
    contentType: string,
    contentId: number,
    newStatusCode: string,
    reason?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await statusSystemService.changeContentStatus({
        contentType,
        contentId,
        newStatusCode,
        reason
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to change status');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveContent = useCallback(async (
    contentType: string,
    contentId: number,
    reason?: string
  ) => {
    return changeStatus(contentType, contentId, 'approved', reason);
  }, [changeStatus]);

  const rejectContent = useCallback(async (
    contentType: string,
    contentId: number,
    reason?: string
  ) => {
    return changeStatus(contentType, contentId, 'rejected', reason);
  }, [changeStatus]);

  const publishContent = useCallback(async (
    contentType: string,
    contentId: number,
    reason?: string
  ) => {
    return changeStatus(contentType, contentId, 'published', reason);
  }, [changeStatus]);

  return {
    loading,
    error,
    changeStatus,
    approveContent,
    rejectContent,
    publishContent
  };
};
