import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Advertisement } from '../../types/ads';
import './AnimatedNewsSlideshow.scss';

interface AnimatedAdsSlideshowProps {
  ads: Advertisement[];
  filterHeader?: React.ReactNode;
}

const AnimatedAdsSlideshow: React.FC<AnimatedAdsSlideshowProps> = ({ ads, filterHeader }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const shapePath = useRef<SVGPathElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('AnimatedAdsSlideshow - ads received:', { adsCount: ads.length, currentIndex, firstAd: ads[0]?.title });
  }, [ads, currentIndex]);

  // Calculate SVG paths for animation frames
  const calculatePaths = useCallback(() => {
    if (!containerRef.current) return { initial: '', final: '' };
    const rect = containerRef.current.getBoundingClientRect();
    const frameSize = rect.width / 12;
    const initial = `M 0,0 0,${rect.height} ${rect.width},${rect.height} ${rect.width},0 0,0 Z M 0,0 ${rect.width},0 ${rect.width},${rect.height} 0,${rect.height} Z`;
    const final = `M 0,0 0,${rect.height} ${rect.width},${rect.height} ${rect.width},0 0,0 Z M ${frameSize},${frameSize} ${rect.width-frameSize},${frameSize} ${rect.width-frameSize},${rect.height-frameSize} ${frameSize},${rect.height-frameSize} Z`;
    return { initial, final };
  }, []);

  // Animate using requestAnimationFrame for smooth transitions
  const animateSlides = useCallback((direction: 'next' | 'prev') => {
    if (isAnimating || ads.length <= 1) return;
    setIsAnimating(true);
    const paths = calculatePaths();
    if (shapePath.current && paths.final) {
      shapePath.current.style.transition = 'all 0.3s ease-out';
      shapePath.current.setAttribute('d', paths.final);
    }
    setTimeout(() => {
      setCurrentIndex(prev => {
        if (direction === 'next') {
          return prev >= ads.length - 1 ? 0 : prev + 1;
        } else {
          return prev <= 0 ? ads.length - 1 : prev - 1;
        }
      });
      setTimeout(() => {
        if (shapePath.current && paths.initial) {
          shapePath.current.setAttribute('d', paths.initial);
        }
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }, 200);
    }, 300);
  }, [isAnimating, ads.length, calculatePaths]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') animateSlides('prev');
      else if (e.key === 'ArrowRight') animateSlides('next');
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [animateSlides]);

  // Mouse wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 10) {
        if (e.deltaY > 0) animateSlides('next');
        else animateSlides('prev');
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [animateSlides]);

  // Reset currentIndex when ads array changes (due to filtering)
  useEffect(() => {
    if (ads.length > 0 && currentIndex >= ads.length) {
      setCurrentIndex(0);
    }
  }, [ads.length, currentIndex]);

  // Additional safety check - always reset to 0 when ads array changes completely  
  useEffect(() => {
    setCurrentIndex(0);
  }, [ads]);

  // Auto-resize SVG on window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && svgRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        svgRef.current.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
        if (shapePath.current && !isAnimating) {
          const paths = calculatePaths();
          shapePath.current.setAttribute('d', paths.initial);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [calculatePaths, isAnimating]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price.replace(/[^\d\s.,-]/g, '').replace(',', '.'));
    if (!isNaN(numPrice)) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'EUR'
      }).format(numPrice);
    }
    return price;
  };

  if (!ads || ads.length === 0) {
    return (
      <div className="animated-slideshow">
        <div className="no-news">
          <h3>Nenhum anúncio disponível</h3>
          <p>Não há anúncios para exibir no momento.</p>
        </div>
      </div>
    );
  }

  const currentAd = ads[currentIndex];

  // Safety check - if currentAd is undefined, don't render
  if (!currentAd) {
    return (
      <div className="animated-slideshow">
        <div className="no-ads">
          <h3>Nenhum anúncio encontrado</h3>
          <p>Não há anúncios para exibir com os filtros selecionados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animated-slideshow" ref={containerRef}>
      {/* SVG Shape Overlay */}
      <svg 
        ref={svgRef}
        className="shape-overlay" 
        width="100%" 
        height="100%"
      >
        <defs>
          <linearGradient id="slideshow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(79, 70, 229, 0.8)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.8)" />
          </linearGradient>
        </defs>
        <path 
          ref={shapePath}
          fill="url(#slideshow-gradient)" 
          d=""
        />
      </svg>

      {/* Optional filter header overlay */}
      {filterHeader && (
        <div className="slideshow-filter-overlay">
          {filterHeader}
        </div>
      )}

      {/* Slides Container */}
      <div className="slides-container">
        <div 
          className="slide slide--current"
          key={currentIndex}
        >
          <div className="slide__content">
            <div className="slide__text">
              <h2 className="slide__title">{currentAd.title}</h2>
              <p className="slide__description">{currentAd.description}</p>
              <div className="slide__meta">
                <span className="slide__date">
                  Publicado em {formatDate(currentAd.createdAt)}
                </span>
                <span className={`slide__status slide__status--${currentAd.published ? (currentAd.approved === null ? 'pending' : (currentAd.approved ? 'published' : 'rejected')) : 'draft'}`}>
                  {currentAd.published ? (currentAd.approved === null ? 'Pendente' : (currentAd.approved ? 'Publicado' : 'Rejeitado')) : 'Rascunho'}
                </span>
              </div>
              <div className="slide__ad-extra">
                <span className="slide__ad-category">{currentAd.category}</span>
                <span className="slide__ad-price">{formatPrice(currentAd.price)}</span>
              </div>
              <div className="slide__ad-contact">
                <span>Contato: </span>
                <a href={`mailto:${currentAd.contactEmail}`}>{currentAd.contactEmail}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="slideshow-nav">
        <button 
          className="nav-btn nav-btn--prev"
          onClick={() => animateSlides('prev')}
          disabled={isAnimating}
          aria-label="Anúncio anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Anterior</span>
        </button>
        
        <div className="slide-counter">
          <span className="current-slide">{currentIndex + 1}</span>
          <span className="separator">/</span>
          <span className="total-slides">{ads.length}</span>
        </div>
        
        <button 
          className="nav-btn nav-btn--next"
          onClick={() => animateSlides('next')}
          disabled={isAnimating}
          aria-label="Próximo anúncio"
        >
          <span>Próxima</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </nav>

      {/* Instructions */}
      <div className="slideshow-instructions">
        <p>Use as setas ← → ou role o mouse para navegar</p>
      </div>
    </div>
  );
};

export default AnimatedAdsSlideshow;
