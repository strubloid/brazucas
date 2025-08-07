import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import anime from 'animejs';
import './ThreeXView.scss';

interface ThreeXViewProps {
  items: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
  className?: string;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const ThreeXView: React.FC<ThreeXViewProps> = ({
  items,
  renderCard,
  className = '',
  itemsPerPage = 3,  // Changed from 9 to 3 for 3x1 layout (3 cards per row)
  currentPage: propCurrentPage,
  onPageChange
}) => {
  const [internalCurrentPage, setInternalCurrentPage] = useState(propCurrentPage || 0);
  
  // Use either controlled or uncontrolled current page
  const currentPage = propCurrentPage !== undefined ? propCurrentPage : internalCurrentPage;
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // Get items for current page
  const getCurrentPageItems = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  // Animate page transition
  const animatePageTransition = (direction: 'next' | 'prev') => {
    const currentCards = cardRefs.current.filter(ref => ref !== null);
    
    if (currentCards.length === 0) return;

    // Animate current cards out
    anime({
      targets: currentCards,
      opacity: [1, 0],
      scale: [1, 0.8],
      rotateY: direction === 'next' ? [0, 90] : [0, -90],
      translateX: direction === 'next' ? [0, 100] : [0, -100],
      duration: 400,
      delay: anime.stagger(50),
      easing: 'easeInBack',
      complete: () => {
        // Update page after animation, but only for uncontrolled mode
        if (propCurrentPage === undefined) {
          const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
          setInternalCurrentPage(newPage);
          if (onPageChange) {
            onPageChange(newPage);
          }
        }
        // For controlled mode, parent will update the prop
      }
    });
  };

  // Animate new cards in
  useEffect(() => {
    const currentCards = cardRefs.current.filter(ref => ref !== null);
    
    if (currentCards.length === 0) return;

    // Reset and animate new cards in
    anime.set(currentCards, {
      opacity: 0,
      scale: 0.8,
      rotateY: 0,
      translateX: 0
    });

    anime({
      targets: currentCards,
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 500,
      delay: anime.stagger(80, {start: 200}),
      easing: 'easeOutExpo'
    });
  }, [currentPage]);

  const updatePage = (newPage: number) => {
    setInternalCurrentPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      animatePageTransition('next');
      // If using controlled mode, also notify parent
      if (propCurrentPage !== undefined && onPageChange) {
        onPageChange(currentPage + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      animatePageTransition('prev');
      // If using controlled mode, also notify parent
      if (propCurrentPage !== undefined && onPageChange) {
        onPageChange(currentPage - 1);
      }
    }
  };

  const handlePageDot = (pageIndex: number) => {
    if (pageIndex !== currentPage) {
      const direction = pageIndex > currentPage ? 'next' : 'prev';
      animatePageTransition(direction);
      
      if (propCurrentPage !== undefined && onPageChange) {
        // Notify parent immediately
        onPageChange(pageIndex);
      } else {
        // For uncontrolled component, we update our internal state
        setInternalCurrentPage(pageIndex);
      }
    }
  };

  return (
    <div className={`cards-3x-container ${className}`}>
      {/* Navigation arrows - always visible for consistency with card view */}
      <button
        className="three-x-nav three-x-nav--prev"
        onClick={handlePrev}
        disabled={currentPage === 0}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button
        className="three-x-nav three-x-nav--next"
        onClick={handleNext}
        disabled={currentPage === totalPages - 1}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* Cards Grid */}
      <div className={`cards-3x-grid ${getCurrentPageItems().length === 1 ? 'cards-1' : getCurrentPageItems().length === 2 ? 'cards-2' : ''}`}>
        {getCurrentPageItems().map((item, index) => (
          <div
            key={item.id || `${currentPage}-${index}`}
            ref={el => cardRefs.current[index] = el}
            className="card-3x-wrapper"
          >
            {renderCard(item, currentPage * itemsPerPage + index)}
          </div>
        ))}
      </div>

      {/* Page dots */}
      {totalPages > 1 && (
        <div className="three-x-dots">
          {Array.from({ length: totalPages }, (_, pageIndex) => (
            <button
              key={pageIndex}
              className={`three-x-dot ${pageIndex === currentPage ? 'active' : ''}`}
              onClick={() => handlePageDot(pageIndex)}
            />
          ))}
        </div>
      )}

      {/* Page info */}
      {totalPages > 1 && (
        <div className="three-x-page-info">
          Página {currentPage + 1} de {totalPages}
        </div>
      )}
    </div>
  );
};

export default ThreeXView;
