import React from 'react';
import './ListView.scss';

interface ListViewProps {
  items: any[];
  renderListItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

const ListView: React.FC<ListViewProps> = ({
  items,
  renderListItem,
  className = ''
}) => {
  return (
    <div className={`list-view-container ${className}`}>
      <div className="news-list-grid">
        {items.map((item, index) => (
          <div key={item.id || `item-${index}`} className="news-list-item">
            {renderListItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListView;
