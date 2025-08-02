import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { AdService } from '../services/adService';
import { Advertisement } from '../types/ads';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Ads.scss';

const Ads: React.FC = () => {
  const adsRef = useAnimateOnMount('fadeIn');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: ads, loading, error } = useAsync<Advertisement[]>(
    () => AdService.getPublishedAds(),
    []
  );

  const categories = [
    'all',
    'Limpeza',
    'Serviços',
    'Produtos',
    'Educação',
    'Saúde',
    'Tecnologia',
    'Outros'
  ];

  const filteredAds = ads?.filter(ad => 
    selectedCategory === 'all' || ad.category === selectedCategory
  ) || [];

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

  if (loading) {
    return (
      <div className="ads-page">
        <LoadingSpinner text="Carregando anúncios..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ads-page">
        <div className="error-message">
          <h2>Erro ao carregar anúncios</h2>
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
          <p className="ads-subtitle">
            Encontre produtos e serviços da comunidade brasileira em Cork
          </p>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <h3>Filtrar por categoria:</h3>
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'Todas' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Ads Grid */}
        <div className="ads-grid">
          {filteredAds.length > 0 ? (
            filteredAds.map((ad) => (
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
            ))
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
