import React from 'react';
import { useStatusSystem } from '../../hooks/useStatusSystem';
import {
  StatusSystemContext,
  AvailableStatus,
  UseStatusSystemOptions
} from '../../types/statusSystem';
import './EnhancedStatusFilter.scss';

interface EnhancedStatusFilterProps {
  context: StatusSystemContext;
  onSelectionChange?: (selectedStatuses: string[]) => void;
  className?: string;
  showSelectAll?: boolean;
  showClearAll?: boolean;
  multiSelect?: boolean;
  options?: UseStatusSystemOptions;
  compact?: boolean;
}

export const EnhancedStatusFilter: React.FC<EnhancedStatusFilterProps> = ({
  context,
  onSelectionChange,
  className = '',
  showSelectAll = true,
  showClearAll = true,
  multiSelect = true,
  options = {},
  compact = false
}) => {
  const {
    loading,
    error,
    availableStatuses,
    selectedStatuses,
    setSelectedStatuses,
    toggleStatus,
    clearAll,
    selectAll
  } = useStatusSystem(context, options);

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedStatuses);
    }
  }, [selectedStatuses, onSelectionChange]);

  const handleStatusClick = (statusCode: string) => {
    if (!multiSelect) {
      // Single select mode: replace selection
      if (onSelectionChange) {
        onSelectionChange([statusCode]);
      }
    } else {
      // Multi select mode: toggle status
      
      // Special handling for any status being deselected when it's the only one selected
      if (selectedStatuses.includes(statusCode) && selectedStatuses.length === 1) {
        console.log(`Special handling for ${statusCode} status deselection when it's the only selected status`);
        
        // If this is the only selected status and it's being deselected, force empty selection
        clearAll();
        if (onSelectionChange) {
          onSelectionChange([]);
        }
        return;
      }
      
      // Normal toggle for all other cases
      toggleStatus(statusCode);
    }
  };

  const handleSelectAll = () => {
    if (multiSelect) {
      selectAll();
      // Force direct notification to parent with all statuses to ensure proper selection
      if (onSelectionChange) {
        onSelectionChange(availableStatuses.map(s => s.code));
      }
    }
  };

  const handleClearAll = () => {
    // First call internal clearAll
    clearAll();
    
    // Force direct notification to parent with empty array
    if (onSelectionChange) {
      console.log("EnhancedStatusFilter: Notifying parent of empty selection");
      onSelectionChange([]);
      
      // Use multiple notifications to ensure the parent gets the empty selection
      const notifyParentOfEmptySelection = () => {
        setSelectedStatuses([]);
        onSelectionChange([]);
      };
      
      // Multiple attempts to ensure parent gets updated
      setTimeout(notifyParentOfEmptySelection, 50);
      setTimeout(notifyParentOfEmptySelection, 100);
      setTimeout(notifyParentOfEmptySelection, 200);
    }
  };

  if (loading) {
    return (
      <div className={`enhanced-status-filter loading ${className}`}>
        <div className="loading-spinner">Carregando status...</div>
      </div>
    );
  }

  // Show empty message only if no statuses and no error (real failure case)
  if (availableStatuses.length === 0 && !error) {
    return (
      <div className={`enhanced-status-filter empty ${className}`}>
        <div className="empty-message">Nenhum status disponível</div>
      </div>
    );
  }

  // If we have an error but no statuses, something went wrong with fallback
  if (availableStatuses.length === 0 && error) {
    return (
      <div className={`enhanced-status-filter error ${className}`}>
        <div className="error-message">Erro: {error}</div>
      </div>
    );
  }

  // Hide the filter completely when there's only one status available in approval screens
  if (context.context === 'approval' && availableStatuses.length <= 1) {
    return null;
  }

  const selectedCount = selectedStatuses.length;
  const totalCount = availableStatuses.length;

  return (
    <div className={`enhanced-status-filter ${compact ? 'compact' : ''} ${className}`}>
      {!compact && (
        <div className="filter-header">
          <h4 className="filter-title">
            Status {context.contentType === 'news' ? 'das Notícias' : 'dos Anúncios'}
            {error && (
              <span className="fallback-indicator" title={error}>
                {' '}(offline)
              </span>
            )}
          </h4>
          {multiSelect && (
            <div className="selection-info">
              {selectedCount} de {totalCount} selecionados
            </div>
          )}
        </div>
      )}
      <div className="filter-container">
        {multiSelect && (showSelectAll || showClearAll) && (
            <div className="filter-actions">
            {showSelectAll && (
                <button
                type="button"
                className="action-button select-all"
                onClick={handleSelectAll}
                disabled={selectedCount === totalCount}
                >
                Selecionar Todos
                </button>
            )}
            {showClearAll && (
                <button
                type="button"
                className="action-button clear-all"
                onClick={handleClearAll}
                disabled={selectedCount === 0}
                >
                Limpar Todos
                </button>
            )}
            </div>
        )}

        <div className="status-options">
            {availableStatuses.filter(status => status && status.code).map((status: AvailableStatus) => {
            const isSelected = selectedStatuses.includes(status.code);
            const isDefault = status.isDefault;

            return (
                <button
                key={status.code}
                type="button"
                className={`status-option ${isSelected ? 'selected' : ''} ${isDefault ? 'default' : ''}`}
                onClick={() => handleStatusClick(status.code)}
                style={{
                    '--status-bg': status.colors.background,
                    '--status-border': status.colors.border,
                    '--status-text': status.colors.text,
                    '--status-header-bg': status.colors.headerBg
                } as React.CSSProperties}
                title={status.description || status.displayName}
                >
                <div className="status-indicator">
                    {multiSelect && (
                    <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <span className="checkmark">✓</span>}
                    </div>
                    )}
                    <div className="status-badge">
                    <span className="status-name">{status.displayName}</span>
                    </div>
                </div>
                </button>
            );
            })}
        </div>
      </div>

      {context.context === 'approval' && (
        <div className="approval-context-info">
          <small>Contexto: Aprovação de {context.contentType === 'news' ? 'Notícias' : 'Anúncios'}</small>
        </div>
      )}
    </div>
  );
};
