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
import './Ads.scss';

const Ads: React.FC = () => {
  const adsRef = useAnimateOnMount('fadeIn');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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


  const filteredAds = ads?.filter(ad => 
    selectedCategory === 'all' || ad.category === selectedCategory
  ) || [];

  // Auto-switch to grid mode if no ads in selected category and in slideshow mode
  React.useEffect(() => {
    if (viewMode === 'slideshow' && filteredAds.length === 0) {
      setViewMode('grid');
    }
  }, [viewMode, filteredAds.length]);

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
    <div ref={adsRef} className="ads-page">
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



        {/* Category Filter (always visible above grid, overlay in slideshow) */}
        {viewMode === 'grid' && (
          categories.length > 0 ? (
            <div className="category-filter">
              <h3>Filtrar por categoria:</h3>
              <div className="category-buttons">
                <button
                  key="all"
                  className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Todas
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="category-filter">
              <h3>Filtrar por categoria:</h3>
              <div className="category-buttons">
                <span style={{ color: '#6b7280', fontSize: '1rem' }}>Nenhuma categoria disponível</span>
              </div>
            </div>
          )
        )}

        {/* Ads Display */}
        <div className={`ads-display ${viewMode}`}>
          {filteredAds.length > 0 ? (
            viewMode === 'slideshow' ? (
              <AnimatedAdsSlideshow 
                ads={filteredAds}
                filterHeader={
                  categories.length > 0 ? (
                    <div className="category-filter slideshow-filter">
                      <h3>Filtrar por categoria:</h3>
                      <div className="category-buttons">
                        <button
                          key="all"
                          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                          onClick={() => setSelectedCategory('all')}
                        >
                          Todas
                        </button>
                        {categories.map(category => (
                          <button
                            key={category.id}
                            className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.name)}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="category-filter slideshow-filter">
                      <h3>Filtrar por categoria:</h3>
                      <div className="category-buttons">
                        <span style={{ color: '#6b7280', fontSize: '1rem' }}>Nenhuma categoria disponível</span>
                      </div>
                    </div>
                  )
                }
              />
            ) : (
              <div className="ads-grid">
                {filteredAds.map((ad) => (
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
            )
          ) : (
            <div className="no-ads">
              <h3>Nenhum anúncio encontrado</h3>
              <p>
                {selectedCategory === 'all' 
                  ? 'Ainda não há anúncios publicados.' 
                  : `Não há anúncios na categoria "${selectedCategory}".`
                }
              </p>
            </div>
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
