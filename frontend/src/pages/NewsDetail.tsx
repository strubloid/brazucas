import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { NewsService } from '../services/newsService';
import { NewsPost } from '../types/news';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './NewsDetail.scss';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contentRef = useAnimateOnMount('fadeIn');

  const { data: news, loading, error } = useAsync<NewsPost>(
    () => {
      if (!id) throw new Error('ID da notícia não encontrado');
      return NewsService.getNewsById(id);
    },
    [id]
  );

  if (loading) {
    return (
      <div className="news-detail">
        <div className="news-detail__container">
          <LoadingSpinner text="Carregando notícia..." />
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="news-detail">
        <div className="news-detail__container">
          <div className="news-detail__error">
            <h1>Notícia não encontrada</h1>
            <p>{error || 'A notícia que você está procurando não existe ou foi removida.'}</p>
            <div className="news-detail__error-actions">
              <button onClick={() => navigate(-1)} className="news-detail__back-button">
                Voltar
              </button>
              <Link to="/news" className="news-detail__news-button">
                Ver todas as notícias
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail">
      <div className="news-detail__container">
        <nav className="news-detail__breadcrumb">
          <Link to="/">Home</Link>
          <span> › </span>
          <Link to="/news">Notícias</Link>
          <span> › </span>
          <span>{news.title}</span>
        </nav>

        <article ref={contentRef} className="news-detail__article">
          <header className="news-detail__header">
            <h1 className="news-detail__title">{news.title}</h1>
            <div className="news-detail__meta">
              <time className="news-detail__date">
                Publicado em {new Date(news.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {news.updatedAt !== news.createdAt && (
                <time className="news-detail__updated">
                  Atualizado em {new Date(news.updatedAt).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
            </div>
          </header>

          {news.imageUrl && (
            <div className="news-detail__image">
              <img src={news.imageUrl} alt={news.title} />
            </div>
          )}

          <div className="news-detail__content">
            <div className="news-detail__excerpt">
              <p>{news.excerpt}</p>
            </div>
            
            <div 
              className="news-detail__body"
              dangerouslySetInnerHTML={{ __html: news.content.replace(/\n/g, '<br>') }}
            />
          </div>

          <footer className="news-detail__footer">
            <div className="news-detail__actions">
              <button onClick={() => navigate(-1)} className="news-detail__back-button">
                ← Voltar
              </button>
              <Link to="/news" className="news-detail__all-news-button">
                Ver todas as notícias
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;
