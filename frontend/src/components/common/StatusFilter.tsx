import React from 'react';
import { StatusManager } from '../../types/status';
import './StatusFilter.scss';

export interface StatusFilterProps {
  type: 'news' | 'ads';
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  className?: string;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  type,
  selectedStatuses,
  onStatusChange,
  className = ''
}) => {
  const availableStatuses = type === 'news' 
    ? StatusManager.getNewsStatuses() 
    : StatusManager.getAdStatuses();

  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    
    onStatusChange(newStatuses);
  };

  const handleSelectAll = () => {
    if (selectedStatuses.length === availableStatuses.length) {
      onStatusChange([]);
    } else {
      onStatusChange([...availableStatuses]);
    }
  };

  const isAllSelected = selectedStatuses.length === availableStatuses.length;
  const isNoneSelected = selectedStatuses.length === 0;

  return (
    <div className={`status-filter ${className}`}>
      <div className="status-filter-header">
        <h4>Filtrar por Status</h4>
        <button 
          className="select-all-btn"
          onClick={handleSelectAll}
        >
          {isAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
        </button>
      </div>
      
      <div className="status-options">
        {availableStatuses.map((status) => {
          const isSelected = selectedStatuses.includes(status);
          const colors = StatusManager.getStatusColors(status);
          
          return (
            <label 
              key={status}
              className={`status-option ${isSelected ? 'selected' : ''}`}
              style={{
                borderColor: colors.border,
                backgroundColor: isSelected ? colors.background : 'transparent'
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleStatusToggle(status)}
                className="status-checkbox"
              />
              <span 
                className="status-label"
                style={{ color: isSelected ? colors.text : '#64748b' }}
              >
                {StatusManager.getStatusLabel(status)}
              </span>
              <span className="status-count">
                {/* This will be populated by parent component */}
              </span>
            </label>
          );
        })}
      </div>
      
      {isNoneSelected && (
        <div className="filter-hint">
          Selecione pelo menos um status para filtrar
        </div>
      )}
    </div>
  );
};
