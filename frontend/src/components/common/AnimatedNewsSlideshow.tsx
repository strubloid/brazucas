import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NewsPost } from '../../types/news';
import './AnimatedNewsSlideshow.scss';

interface AnimatedNewsSlideshowProps {
  newsItems: NewsPost[];
}

export const AnimatedNewsSlideshow: React.FC<AnimatedNewsSlideshowProps> = ({ newsItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const shapePath = useRef<SVGPathElement>(null);

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
    if (isAnimating || newsItems.length <= 1) return;
    
    setIsAnimating(true);
    const paths = calculatePaths();
    
    // Phase 1: Animate shape in
    if (shapePath.current && paths.final) {
      shapePath.current.style.transition = 'all 0.3s ease-out';
      shapePath.current.setAttribute('d', paths.final);
    }
    
    setTimeout(() => {
      // Phase 2: Change slide
      setCurrentIndex(prev => {
        if (direction === 'next') {
          return prev >= newsItems.length - 1 ? 0 : prev + 1;
        } else {
          return prev <= 0 ? newsItems.length - 1 : prev - 1;
        }
      });
      
      setTimeout(() => {
        // Phase 3: Animate shape out
        if (shapePath.current && paths.initial) {
          shapePath.current.setAttribute('d', paths.initial);
        }
        
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }, 200);
    }, 300);
  }, [isAnimating, newsItems.length, calculatePaths]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        animateSlides('prev');
      } else if (e.key === 'ArrowRight') {
        animateSlides('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [animateSlides]);

  // Handle mouse wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 10) {
        if (e.deltaY > 0) {
          animateSlides('next');
        } else {
          animateSlides('prev');
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [animateSlides]);

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
    handleResize(); // Initial setup
    
    return () => window.removeEventListener('resize', handleResize);
  }, [calculatePaths, isAnimating]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getNewsStatus = (news: NewsPost) => {
    if (!news.published) return 'draft';
    if (news.approved === null) return 'pending';
    if (news.approved === true) return 'published';
    return 'rejected';
  };

  const getStatusLabel = (news: NewsPost) => {
    const status = getNewsStatus(news);
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  if (!newsItems || newsItems.length === 0) {
    return (
      <div className="animated-slideshow">
        <div className="no-news">
          <h3>Nenhuma notícia disponível</h3>
          <p>Não há notícias para exibir no momento.</p>
        </div>
      </div>
    );
  }

  const currentNews = newsItems[currentIndex];

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

      {/* Slides Container */}
      <div className="slides-container">
        <div 
          className="slide slide--current"
          key={currentIndex}
        >
          <div className="slide__content">
            <div className="slide__text">
              <h2 className="slide__title">{currentNews.title}</h2>
              <p className="slide__description">{currentNews.excerpt}</p>
              <div className="slide__meta">
                <span className="slide__date">
                  Publicado em {formatDate(currentNews.createdAt)}
                </span>
                <span className={`slide__status slide__status--${getNewsStatus(currentNews)}`}>
                  {getStatusLabel(currentNews)}
                </span>
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
          aria-label="Notícia anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Anterior</span>
        </button>
        
        <div className="slide-counter">
          <span className="current-slide">{currentIndex + 1}</span>
          <span className="separator">/</span>
          <span className="total-slides">{newsItems.length}</span>
        </div>
        
        <button 
          className="nav-btn nav-btn--next"
          onClick={() => animateSlides('next')}
          disabled={isAnimating}
          aria-label="Próxima notícia"
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

export default AnimatedNewsSlideshow;
