import React from 'react';
import { Link } from 'react-router-dom';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { NewsService } from '../services/newsService';
import { NewsPost } from '../types/news';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './News.scss';

const News: React.FC = () => {
  const headerRef = useAnimateOnMount('fadeIn');
  const gridRef = useAnimateOnMount('slideIn', 200);

  const { data: news, loading, error, refetch } = useAsync<NewsPost[]>(
    () => NewsService.getAllNews(),
    []
  );

  if (loading) {
    return (
      <div className="news">
        <div className="news__container">
          <LoadingSpinner text="Carregando notícias..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news">
        <div className="news__container">
          <div className="news__error">
            <h2>Erro ao carregar notícias</h2>
            <p>{error}</p>
            <button onClick={refetch} className="news__retry-button">
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="news">
      <div className="news__container">
        <header ref={headerRef} className="news__header">
          <h1 className="news__title">Notícias</h1>
          <p className="news__subtitle">
            Fique por dentro de tudo que acontece na comunidade brasileira em Cork
          </p>
        </header>

        {news && news.length > 0 ? (
          <div ref={gridRef} className="news__grid">
            {news.map((post) => (
              <article key={post.id} className="news__card">
                {post.imageUrl && (
                  <div className="news__card-image">
                    <img src={post.imageUrl} alt={post.title} />
                  </div>
                )}
                <div className="news__card-content">
                  <h2 className="news__card-title">{post.title}</h2>
                  <p className="news__card-excerpt">{post.excerpt}</p>
                  <div className="news__card-meta">
                    <time className="news__card-date">
                      {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <Link to={`/news/${post.id}`} className="news__card-link">
                    Ler notícia completa →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="news__empty">
            <div className="news__empty-icon">📰</div>
            <h2 className="news__empty-title">Nenhuma notícia encontrada</h2>
            <p className="news__empty-text">
              Ainda não há notícias publicadas. Volte em breve para conferir as novidades!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
