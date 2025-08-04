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
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousIndex, setPreviousIndex] = useState(currentIndex);

  // Safety mechanism to reset stuck transitions
  useEffect(() => {
    if (isTransitioning) {
      console.log('CardView: Starting safety timer for transition');
      const safetyTimer = setTimeout(() => {
        console.warn('CardView: Resetting stuck transition - currentIndex:', currentIndex, 'previousIndex:', previousIndex, 'direction:', transitionDirection);
        setIsTransitioning(false);
        setTransitionDirection(null);
      }, 1000); // Reduced to 1 second safety timeout

      return () => {
        console.log('CardView: Clearing safety timer');
        clearTimeout(safetyTimer);
      };
    }
  }, [isTransitioning, currentIndex, previousIndex, transitionDirection]);

  useEffect(() => {
    if (currentIndex !== previousIndex) {
      console.log('CardView: Transition starting', { currentIndex, previousIndex, itemsLength: items.length });
      setIsTransitioning(true);
      
      // Determine direction based on index change
      let direction: TransitionDirection = null;
      
      // Handle wrap-around cases for circular navigation
      if (previousIndex === items.length - 1 && currentIndex === 0) {
        // Wrapped forward (last -> first)
        direction = 'next';
      } else if (previousIndex === 0 && currentIndex === items.length - 1) {
        // Wrapped backward (first -> last)
        direction = 'prev';
      } else if (currentIndex > previousIndex) {
        // Normal forward movement
        direction = 'next';
      } else if (currentIndex < previousIndex) {
        // Normal backward movement
        direction = 'prev';
      }
      
      console.log('CardView: Direction determined:', direction);
      setTransitionDirection(direction);
      setPreviousIndex(currentIndex);

      // Use timing that matches the beautiful flip animations
      const timer = setTimeout(() => {
        console.log('CardView: Transition completed via timeout');
        setIsTransitioning(false);
        setTransitionDirection(null);
      }, 800); // 0.6s animation + 0.2s delay for perfect timing

      return () => {
        console.log('CardView: Cleaning up transition timer');
        clearTimeout(timer);
      };
    }
  }, [currentIndex, previousIndex, items.length]);

  const handleNext = () => {
    if (!isTransitioning && items.length > 1) {
      console.log('CardView: Next clicked, current:', currentIndex);
      onNext();
    }
  };

  const handlePrevious = () => {
    if (!isTransitioning && items.length > 1) {
      console.log('CardView: Previous clicked, current:', currentIndex);
      onPrevious();
    }
  };

  const getCardClasses = (index: number) => {
    let classes = 'card-wrapper';
    
    if (isTransitioning && transitionDirection) {
      if (index === previousIndex) {
        // Current card exiting
        const exitClass = transitionDirection === 'next' ? ' exiting-left' : ' exiting-right';
        classes += exitClass;
        console.log(`CardView: Card ${index} exiting with class:`, exitClass);
      } else if (index === currentIndex) {
        // New card entering
        const enterClass = transitionDirection === 'next' ? ' entering-right' : ' entering-left';
        classes += enterClass;
        console.log(`CardView: Card ${index} entering with class:`, enterClass);
      } else {
        classes += ' visible';
      }
    } else {
      // No transition - show current cards normally
      if (cardsPerPage === 1) {
        // For single card view, only show current card
        if (index === currentIndex) {
          classes += ' active';
        } else {
          classes += ' hidden'; // Explicitly hide others
        }
      } else {
        // For multi-card view
        if (index === currentIndex) {
          classes += ' active';
        } else {
          classes += ' visible';
        }
      }
    }
    
    return classes;
  };
  const getVisibleItems = () => {
    if (cardsPerPage === 1) {
      // For single card view, show both current and previous during transition
      if (isTransitioning && previousIndex !== currentIndex) {
        const visibleItems: { item: any; index: number }[] = [];
        // Add previous card (will be exiting)
        visibleItems.push({ item: items[previousIndex], index: previousIndex });
        // Add current card (will be entering)
        visibleItems.push({ item: items[currentIndex], index: currentIndex });
        return visibleItems;
      }
      // When not transitioning, show only current card
      return [{ item: items[currentIndex], index: currentIndex }];
    }
    
    // Multi-card view
    const visibleItems = [];
    for (let i = 0; i < cardsPerPage && i < items.length; i++) {
      const itemIndex = (currentIndex + i) % items.length;
      visibleItems.push({ item: items[itemIndex], index: itemIndex });
    }
    return visibleItems;
  };

  const visibleItems = getVisibleItems();

  // Safety check
  if (!items || items.length === 0) {
    return (
      <div className={`pokemon-carousel ${className} empty`} ref={containerRef}>
        <div className="cards-container">
          <div className="no-items">No items to display</div>
        </div>
      </div>
    );
  }

  // Ensure currentIndex is valid
  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, items.length - 1));

  return (
    <div className={`pokemon-carousel ${className}`} ref={containerRef}>
      {/* Navigation buttons - show if more than 1 item total */}
      {items.length > 1 && (
        <>
          <button 
            className="carousel-nav carousel-nav--prev"
            onClick={handlePrevious}
            disabled={isTransitioning}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <button 
            className="carousel-nav carousel-nav--next"
            onClick={handleNext}
            disabled={isTransitioning}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </>
      )}

      {/* Cards Container */}
      <div className="cards-container">
        {visibleItems.map(({ item, index }) => (
          <div
            key={`${index}-${isTransitioning ? transitionDirection : 'static'}`}
            className={getCardClasses(index)}
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
