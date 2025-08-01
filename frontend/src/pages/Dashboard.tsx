import React, { useState } from 'react';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { NewsService } from '../services/newsService';
import { NewsPost, CreateNewsRequest, UpdateNewsRequest } from '../types/news';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const dashboardRef = useAnimateOnMount('fadeIn');
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'create'>('overview');
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');

  const { data: news, loading, refetch } = useAsync<NewsPost[]>(
    () => NewsService.getAllNews(),
    []
  );

  const [formData, setFormData] = useState<CreateNewsRequest>({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    published: false,
  });

  const resetForm = (): void => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      published: false,
    });
    setEditingNews(null);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleEditNews = (newsPost: NewsPost): void => {
    setFormData({
      title: newsPost.title,
      content: newsPost.content,
      excerpt: newsPost.excerpt,
      imageUrl: newsPost.imageUrl || '',
      published: newsPost.published,
    });
    setEditingNews(newsPost);
    setActiveTab('create');
  };

  const handleDeleteNews = async (id: string): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja excluir esta notícia?')) return;

    try {
      await NewsService.deleteNews(id);
      setSubmitSuccess('Notícia excluída com sucesso!');
      refetch();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao excluir notícia');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      if (editingNews) {
        // Update existing news
        const updateData: UpdateNewsRequest = {
          id: editingNews.id,
          ...formData,
        };
        await NewsService.updateNews(updateData);
        setSubmitSuccess('Notícia atualizada com sucesso!');
      } else {
        // Create new news
        await NewsService.createNews(formData);
        setSubmitSuccess('Notícia criada com sucesso!');
      }
      
      resetForm();
      refetch();
      setActiveTab('news');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao salvar notícia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={dashboardRef} className="dashboard">
      <div className="dashboard__container">
        <header className="dashboard__header">
          <h1 className="dashboard__title">Dashboard Administrativo</h1>
          <p className="dashboard__subtitle">Gerencie notícias e conteúdo do site</p>
        </header>

        <nav className="dashboard__tabs">
          <button
            className={`dashboard__tab ${activeTab === 'overview' ? 'dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Visão Geral
          </button>
          <button
            className={`dashboard__tab ${activeTab === 'news' ? 'dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            Notícias
          </button>
          <button
            className={`dashboard__tab ${activeTab === 'create' ? 'dashboard__tab--active' : ''}`}
            onClick={() => {
              setActiveTab('create');
              resetForm();
            }}
          >
            {editingNews ? 'Editar Notícia' : 'Nova Notícia'}
          </button>
        </nav>

        <div className="dashboard__content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="dashboard__overview">
              <div className="dashboard__stats">
                <div className="dashboard__stat">
                  <div className="dashboard__stat-value">{news?.length || 0}</div>
                  <div className="dashboard__stat-label">Total de Notícias</div>
                </div>
                <div className="dashboard__stat">
                  <div className="dashboard__stat-value">
                    {news?.filter(n => n.published).length || 0}
                  </div>
                  <div className="dashboard__stat-label">Notícias Publicadas</div>
                </div>
                <div className="dashboard__stat">
                  <div className="dashboard__stat-value">
                    {news?.filter(n => !n.published).length || 0}
                  </div>
                  <div className="dashboard__stat-label">Rascunhos</div>
                </div>
              </div>
            </div>
          )}

          {/* News Management Tab */}
          {activeTab === 'news' && (
            <div className="dashboard__news">
              {loading ? (
                <LoadingSpinner text="Carregando notícias..." />
              ) : (
                <div className="dashboard__news-list">
                  {news?.map((newsPost) => (
                    <div key={newsPost.id} className="dashboard__news-item">
                      <div className="dashboard__news-content">
                        <h3 className="dashboard__news-title">{newsPost.title}</h3>
                        <p className="dashboard__news-excerpt">{newsPost.excerpt}</p>
                        <div className="dashboard__news-meta">
                          <span className={`dashboard__news-status dashboard__news-status--${newsPost.published ? 'published' : 'draft'}`}>
                            {newsPost.published ? 'Publicada' : 'Rascunho'}
                          </span>
                          <span className="dashboard__news-date">
                            {new Date(newsPost.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="dashboard__news-actions">
                        <button
                          onClick={() => handleEditNews(newsPost)}
                          className="dashboard__news-button dashboard__news-button--edit"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteNews(newsPost.id)}
                          className="dashboard__news-button dashboard__news-button--delete"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {news?.length === 0 && (
                    <div className="dashboard__empty">
                      <p>Nenhuma notícia encontrada.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Create/Edit News Tab */}
          {activeTab === 'create' && (
            <div className="dashboard__create">
              <form onSubmit={handleSubmit} className="dashboard__form">
                {submitError && (
                  <div className="dashboard__message dashboard__message--error">
                    {submitError}
                  </div>
                )}
                
                {submitSuccess && (
                  <div className="dashboard__message dashboard__message--success">
                    {submitSuccess}
                  </div>
                )}

                <div className="dashboard__field">
                  <label htmlFor="title" className="dashboard__label">Título</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="dashboard__input"
                    required
                    maxLength={200}
                  />
                </div>

                <div className="dashboard__field">
                  <label htmlFor="excerpt" className="dashboard__label">Resumo</label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className="dashboard__textarea"
                    rows={3}
                    required
                    maxLength={300}
                  />
                </div>

                <div className="dashboard__field">
                  <label htmlFor="content" className="dashboard__label">Conteúdo</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="dashboard__textarea dashboard__textarea--large"
                    rows={10}
                    required
                    maxLength={10000}
                  />
                </div>

                <div className="dashboard__field">
                  <label htmlFor="imageUrl" className="dashboard__label">URL da Imagem (opcional)</label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="dashboard__input"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="dashboard__field dashboard__field--checkbox">
                  <label htmlFor="published" className="dashboard__checkbox-label">
                    <input
                      type="checkbox"
                      id="published"
                      name="published"
                      checked={formData.published}
                      onChange={handleInputChange}
                      className="dashboard__checkbox"
                    />
                    Publicar notícia
                  </label>
                </div>

                <div className="dashboard__form-actions">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="dashboard__button dashboard__button--secondary"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="dashboard__button dashboard__button--primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="small" text="" />
                    ) : (
                      editingNews ? 'Atualizar Notícia' : 'Criar Notícia'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
