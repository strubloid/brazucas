import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { AdService } from '../services/adService';
import { Advertisement } from '../types/ads';
import { ServiceCategory } from '../types/serviceCategory';
import { ServiceCategoryService } from '../services/serviceCategoryService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AnimatedAdsSlideshow from '../components/common/AnimatedAdsSlideshow';
import CategoryFilter from '../components/common/CategoryFilter';
import './Ads.scss';

const Ads: React.FC = () => {
  const adsRef = useAnimateOnMount('fadeIn');
  
  // Separate filter states for each view mode
  const [selectedCategorySlideshow, setSelectedCategorySlideshow] = useState<string>('all');
  const [selectedCategoryGrid, setSelectedCategoryGrid] = useState<string>('all');
  
  const [viewMode, setViewMode] = useState<'slideshow' | 'grid'>('slideshow');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const { data: ads, loading, error } = useAsync<Advertisement[]>(
    () => AdService.getPublishedAds(),
    []
  );


  // Fetch categories from backend
  useEffect(() => {
    setCategoriesLoading(true);
    ServiceCategoryService.getActiveCategories()
      .then(data => {
        setCategories(data);
        setCategoriesLoading(false);
      })
      .catch(err => {
        setCategoriesError('Erro ao carregar categorias');
        setCategoriesLoading(false);
      });
  }, []);


  // Create separate filtered arrays for each view mode with robust filtering
  const filteredAdsSlideshow = React.useMemo(() => {
    if (!ads) return [];
    if (selectedCategorySlideshow === 'all') return ads;
    
    return ads.filter(ad => {
      const adCategory = ad.category;
      const selectedCategory = selectedCategorySlideshow;
      
      // Direct match
      if (adCategory === selectedCategory) return true;
      
      // Case-insensitive match
      if (adCategory?.toLowerCase() === selectedCategory?.toLowerCase()) return true;
      
      // Trimmed match
      if (adCategory?.trim() === selectedCategory?.trim()) return true;
      
      return false;
    });
  }, [ads, selectedCategorySlideshow]);

  const filteredAdsGrid = React.useMemo(() => {
    if (!ads) return [];
    if (selectedCategoryGrid === 'all') return ads;
    
    return ads.filter(ad => {
      const adCategory = ad.category;
      const selectedCategory = selectedCategoryGrid;
      
      // Direct match
      if (adCategory === selectedCategory) return true;
      
      // Case-insensitive match
      if (adCategory?.toLowerCase() === selectedCategory?.toLowerCase()) return true;
      
      // Trimmed match
      if (adCategory?.trim() === selectedCategory?.trim()) return true;
      
      return false;
    });
  }, [ads, selectedCategoryGrid]);

  // Temporary debug logging to see what's happening
  React.useEffect(() => {
    console.log('🐛 DEBUG INFO:');
    console.log('- ads loaded:', ads?.length || 0);
    console.log('- categories loaded:', categories?.length || 0);
    console.log('- selectedCategorySlideshow:', selectedCategorySlideshow);
    console.log('- selectedCategoryGrid:', selectedCategoryGrid);
    console.log('- filteredAdsSlideshow count:', filteredAdsSlideshow?.length || 0);
    console.log('- filteredAdsGrid count:', filteredAdsGrid?.length || 0);
    if (ads && ads.length > 0) {
      console.log('- First ad category:', ads[0]?.category);
      console.log('- All ad categories:', Array.from(new Set(ads.map(ad => ad.category))));
    }
    if (categories && categories.length > 0) {
      console.log('- All filter categories:', categories.map(c => c.name));
    }
  }, [ads, categories, selectedCategorySlideshow, selectedCategoryGrid, filteredAdsSlideshow, filteredAdsGrid]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: string) => {
    // If price looks like a number, format as currency
    const numPrice = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(numPrice)) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'EUR'
      }).format(numPrice);
    }
    return price;
  };

  if (loading || categoriesLoading) {
    return (
      <div className="ads-page">
        <LoadingSpinner text={loading ? "Carregando anúncios..." : "Carregando categorias..."} />
      </div>
    );
  }

  if (error || categoriesError) {
    return (
      <div className="ads-page">
        <div className="error-message">
          <h2>Erro ao carregar {error ? 'anúncios' : 'categorias'}</h2>
          <p>Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={adsRef} className={`ads-page ${viewMode === 'slideshow' ? 'slideshow' : ''}`}>
      <div className="ads-container">
        <div className="ads-header">
          <h1 className="ads-title">Anúncios</h1>
          
          {/* View Mode Toggle */}
          <div className="news__view-toggle">
            <button 
              className={`view-toggle__btn ${viewMode === 'slideshow' ? 'active' : ''}`}
              onClick={() => setViewMode('slideshow')}
            >
              📽️ Apresentação
            </button>
            <button 
              className={`view-toggle__btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              📋 Lista
            </button>
          </div>
        </div>

        {/* Category Filter for Lista mode (visible above grid) */}
        {viewMode === 'grid' && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategoryGrid}
            onCategoryChange={setSelectedCategoryGrid}
          />
        )}

        {/* Ads Display */}
        <div className={`ads-display ${viewMode}`}>
          {viewMode === 'slideshow' ? (
            filteredAdsSlideshow.length > 0 ? (
              <AnimatedAdsSlideshow 
                ads={filteredAdsSlideshow}
                filterHeader={
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategorySlideshow}
                    onCategoryChange={setSelectedCategorySlideshow}
                    className="slideshow-filter"
                  />
                }
              />
            ) : (
              <div className="no-ads">
                <h3>Nenhum anúncio encontrado</h3>
                <p>
                  {selectedCategorySlideshow === 'all' 
                    ? 'Ainda não há anúncios publicados.' 
                    : `Não há anúncios na categoria "${selectedCategorySlideshow}".`
                  }
                </p>
              </div>
            )
          ) : (
            filteredAdsGrid.length > 0 ? (
              <div className="ads-grid">
                {filteredAdsGrid.map((ad: Advertisement) => (
                  <div key={ad.id} className="ad-card">
                    <div className="ad-header">
                      <h3 className="ad-title">{ad.title}</h3>
                      <span className="ad-category">{ad.category}</span>
                    </div>
                    <div className="ad-content">
                      <p className="ad-description">{ad.description}</p>
                      <div className="ad-price">
                        <strong>{formatPrice(ad.price)}</strong>
                      </div>
                    </div>
                    <div className="ad-footer">
                      <div className="ad-meta">
                        <span className="ad-author">Por: {ad.authorNickname || 'Anônimo'}</span>
                        <span className="ad-date">{formatDate(ad.createdAt)}</span>
                      </div>
                      <div className="ad-contact">
                        <a 
                          href={`mailto:${ad.contactEmail}`}
                          className="contact-btn"
                          title="Entrar em contato"
                        >
                          Contatar
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-ads">
                <h3>Nenhum anúncio encontrado</h3>
                <p>
                  {selectedCategoryGrid === 'all' 
                    ? 'Ainda não há anúncios publicados.' 
                    : `Não há anúncios na categoria "${selectedCategoryGrid}".`
                  }
                </p>
              </div>
            )
          )}
        </div>

        {/* Call to Action */}
        <div className="ads-cta">
          <h3>Quer anunciar também?</h3>
          <p>Divulgue seus produtos e serviços para a comunidade brasileira em Cork.</p>
          <Link to="/submit-ad" className="cta-btn">
            Criar Anúncio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Ads;
