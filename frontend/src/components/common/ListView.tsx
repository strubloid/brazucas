import React, { useEffect, useRef, useState } from 'react';
import './ListView.scss';

interface ListViewProps {
  items: any[];
  renderListItem: (item: any, index: number, listItemProps?: any) => React.ReactNode;
  className?: string;
  listType?: 'news' | 'ads'; // Add listType prop to differentiate
}

const ListView: React.FC<ListViewProps> = ({
  items = [], // Default to empty array
  renderListItem,
  className = '',
  listType = 'news' // Default to news type
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const itemHeight = listType === 'ads' ? 550 : 350; // Much larger height for ads
  
  // Safety check - ensure items is a valid array
  const safeItems = Array.isArray(items) ? items.filter(item => item != null) : [];
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const removingExtra = 0;
      // Very smooth continuous scrolling - allow scrolling to the very last item
      const maxScroll = Math.max(0, (safeItems.length - 1) * itemHeight);
      const newPosition = Math.max(0, 
        Math.min(scrollPosition + e.deltaY * 0.6, maxScroll - removingExtra));
      
      setScrollPosition(newPosition);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scrollPosition, safeItems.length, itemHeight]);

  // Calculate visible items based on scroll position
  const startIndex = Math.floor(scrollPosition / itemHeight);
  const endIndex = Math.min(startIndex + 5, safeItems.length); // Show 5 items for smooth overlap
  const visibleItems = safeItems.slice(Math.max(0, startIndex), endIndex);

  // Determine CSS classes based on listType
  const gridClass = listType === 'ads' ? 'ads-list-grid' : 'news-list-grid';
  const itemClass = listType === 'ads' ? 'ads-list-item' : 'news-list-item';

  // If no items, show empty state
  if (safeItems.length === 0) {
    return (
      <div className={`list-view-container ${className}`}>
        <div className="empty-state">
          <p>Nenhum item para exibir</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`list-view-container continuous-scroll ${className}`}
    >
      <div 
        className={gridClass}
        style={{
          transform: `translateY(-${scrollPosition % itemHeight}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          const isFromLeft = actualIndex % 2 === 0;
          
          // Safety check - skip if item is null/undefined
          if (!item) {
            return null;
          }
          
          // Pass the styling information to the renderListItem function
          const listItemProps = {
            key: item.id || `item-${actualIndex}`,
            className: `${itemClass} smooth-reveal ${isFromLeft ? 'from-left' : 'from-right'}`,
            style: {
              height: `${itemHeight}px`,
              animationDelay: `${index * 0.05}s`
            }
          };
          
          return renderListItem(item, actualIndex, listItemProps);
        })}
      </div>
      
      {/* Continuous scroll progress */}
      <div className="scroll-indicator">
        <div className="scroll-progress" style={{
          height: `${safeItems.length > 1 ? (scrollPosition / ((safeItems.length - 1) * itemHeight)) * 100 : 100}%`
        }} />
      </div>
    </div>
  );
};

export default ListView;
