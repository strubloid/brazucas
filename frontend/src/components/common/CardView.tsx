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
  className = ''
}) => {
  return (
    <div className={`pokemon-carousel ${className}`} ref={containerRef}>
      {/* Navigation buttons */}
      <button 
        className="carousel-nav carousel-nav--prev"
        onClick={onPrevious}
        disabled={items.length <= 1}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      
      <button 
        className="carousel-nav carousel-nav--next"
        onClick={onNext}
        disabled={items.length <= 1}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* Cards Container */}
      <div className="cards-container">
        {items.map((item, index) => (
          <div
            key={index}
            className={`card-wrapper ${index === currentIndex ? 'active' : ''}`}
          >
            {renderCard(item, index)}
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="carousel-dots">
        {items.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => onDotClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CardView;
