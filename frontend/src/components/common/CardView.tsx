import React from 'react';
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
  const getVisibleItems = () => {
    if (cardsPerPage === 1) {
      return [{ item: items[currentIndex], index: currentIndex }];
    }
    
    const visibleItems = [];
    for (let i = 0; i < cardsPerPage && i < items.length; i++) {
      const itemIndex = (currentIndex + i) % items.length;
      visibleItems.push({ item: items[itemIndex], index: itemIndex });
    }
    return visibleItems;
  };

  const visibleItems = getVisibleItems();

  return (
    <div className={`pokemon-carousel ${className}`} ref={containerRef}>
      {/* Navigation buttons - only show if more items than cards per page */}
      {items.length > cardsPerPage && (
        <>
          <button 
            className="carousel-nav carousel-nav--prev"
            onClick={onPrevious}
            disabled={items.length <= cardsPerPage}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <button 
            className="carousel-nav carousel-nav--next"
            onClick={onNext}
            disabled={items.length <= cardsPerPage}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </>
      )}

      {/* Cards Container */}
      <div className="cards-container">
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            className={`card-wrapper ${index === currentIndex ? 'active' : 'visible'}`}
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

      {/* Dots indicator - only show if more items than cards per page */}
      {items.length > cardsPerPage && (
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
