import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faThList, faTh } from '@fortawesome/free-solid-svg-icons';
import './ViewModeControls.scss';

export type ViewMode = 'card' | '3x' | 'list';

interface ViewModeControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
  className?: string;
}

const ViewModeControls: React.FC<ViewModeControlsProps> = ({
  viewMode,
  onViewModeChange,
  totalItems,
  currentPage,
  totalPages,
  className = ''
}) => {
  return (
    <div className={`view-mode-controls ${className}`}>
      <div className="view-controls">
        <button
          className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
          onClick={() => onViewModeChange('card')}
          title="Visualização em Cards"
        >
          <FontAwesomeIcon icon={faThLarge} />
          CARDS
        </button>
        
        <button
          className={`view-btn ${viewMode === '3x' ? 'active' : ''}`}
          onClick={() => onViewModeChange('3x')}
          title="Visualização 3x Cards"
        >
          <FontAwesomeIcon icon={faTh} />
          3X
        </button>
        
        <button
          className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => onViewModeChange('list')}
          title="Visualização em Lista"
        >
          <FontAwesomeIcon icon={faThList} />
          LISTA
        </button>
      </div>
      
      {(totalItems !== undefined || (currentPage !== undefined && totalPages !== undefined)) && (
        <div className="pagination-info">
          {totalItems !== undefined && (
            <span className="total-items">Total: {totalItems}</span>
          )}
          {currentPage !== undefined && totalPages !== undefined && (
            <span className="page-info">{currentPage} de {totalPages}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewModeControls;
