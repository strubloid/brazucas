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
  const [scrollPosition, setScrollPosition] = useState(0);
  const itemHeight = 350; // Increased for better spacing
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const removingExtra = 250;
      // Very smooth continuous scrolling - allow scrolling to the very last item
      const maxScroll = Math.max(0, (items.length - 1) * itemHeight);
      const newPosition = Math.max(0, 
        Math.min(scrollPosition + e.deltaY * 0.6, maxScroll - removingExtra));
      
      setScrollPosition(newPosition);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scrollPosition, items.length, itemHeight]);

  // Calculate visible items based on scroll position
  const startIndex = Math.floor(scrollPosition / itemHeight);
  const endIndex = Math.min(startIndex + 5, items.length); // Show 5 items for smooth overlap
  const visibleItems = items.slice(Math.max(0, startIndex), endIndex);

  return (
    <div 
      ref={containerRef}
      className={`list-view-container continuous-scroll ${className}`}
    >
      <div 
        className="news-list-grid"
        style={{
          transform: `translateY(-${scrollPosition % itemHeight}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          const isFromLeft = actualIndex % 2 === 0;
          
          return (
            <div 
              key={item.id || `item-${actualIndex}`} 
              className={`news-list-item smooth-reveal ${isFromLeft ? 'from-left' : 'from-right'}`}
              style={{
                height: `${itemHeight}px`,
                animationDelay: `${index * 0.05}s`
              }}
            >
              {renderListItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
      
      {/* Continuous scroll progress */}
      <div className="scroll-indicator">
        <div className="scroll-progress" style={{
          height: `${items.length > 1 ? (scrollPosition / ((items.length - 1) * itemHeight)) * 100 : 100}%`
        }} />
      </div>
    </div>
  );
};

export default ListView;
