import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './CardView.scss';

interface CardViewProps {
  items: any[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
  renderCard: (item: any, index: number) => React.ReactNode;
  containerRef?: React.RefObject<HTMLDivElement>;
  cardRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>;
  className?: string;
  cardsPerPage?: number; // New prop to control how many cards to show
}

type TransitionDirection = 'next' | 'prev' | null;

const CardView: React.FC<CardViewProps> = ({
  items,
  currentIndex,
  onPrevious,
  onNext,
  onDotClick,
  renderCard,
  containerRef,
  cardRefs,
  className = '',
  cardsPerPage = 3 // Default to 3 cards
}) => {
  // Simplified state management - MUST be before any early returns
  const [animationState, setAnimationState] = useState<{
    isAnimating: boolean;
    direction: 'next' | 'prev' | null;
    fromIndex: number | null;
    toIndex: number;
  }>({
    isAnimating: false,
    direction: null,
    fromIndex: null,
    toIndex: currentIndex
  });
  
  const [lastClickTime, setLastClickTime] = useState(0);

  // Ensure currentIndex is valid and provide fallback
  const effectiveCurrentIndex = items && items.length > 0 
    ? Math.max(0, Math.min(currentIndex, items.length - 1))
    : 0;
  
  // Robust animation end handler
  const handleAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const animationName = event.animationName;
    
    // Only handle our entering animations (when new card finishes animating in)
    if (target.classList.contains('card-wrapper') && 
        (animationName === 'cardFlipIn' || animationName === 'cardFlipInLeft')) {
      
      setAnimationState(prev => ({
        ...prev,
        isAnimating: false,
        direction: null,
        fromIndex: null
      }));
    }
  };

  // Update animation state when currentIndex changes
  useEffect(() => {
    if (items && items.length > 0 && effectiveCurrentIndex !== animationState.toIndex) {
      const fromIndex = animationState.toIndex;
      let direction: 'next' | 'prev' = 'next';
      
      // Determine direction including wrap-around
      if (fromIndex === items.length - 1 && effectiveCurrentIndex === 0) {
        direction = 'next'; // Wrapped forward
      } else if (fromIndex === 0 && effectiveCurrentIndex === items.length - 1) {
        direction = 'prev'; // Wrapped backward  
      } else if (effectiveCurrentIndex > fromIndex) {
        direction = 'next';
      } else {
        direction = 'prev';
      }
      
      setAnimationState({
        isAnimating: true,
        direction,
        fromIndex,
        toIndex: effectiveCurrentIndex
      });
    }
  }, [effectiveCurrentIndex, items?.length, animationState.toIndex]);

  // Fallback safety mechanism - if animation gets stuck, reset after timeout
  useEffect(() => {
    if (animationState.isAnimating) {
      const fallbackTimer = setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          isAnimating: false,
          direction: null,
          fromIndex: null
        }));
      }, 1000); // 1 second fallback
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [animationState.isAnimating]);

  // Early safety check - AFTER all hooks
  if (!items || items.length === 0) {
    console.log('CardView: No items provided - showing fallback message');
    return (
      <div className={`pokemon-carousel ${className} empty`} ref={containerRef}>
        <div className="cards-container">
          <div className="no-items">No items to display</div>
        </div>
      </div>
    );
  }
  
  if (currentIndex !== effectiveCurrentIndex) {
    console.log('CardView: Invalid currentIndex corrected', { 
      provided: currentIndex, 
      effective: effectiveCurrentIndex, 
      itemsLength: items.length 
    });
  }

  // Simplified navigation handlers
  const handleNext = () => {
    const now = Date.now();
    if (items.length > 1 && now - lastClickTime > 300) {
      setLastClickTime(now);
      onNext();
    }
  };

  const handlePrevious = () => {
    const now = Date.now();
    if (items.length > 1 && now - lastClickTime > 300) {
      setLastClickTime(now);
      onPrevious();
    }
  };

  // Simplified card class logic
  const getCardClasses = (index: number) => {
    let classes = 'card-wrapper';
    
    if (animationState.isAnimating) {
      if (index === animationState.fromIndex) {
        // Card that's leaving
        classes += animationState.direction === 'next' ? ' exiting-left' : ' exiting-right';
      } else if (index === animationState.toIndex) {
        // Card that's entering
        classes += animationState.direction === 'next' ? ' entering-right' : ' entering-left';
      } else {
        // Other cards
        classes += ' hidden';
      }
    } else {
      // No animation - show cards based on view mode
      if (cardsPerPage === 1) {
        if (index === effectiveCurrentIndex) {
          classes += ' active';
        } else {
          classes += ' hidden';
        }
      } else {
        // Multi-card view - show multiple cards
        const startIndex = effectiveCurrentIndex;
        const endIndex = (effectiveCurrentIndex + cardsPerPage - 1) % items.length;
        
        // Check if this index should be visible
        let isVisible = false;
        for (let i = 0; i < cardsPerPage; i++) {
          const visibleIndex = (startIndex + i) % items.length;
          if (visibleIndex === index) {
            isVisible = true;
            break;
          }
        }
        
        if (isVisible) {
          classes += index === effectiveCurrentIndex ? ' active' : ' visible';
        } else {
          classes += ' hidden';
        }
      }
    }
    
    return classes;
  };
  
  // Simplified visible items logic
  const getVisibleItems = () => {
    if (cardsPerPage === 1) {
      // Single card mode
      if (animationState.isAnimating && animationState.fromIndex !== null) {
        // During animation, show both cards
        return [
          { item: items[animationState.fromIndex], index: animationState.fromIndex },
          { item: items[animationState.toIndex], index: animationState.toIndex }
        ];
      } else {
        // Not animating, show current card only
        return [{ item: items[effectiveCurrentIndex], index: effectiveCurrentIndex }];
      }
    } else {
      // Multi-card mode - show multiple cards starting from current
      const visibleItems = [];
      for (let i = 0; i < cardsPerPage && i < items.length; i++) {
        const itemIndex = (effectiveCurrentIndex + i) % items.length;
        visibleItems.push({ item: items[itemIndex], index: itemIndex });
      }
      return visibleItems;
    }
  };

  const visibleItems = getVisibleItems();

  return (
    <div className={`pokemon-carousel ${className}`} ref={containerRef}>
      {/* Navigation buttons - show if more than 1 item total */}
      {items.length > 1 && (
        <>
          <button 
            className="carousel-nav carousel-nav--prev"
            onClick={handlePrevious}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <button 
            className="carousel-nav carousel-nav--next"
            onClick={handleNext}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </>
      )}

      {/* Cards Container */}
      <div className="cards-container">
        {visibleItems.map(({ item, index }) => (
          <div
            key={item.id || `${index}-${animationState.isAnimating ? animationState.direction : 'static'}`}
            className={getCardClasses(index)}
            onAnimationEnd={handleAnimationEnd}
            ref={cardRefs ? el => {
              if (cardRefs.current) {
                cardRefs.current[index] = el;
              }
            } : undefined}
          >
            {renderCard(item, index)}
          </div>
        ))}
      </div>

      {/* Dots indicator - show if more than 1 item and using pages */}
      {items.length > 1 && cardsPerPage > 1 && (
        <div className="carousel-dots">
          {Array.from({ length: Math.ceil(items.length / cardsPerPage) }, (_, pageIndex) => (
            <button
              key={pageIndex}
              className={`carousel-dot ${Math.floor(currentIndex / cardsPerPage) === pageIndex ? 'active' : ''}`}
              onClick={() => onDotClick(pageIndex * cardsPerPage)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardView;
