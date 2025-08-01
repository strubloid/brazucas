import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { NewsService } from '../services/newsService';
import { AdService } from '../services/adService';
import { NewsPost } from '../types/news';
import { Advertisement } from '../types/ads';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Home.scss';

const Home: React.FC = () => {
  const heroRef = useAnimateOnMount('fadeIn');
  const newsRef = useAnimateOnMount('slideIn', 200);
  const adsRef = useAnimateOnMount('slideIn', 400);

  const { data: latestNews, loading: newsLoading } = useAsync<NewsPost[]>(
    () => NewsService.getAllNews(),
    []
  );

  const { data: ads, loading: adsLoading } = useAsync<Advertisement[]>(
    () => AdService.getAllAds(),
    []
  );

  const featuredNews = latestNews?.slice(0, 3) || [];
  const featuredAds = ads?.slice(0, 2) || [];

  return (
    <div className="home">
      {/* Hero Section */}
      <section ref={heroRef} className="home__hero">
        <div className="home__hero-background">
          <div className="home__hero-overlay"></div>
        </div>
        <div className="home__hero-content">
          <h1 className="home__hero-title">
            Bem-vindos ao <span className="home__hero-highlight">Brazucas em Cork</span>
          </h1>
          <p className="home__hero-subtitle">
            Sua comunidade brasileira no coração da Irlanda
          </p>
          <div className="home__hero-actions">
            <Link to="/news" className="home__hero-button home__hero-button--primary">
              Ver Notícias
            </Link>
            <Link to="/register" className="home__hero-button home__hero-button--secondary">
              Junte-se a Nós
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section ref={newsRef} className="home__section">
        <div className="home__container">
          <h2 className="home__section-title">Últimas Notícias</h2>
          
          {newsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="home__news-grid">
              {featuredNews.map((news) => (
                <article key={news.id} className="home__news-card">
                  {news.imageUrl && (
                    <div className="home__news-image">
                      <img src={news.imageUrl} alt={news.title} />
                    </div>
                  )}
                  <div className="home__news-content">
                    <h3 className="home__news-title">{news.title}</h3>
                    <p className="home__news-excerpt">{news.excerpt}</p>
                    <div className="home__news-meta">
                      <span className="home__news-date">
                        {new Date(news.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <Link to={`/news/${news.id}`} className="home__news-link">
                      Ler mais
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          {featuredNews.length > 0 && (
            <div className="home__section-footer">
              <Link to="/news" className="home__view-all">
                Ver todas as notícias →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Community Features Section */}
      <section className="home__section home__section--alt">
        <div className="home__container">
          <h2 className="home__section-title">Nossa Comunidade</h2>
          <div className="home__features">
            <div className="home__feature">
              <div className="home__feature-icon">📰</div>
              <h3 className="home__feature-title">Notícias</h3>
              <p className="home__feature-description">
                Fique por dentro de tudo que acontece na comunidade brasileira em Cork
              </p>
            </div>
            <div className="home__feature">
              <div className="home__feature-icon">🤝</div>
              <h3 className="home__feature-title">Conexões</h3>
              <p className="home__feature-description">
                Conecte-se com outros brasileiros e faça novos amigos
              </p>
            </div>
            <div className="home__feature">
              <div className="home__feature-icon">📢</div>
              <h3 className="home__feature-title">Anúncios</h3>
              <p className="home__feature-description">
                Promova seus serviços e encontre o que precisa na comunidade
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advertisements Section */}
      {featuredAds.length > 0 && (
        <section ref={adsRef} className="home__section">
          <div className="home__container">
            <h2 className="home__section-title">Anúncios da Comunidade</h2>
            
            {adsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="home__ads-grid">
                {featuredAds.map((ad) => (
                  <div key={ad.id} className="home__ad-card">
                    {ad.imageUrl && (
                      <div className="home__ad-image">
                        <img src={ad.imageUrl} alt={ad.title} />
                      </div>
                    )}
                    {ad.youtubeUrl && (
                      <div className="home__ad-video">
                        <iframe
                          src={ad.youtubeUrl.replace('watch?v=', 'embed/')}
                          title={ad.title}
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                    <div className="home__ad-content">
                      <h3 className="home__ad-title">{ad.title}</h3>
                      <p className="home__ad-description">{ad.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
