import React, { useState } from 'react';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { NewsService } from '../services/newsService';
import { NewsPost, CreateNewsRequest, UpdateNewsRequest } from '../types/news';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faNewspaper, 
  faPlus, 
  faCheckCircle, 
  faAd,
  faUsers,
  faChartBar,
  faPen,
  faTrash,
  faClock,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const dashboardRef = useAnimateOnMount('fadeIn');
  const { user } = useAuth();
  
  // Debug: log user object to see what's available
  console.log('Dashboard user object:', user);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'create' | 'approve-posts' | 'approve-ads'>('overview');
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

  // Check if user is authenticated AFTER all hooks are called
  if (!user) {
    return (
      <div className="modern-dashboard">
        <div className="access-denied-container">
          <h2>Acesso Negado</h2>
          <p>Você precisa fazer login para acessar o dashboard.</p>
          <button 
            className="login-button"
            onClick={() => window.location.href = '/login'}
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

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
    <div ref={dashboardRef} className="modern-dashboard">
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Admin Panel</h2>
            <p className="sidebar-subtitle">
              Olá, {user.email}
            </p>
            <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
              Role: {user.role}
            </small>
          </div>
          
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FontAwesomeIcon icon={faHome} className="nav-icon" />
              <span>Visão Geral</span>
            </button>
            
            <button
              className={`nav-item ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <FontAwesomeIcon icon={faNewspaper} className="nav-icon" />
              <span>Notícias</span>
            </button>
            
            <button
              className={`nav-item ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('create');
                resetForm();
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="nav-icon" />
              <span>Nova Notícia</span>
            </button>

            {user?.role === 'admin' && (
              <>
                <div className="nav-divider">
                  <span>Aprovações</span>
                </div>
                
                <button
                  className={`nav-item ${activeTab === 'approve-posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('approve-posts')}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="nav-icon" />
                  <span>Aprovar Posts</span>
                  <span className="badge">3</span>
                </button>
                
                <button
                  className={`nav-item ${activeTab === 'approve-ads' ? 'active' : ''}`}
                  onClick={() => setActiveTab('approve-ads')}
                >
                  <FontAwesomeIcon icon={faAd} className="nav-icon" />
                  <span>Aprovar Anúncios</span>
                  <span className="badge">5</span>
                </button>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="main-header">
            <h1 className="main-title">
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'news' && 'Gerenciar Notícias'}
              {activeTab === 'create' && (editingNews ? 'Editar Notícia' : 'Criar Nova Notícia')}
              {activeTab === 'approve-posts' && 'Aprovar Posts de Usuários'}
              {activeTab === 'approve-ads' && 'Aprovar Anúncios'}
            </h1>
          </div>

          <div className="main-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
              <div className="overview-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faNewspaper} />
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-number">{news?.length || 0}</h3>
                    <p className="stat-label">Total de Notícias</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon published">
                    <FontAwesomeIcon icon={faEye} />
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-number">{news?.filter(n => n.published).length || 0}</h3>
                    <p className="stat-label">Notícias Publicadas</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon draft">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-number">{news?.filter(n => !n.published).length || 0}</h3>
                    <p className="stat-label">Rascunhos</p>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <>
                    <div className="stat-card">
                      <div className="stat-icon pending">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-number">3</h3>
                        <p className="stat-label">Posts Pendentes</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon pending">
                        <FontAwesomeIcon icon={faAd} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-number">5</h3>
                        <p className="stat-label">Anúncios Pendentes</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon users">
                        <FontAwesomeIcon icon={faUsers} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-number">247</h3>
                        <p className="stat-label">Usuários Registrados</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              </>
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

            {/* Approve Posts Tab - Admin Only */}
            {activeTab === 'approve-posts' && user?.role === 'admin' && (
              <div className="approval-section">
                <div className="approval-header">
                  <h2>Posts Pendentes de Aprovação</h2>
                  <p>Revise e aprove posts enviados por usuários</p>
                </div>
                
                <div className="approval-grid">
                  {/* Mock pending posts - replace with real data */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="approval-card">
                      <div className="approval-card-header">
                        <h3>Post de Usuário #{i}</h3>
                        <span className="pending-badge">Pendente</span>
                      </div>
                      <div className="approval-card-content">
                        <p className="post-author">Por: user{i}@email.com</p>
                        <p className="post-excerpt">Este é um post enviado por um usuário da comunidade...</p>
                        <div className="post-meta">
                          <span>Enviado há 2 horas</span>
                        </div>
                      </div>
                      <div className="approval-actions">
                        <button className="btn-approve">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          Aprovar
                        </button>
                        <button className="btn-reject">
                          <FontAwesomeIcon icon={faTrash} />
                          Rejeitar
                        </button>
                        <button className="btn-view">
                          <FontAwesomeIcon icon={faEye} />
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approve Ads Tab - Admin Only */}
            {activeTab === 'approve-ads' && user?.role === 'admin' && (
              <div className="approval-section">
                <div className="approval-header">
                  <h2>Anúncios Pendentes de Aprovação</h2>
                  <p>Revise e aprove anúncios enviados por usuários</p>
                </div>
                
                <div className="approval-grid">
                  {/* Mock pending ads - replace with real data */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="approval-card ad-card">
                      <div className="approval-card-header">
                        <h3>Anúncio #{i}</h3>
                        <span className="pending-badge">Pendente</span>
                      </div>
                      <div className="approval-card-content">
                        <p className="ad-title">Serviços de limpeza doméstica</p>
                        <p className="ad-author">Por: anunciante{i}@email.com</p>
                        <p className="ad-category">Categoria: Serviços</p>
                        <p className="ad-price">€50/hora</p>
                        <div className="ad-meta">
                          <span>Enviado há 1 dia</span>
                        </div>
                      </div>
                      <div className="approval-actions">
                        <button className="btn-approve">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          Aprovar
                        </button>
                        <button className="btn-reject">
                          <FontAwesomeIcon icon={faTrash} />
                          Rejeitar
                        </button>
                        <button className="btn-view">
                          <FontAwesomeIcon icon={faEye} />
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
