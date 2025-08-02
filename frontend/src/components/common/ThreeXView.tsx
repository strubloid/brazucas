import React from 'react';
import './ThreeXView.scss';

interface ThreeXViewProps {
  items: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
  className?: string;
}

const ThreeXView: React.FC<ThreeXViewProps> = ({
  items,
  renderCard,
  className = ''
}) => {
  return (
    <div className={`cards-3x-container ${className}`}>
      <div className="cards-3x-grid">
        {items.map((item, index) => renderCard(item, index))}
      </div>
    </div>
  );
};

export default ThreeXView;
