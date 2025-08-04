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
      // Wrap the API call in a try-catch to handle network errors
      let response;
      try {
        response = await statusSystemService.getContextualStatuses(context);
      } catch (apiError) {
        console.error('API call failed:', apiError);
        throw new Error('Failed to connect to API');
      }
      
      // Safe check for response structure before using it
      if (response && typeof response === 'object' && 
          'availableStatuses' in response && 
          Array.isArray(response.availableStatuses)) {
        setAvailableStatuses(response.availableStatuses);
        
        // ONLY auto-select default on first initialization, not on subsequent fetches
        // Also check if there's a flag indicating explicit clear was performed
        const wasExplicitlyCleared = localStorage.getItem(`${storageKey}-cleared`) === "true";
        if (!wasExplicitlyCleared && selectedStatuses.length === 0 && initialStatuses.length === 0) {
          console.log("Auto-selecting default status on first load only");
          const defaultStatus = response.availableStatuses.find(s => s.isDefault);
          if (defaultStatus) {
            setSelectedStatusesState([defaultStatus.code]);
          }
        }
      } else {
        // Invalid API response, use fallback
        console.warn('Invalid API response structure:', response);
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.warn('Failed to fetch statuses from API, using fallback data:', err);
      
      try {
        // Try to use the service's built-in mock data
        const mockResponse = await statusSystemService.getContextualStatuses(context);
        setAvailableStatuses(mockResponse.availableStatuses);
        
        // Handle default selection logic
        const wasExplicitlyCleared = localStorage.getItem(`${storageKey}-cleared`) === "true";
        if (!wasExplicitlyCleared && selectedStatuses.length === 0 && initialStatuses.length === 0) {
          const defaultStatus = mockResponse.availableStatuses.find(s => s.isDefault);
          if (defaultStatus) {
            console.log("Auto-selecting default status from mock data");
            setSelectedStatusesState([defaultStatus.code]);
          }
        }
      } catch (mockErr) {
        // If even the mock data fails, use our local fallback
        console.error('Even mock data failed, using local fallback:', mockErr);
        
        // Fallback mock data based on context
        const fallbackStatuses = getFallbackStatuses(context);
        setAvailableStatuses(fallbackStatuses);
        
        // ONLY auto-select default on first initialization, not on subsequent fetches
        // Also check if there's a flag indicating explicit clear was performed
        const wasExplicitlyCleared = localStorage.getItem(`${storageKey}-cleared`) === "true";
        if (!wasExplicitlyCleared && selectedStatuses.length === 0 && fallbackStatuses.length > 0 && initialStatuses.length === 0) {
          console.log("Auto-selecting default status from local fallback on first load only");
          const defaultStatus = fallbackStatuses.find(s => s.isDefault);
          if (defaultStatus) {
            setSelectedStatusesState([defaultStatus.code]);
          }
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
      // Removed archived status as it's not needed
    };

    if (ctx.context === 'management') {
      return [
        baseStatuses.draft,
        baseStatuses.pending_approval,
        baseStatuses.published,
        baseStatuses.rejected
      ];
    } else if (ctx.context === 'approval') {
      // Only show "Pendente Aprovação" for approval screens
      return [
        { ...baseStatuses.pending_approval, isDefault: true }
      ];
    } else {
      return [baseStatuses.published];
    }
  };

  // Update selected statuses with persistence
  const setSelectedStatuses = useCallback((statuses: string[] | ((prev: string[]) => string[])) => {
    const newStatuses = typeof statuses === 'function' ? statuses(selectedStatuses) : statuses;
    
    // Handle persistence before state update
    if (persistSelection) {
      if (!newStatuses || newStatuses.length === 0) {
        // For empty selection, clear localStorage and mark as explicitly cleared
        console.log('Removing persistence for status selection:', storageKey);
        localStorage.removeItem(storageKey);
        localStorage.setItem(`${storageKey}-cleared`, "true");
      } else {
        // For non-empty selection, update localStorage
        localStorage.setItem(storageKey, JSON.stringify(newStatuses));
        // Remove the cleared flag
        localStorage.removeItem(`${storageKey}-cleared`);
      }
    }
    
    // If setting to empty, ensure we mark as explicitly cleared
    if (!newStatuses || newStatuses.length === 0) {
      console.log('Setting explicitly empty status selection');
      localStorage.setItem(`${storageKey}-cleared`, "true");
    }
    
    // Always update state
    setSelectedStatusesState(newStatuses);
    
    // Ensure empty array stays empty with multiple checks
    if (!newStatuses || newStatuses.length === 0) {
      console.log('Ensuring empty status selection stays empty');
      setTimeout(() => {
        setSelectedStatusesState([]);
      }, 10);
      
      // Double-check again after a longer delay
      setTimeout(() => {
        setSelectedStatusesState(current => current.length > 0 ? [] : current);
      }, 50);
    }
  }, [persistSelection, storageKey, selectedStatuses]);

  // Toggle a specific status
  const toggleStatus = useCallback((statusCode: string) => {
    setSelectedStatuses((prev: string[]) => {
      if (prev.includes(statusCode)) {
        // Mark as explicitly cleared if we're removing the last status
        if (prev.length === 1 && persistSelection) {
          console.log(`Marking ${storageKey} as explicitly cleared`);
          localStorage.setItem(`${storageKey}-cleared`, "true");
          
          // For last status removal, ensure we return empty array and don't auto-select anything
          console.log("Last status being removed, ensuring empty selection");
          return [];
        }
        return prev.filter((s: string) => s !== statusCode);
      } else {
        return [...prev, statusCode];
      }
    });
    
    // For deselection, verify the state actually changed after a short delay
    setTimeout(() => {
      setSelectedStatusesState(current => {
        if (!current.includes(statusCode)) {
          // If status was removed, make sure we don't have unexpected auto-selection
          if (current.length === 0) {
            // Keep it empty
            return [];
          }
        }
        return current;
      });
    }, 10);
  }, [setSelectedStatuses, persistSelection, storageKey]);

  // Clear all selected statuses - ensure all statuses are really deselected
  const clearAll = useCallback(() => {
    console.log("CLEARING ALL STATUSES");
    
    // Set explicit flag in localStorage to prevent auto-selection of defaults
    if (persistSelection) {
      console.log(`Setting explicit clear flag for ${storageKey}`);
      localStorage.setItem(`${storageKey}-cleared`, "true");
      localStorage.removeItem(storageKey);
    }
    
    // Force direct state update with empty array
    setSelectedStatusesState([]);
    
    // Multiple checks to ensure state remains empty
    const verifyEmptySelection = () => {
      setSelectedStatusesState(current => {
        if (current.length > 0) {
          console.log(`Found ${current.length} statuses still selected, forcing clear`);
          return [];
        }
        return current;
      });
    };
    
    // Check multiple times to ensure it stays cleared
    setTimeout(verifyEmptySelection, 10);
    setTimeout(verifyEmptySelection, 50);
    setTimeout(verifyEmptySelection, 100);
    
    // Final verification
    setTimeout(() => {
      const currentSelection = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (currentSelection.length > 0) {
        console.log('Final verification found persisted selection, forcing clear');
        localStorage.removeItem(storageKey);
        localStorage.setItem(`${storageKey}-cleared`, "true");
        setSelectedStatusesState([]);
      }
    }, 150);
  }, [persistSelection, storageKey]);

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
