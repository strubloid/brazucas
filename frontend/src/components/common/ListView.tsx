import React, { useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const itemsPerView = 3;
  const maxIndex = Math.max(0, items.length - itemsPerView);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isAnimating) return;
      
      const delta = e.deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(currentIndex + delta, maxIndex));
      
      if (newIndex !== currentIndex) {
        setIsAnimating(true);
        setCurrentIndex(newIndex);
        
        setTimeout(() => {
          setIsAnimating(false);
        }, 600);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, maxIndex, isAnimating]);

  // Get the items to display
  const visibleItems = items.slice(currentIndex, currentIndex + itemsPerView);
  const hasMoreAbove = currentIndex > 0;
  const hasMoreBelow = currentIndex < maxIndex;

  return (
    <div 
      ref={containerRef}
      className={`list-view-container scrollable-list ${className}`}
    >
      <div className="news-list-grid">
        {visibleItems.map((item, index) => {
          const actualIndex = currentIndex + index;
          const isFromLeft = actualIndex % 2 === 0;
          
          return (
            <div 
              key={item.id || `item-${actualIndex}`} 
              className={`news-list-item reveal-${isFromLeft ? 'left' : 'right'}`}
              data-index={actualIndex}
            >
              {renderListItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
      
      {/* Scroll indicators */}
      {hasMoreAbove && (
        <div className="scroll-hint scroll-hint-up">
          <span>↑ Scroll up for more</span>
        </div>
      )}
      
      {hasMoreBelow && (
        <div className="scroll-hint scroll-hint-down">
          <span>↓ Scroll down for more</span>
        </div>
      )}
      
      {/* Progress indicator */}
      <div className="scroll-indicator">
        <div className="scroll-progress" style={{
          height: `${maxIndex > 0 ? (currentIndex / maxIndex) * 100 : 100}%`
        }} />
      </div>
    </div>
  );
};

export default ListView;
