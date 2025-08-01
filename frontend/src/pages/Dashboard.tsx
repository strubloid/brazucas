import React, { useState } from 'react';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { NewsService } from '../services/newsService';
import { AdService } from '../services/adService';
import { NewsPost, CreateNewsRequest, UpdateNewsRequest } from '../types/news';
import { Advertisement, CreateAdvertisementRequest, UpdateAdvertisementRequest } from '../types/ads';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faNewspaper, 
  faPlus, 
  faCheckCircle, 
  faAd,
  faUsers,
  faTrash,
  faClock,
  faEye,
  faEdit,
  faTimes,
  faEuroSign,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const dashboardRef = useAnimateOnMount('fadeIn');
  const { user } = useAuth();  
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'create' | 'ads' | 'create-ad' | 'approve-posts' | 'approve-ads'>('overview');
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAdDetailsModal, setShowAdDetailsModal] = useState(false);

  const { data: news, loading, refetch } = useAsync<NewsPost[]>(
    () => {
      if (!user) return Promise.resolve([]);
      // Admins see all news, regular users see only their own
      return user.role === 'admin' ? NewsService.getAllNews() : NewsService.getMyNews();
    },
    [user?.role, user?.id]
  );

  // Fetch pending news for admin
  const { data: pendingNews, loading: pendingLoading, refetch: refetchPending } = useAsync<NewsPost[]>(
    () => user?.role === 'admin' ? NewsService.getPendingNews() : Promise.resolve([]),
    [user?.role]
  );

  // Fetch advertisements based on user role
  const { data: ads, loading: adsLoading, refetch: refetchAds } = useAsync<Advertisement[]>(
    () => {
      if (!user) return Promise.resolve([]);
      // Admins see all ads, regular users see only their own
      return user.role === 'admin' ? AdService.getAllAds() : AdService.getMyAds();
    },
    [user?.role, user?.id]
  );

  // Fetch pending advertisements for admin
  const { data: pendingAds, loading: pendingAdsLoading, refetch: refetchPendingAds } = useAsync<Advertisement[]>(
    () => user?.role === 'admin' ? AdService.getPendingAds() : Promise.resolve([]),
    [user?.role]
  );

  // Debug logging
  React.useEffect(() => {
    if (user && news) {
      console.log('Debug - User:', user);
      console.log('Debug - News:', news);
      news.forEach(newsPost => {
        console.log(`News "${newsPost.title}": authorId=${newsPost.authorId}, user.id=${user.id}, match=${newsPost.authorId === user.id}`);
        console.log(`News ID format: "${newsPost.id}" (length: ${newsPost.id.length})`);
      });
    }
  }, [user, news]);

  const [formData, setFormData] = useState<CreateNewsRequest>({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    published: false,
  });

  const [adFormData, setAdFormData] = useState<CreateAdvertisementRequest>({
    title: '',
    description: '',
    category: '',
    price: '',
    contactEmail: '',
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

  const resetAdForm = (): void => {
    setAdFormData({
      title: '',
      description: '',
      category: '',
      price: '',
      contactEmail: '',
      published: false,
    });
    setEditingAd(null);
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

  const handleEditAd = (ad: Advertisement): void => {
    setAdFormData({
      title: ad.title,
      description: ad.description,
      category: ad.category,
      price: ad.price,
      contactEmail: ad.contactEmail,
      published: ad.published,
    });
    setEditingAd(ad);
    setActiveTab('create-ad');
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

  const handleDeleteAd = async (id: string): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja excluir este anúncio?')) return;

    try {
      await AdService.deleteAd(id);
      setSubmitSuccess('Anúncio excluído com sucesso!');
      refetchAds();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao excluir anúncio');
    }
  };

  const handlePublishNews = async (id: string): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja publicar esta notícia?')) return;

    try {
      await NewsService.updateNews({
        id,
        published: true
      });
      setSubmitSuccess('Notícia publicada com sucesso!');
      refetch();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao publicar notícia');
    }
  };

  const handlePublishAd = async (id: string): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja publicar este anúncio?')) return;

    try {
      console.log('Publishing ad with ID:', id);
      const updateData = {
        id,
        published: true
      };
      console.log('Update data being sent:', updateData);
      
      await AdService.updateAd(updateData);
      setSubmitSuccess('Anúncio publicado com sucesso!');
      refetchAds();
    } catch (error) {
      console.error('Error publishing ad:', error);
      setSubmitError(error instanceof Error ? error.message : 'Erro ao publicar anúncio');
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
      
      refetch();
      
      // Wait a bit to show the success message, then reset and change tab
      setTimeout(() => {
        resetForm();
        setActiveTab('news');
      }, 2000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao salvar notícia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAdFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setAdFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAdSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      if (editingAd) {
        // Update existing advertisement
        const updateData: UpdateAdvertisementRequest = {
          id: editingAd.id,
          ...adFormData,
        };
        await AdService.updateAd(updateData);
        setSubmitSuccess('Anúncio atualizado com sucesso!');
      } else {
        // Create new advertisement
        await AdService.createAd(adFormData);
        setSubmitSuccess('Anúncio criado com sucesso!');
      }
      
      refetchAds();
      
      // Wait a bit to show the success message, then reset and change tab
      setTimeout(() => {
        resetAdForm();
        setActiveTab('overview');
      }, 2000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao salvar anúncio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproval = async (newsId: string, approved: boolean) => {
    try {
      setProcessingIds(prev => new Set(prev).add(newsId));
      
      await NewsService.approveNews(newsId, approved);
      
      // Refresh pending news list
      refetchPending();
      
      // Show success message
      const action = approved ? 'aprovado' : 'rejeitado';
      setSubmitSuccess(`Post ${action} com sucesso!`);
      setTimeout(() => setSubmitSuccess(''), 3000);
      
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao processar aprovação');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(newsId);
        return newSet;
      });
    }
  };

  const handleAdApproval = async (adId: string, approved: boolean) => {
    try {
      setProcessingIds(prev => new Set(prev).add(adId));
      
      await AdService.approveAd({ id: adId, approved });
      
      // Refresh pending ads list
      refetchPendingAds();
      
      // Show success message
      const action = approved ? 'aprovado' : 'rejeitado';
      setSubmitSuccess(`Anúncio ${action} com sucesso!`);
      setTimeout(() => setSubmitSuccess(''), 3000);
      
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao processar aprovação de anúncio');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(adId);
        return newSet;
      });
    }
  };

  const handleViewAdDetails = (ad: Advertisement) => {
    setSelectedAd(ad);
    setShowAdDetailsModal(true);
  };

  const closeAdDetailsModal = () => {
    setSelectedAd(null);
    setShowAdDetailsModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleViewDetails = (post: NewsPost) => {
    setSelectedPost(post);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedPost(null);
    setShowDetailsModal(false);
  };

  const getPostStatus = (post: NewsPost) => {
    if (post.published && post.approved === true) {
      return { text: 'Publicada', class: 'published' };
    } else if (post.approved === true && !post.published) {
      return { text: 'Aprovado', class: 'approved' };
    } else if (post.approved === false) {
      return { text: 'Rejeitado', class: 'rejected' };
    } else if (post.approved === null && post.published) {
      // User tried to publish but needs approval
      return { text: 'Aguardando Aprovação', class: 'pending' };
    } else {
      // approved === null and published === false (or undefined)
      return { text: 'Rascunho', class: 'draft' };
    }
  };

  const getAdStatus = (ad: Advertisement) => {
    if (ad.published && ad.approved === true) {
      return { text: 'Publicado', class: 'published' };
    } else if (ad.approved === true && !ad.published) {
      return { text: 'Aprovado', class: 'approved' };
    } else if (ad.approved === false) {
      return { text: 'Rejeitado', class: 'rejected' };
    } else if (ad.approved === null && ad.published) {
      // User tried to publish but needs approval
      return { text: 'Aguardando Aprovação', class: 'pending' };
    } else {
      // approved === null and published === false (or undefined)
      return { text: 'Rascunho', class: 'draft' };
    }
  };

  const getStatusDate = (post: NewsPost) => {
    if (post.published && post.approved === true) {
      return `Publicado em ${new Date(post.updatedAt).toLocaleDateString('pt-BR')}`;
    } else if (post.approved !== null && post.approvedAt) {
      const action = post.approved ? 'Aprovado' : 'Rejeitado';
      return `${action} em ${new Date(post.approvedAt).toLocaleDateString('pt-BR')}`;
    } else if (post.approved === null && post.published) {
      return `Enviado para aprovação em ${new Date(post.createdAt).toLocaleDateString('pt-BR')}`;
    } else {
      return `Criado em ${new Date(post.createdAt).toLocaleDateString('pt-BR')}`;
    }
  };

  const getAdStatusDate = (ad: Advertisement) => {
    if (ad.published && ad.approved === true) {
      return `Publicado em ${new Date(ad.updatedAt).toLocaleDateString('pt-BR')}`;
    } else if (ad.approved !== null && ad.approvedAt) {
      const action = ad.approved ? 'Aprovado' : 'Rejeitado';
      return `${action} em ${new Date(ad.approvedAt).toLocaleDateString('pt-BR')}`;
    } else if (ad.approved === null && ad.published) {
      return `Enviado para aprovação em ${new Date(ad.createdAt).toLocaleDateString('pt-BR')}`;
    } else {
      return `Criado em ${new Date(ad.createdAt).toLocaleDateString('pt-BR')}`;
    }
  };

  return (
    <div ref={dashboardRef} className="modern-dashboard">
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">
              {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </h2>
            <p className="sidebar-subtitle">
              Olá, {user.nickname}
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

            {/* Anunciante Section - Only for advertisers and admins */}
            {(user?.role === 'advertiser' || user?.role === 'admin') && (
              <>
                <div className="nav-divider">
                  <span>Anunciante</span>
                </div>

                <button
                  className={`nav-item ${activeTab === 'ads' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ads')}
                >
                  <FontAwesomeIcon icon={faAd} className="nav-icon" />
                  <span>Anúncios</span>
                </button>

                <button
                  className={`nav-item ${activeTab === 'create-ad' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('create-ad');
                    resetAdForm();
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} className="nav-icon" />
                  <span>Novo Anúncio</span>
                </button>
              </>
            )}

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
                  {pendingNews && pendingNews.length > 0 && (
                    <span className="badge">{pendingNews.length}</span>
                  )}
                </button>
                
                <button
                  className={`nav-item ${activeTab === 'approve-ads' ? 'active' : ''}`}
                  onClick={() => setActiveTab('approve-ads')}
                >
                  <FontAwesomeIcon icon={faAd} className="nav-icon" />
                  <span>Aprovar Anúncios</span>
                  {pendingAds && pendingAds.length > 0 && (
                    <span className="badge">{pendingAds.length}</span>
                  )}
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
              {activeTab === 'ads' && 'Gerenciar Anúncios'}
              {activeTab === 'create-ad' && (editingAd ? 'Editar Anúncio' : 'Criar Novo Anúncio')}
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
                        <h3 className="stat-number">{pendingNews?.length || 0}</h3>
                        <p className="stat-label">Posts Pendentes</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon pending">
                        <FontAwesomeIcon icon={faAd} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-number">{pendingAds?.length || 0}</h3>
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
                            <span className={`dashboard__news-status dashboard__news-status--${getPostStatus(newsPost).class}`}>
                              {getPostStatus(newsPost).text}
                            </span>
                            <span className="dashboard__news-date">
                              {getStatusDate(newsPost)}
                            </span>
                          </div>
                        </div>
                        <div className="dashboard__news-actions">
                          {/* Debug: Show buttons for all posts temporarily */}
                          {true && (
                            <>
                              <button
                                onClick={() => handleEditNews(newsPost)}
                                className="dashboard__news-button dashboard__news-button--edit"
                              >
                                Editar
                              </button>
                              
                              {!newsPost.published && (
                                <button
                                  onClick={() => handlePublishNews(newsPost.id)}
                                  className="dashboard__news-button dashboard__news-button--publish"
                                >
                                  Publicar
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDeleteNews(newsPost.id)}
                                className="dashboard__news-button dashboard__news-button--delete"
                              >
                                Excluir
                              </button>
                            </>
                          )}
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

            {/* Ads Management Tab */}
            {activeTab === 'ads' && (
              <div className="dashboard__news">
                {adsLoading ? (
                  <LoadingSpinner text="Carregando anúncios..." />
                ) : (
                  <div className="dashboard__news-list">
                    {ads?.map((ad, index) => (
                      <div key={ad.id || `ad-${index}`} className="dashboard__news-item">
                        <div className="dashboard__news-content">
                          <h3 className="dashboard__news-title">{ad.title}</h3>
                          <p className="dashboard__news-excerpt">{ad.description}</p>
                          <div className="dashboard__news-meta">
                            <span className="ad-category">{ad.category}</span>
                            <span className="ad-price">{ad.price}</span>
                            <span className={`dashboard__news-status dashboard__news-status--${getAdStatus(ad).class}`}>
                              {getAdStatus(ad).text}
                            </span>
                            <span className="dashboard__news-date">
                              {getAdStatusDate(ad)}
                            </span>
                          </div>
                        </div>
                        <div className="dashboard__news-actions">
                          <button
                            onClick={() => handleEditAd(ad)}
                            className="dashboard__news-button dashboard__news-button--edit"
                          >
                            Editar
                          </button>
                          
                          {!ad.published && (
                            <button
                              onClick={() => handlePublishAd(ad.id)}
                              className="dashboard__news-button dashboard__news-button--publish"
                            >
                              Publicar
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="dashboard__news-button dashboard__news-button--delete"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {ads?.length === 0 && (
                      <div className="dashboard__empty">
                        <p>Nenhum anúncio encontrado.</p>
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

            {/* Create/Edit Advertisement Tab */}
            {activeTab === 'create-ad' && (
              <div className="dashboard__create">
                <form onSubmit={handleAdSubmit} className="dashboard__form">
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
                    <label htmlFor="ad-title" className="dashboard__label">Título do Serviço</label>
                    <input
                      type="text"
                      id="ad-title"
                      name="title"
                      value={adFormData.title}
                      onChange={handleAdInputChange}
                      className="dashboard__input"
                      placeholder="Ex: Serviços de limpeza doméstica"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="dashboard__field">
                    <label htmlFor="ad-category" className="dashboard__label">Categoria</label>
                    <select
                      id="ad-category"
                      name="category"
                      value={adFormData.category}
                      onChange={handleAdInputChange}
                      className="dashboard__input"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Serviços Domésticos">Serviços Domésticos</option>
                      <option value="Limpeza">Limpeza</option>
                      <option value="Jardinagem">Jardinagem</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Culinária">Culinária</option>
                      <option value="Tutoria/Ensino">Tutoria/Ensino</option>
                      <option value="Cuidado de Crianças">Cuidado de Crianças</option>
                      <option value="Cuidado de Idosos">Cuidado de Idosos</option>
                      <option value="Pet Care">Pet Care</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="dashboard__field">
                    <label htmlFor="ad-description" className="dashboard__label">Descrição do Serviço</label>
                    <textarea
                      id="ad-description"
                      name="description"
                      value={adFormData.description}
                      onChange={handleAdInputChange}
                      className="dashboard__textarea"
                      placeholder="Descreva detalhadamente seu serviço, experiência e diferenciais..."
                      rows={6}
                      maxLength={500}
                      required
                    />
                    <div className="char-count">
                      {adFormData.description.length}/500 caracteres
                    </div>
                  </div>

                  <div className="dashboard__field">
                    <label htmlFor="ad-price" className="dashboard__label">Preço</label>
                    <input
                      type="text"
                      id="ad-price"
                      name="price"
                      value={adFormData.price}
                      onChange={handleAdInputChange}
                      className="dashboard__input"
                      placeholder="Ex: €20/hora, €50/dia, A combinar"
                      maxLength={20}
                      required
                    />
                  </div>

                  <div className="dashboard__field">
                    <label htmlFor="ad-contactEmail" className="dashboard__label">Email de Contato</label>
                    <input
                      type="email"
                      id="ad-contactEmail"
                      name="contactEmail"
                      value={adFormData.contactEmail}
                      onChange={handleAdInputChange}
                      className="dashboard__input"
                      placeholder="seu.email@exemplo.com"
                      required
                    />
                  </div>

                  <div className="dashboard__field dashboard__field--checkbox">
                    <label htmlFor="ad-published" className="dashboard__checkbox-label">
                      <input
                        type="checkbox"
                        id="ad-published"
                        name="published"
                        checked={adFormData.published}
                        onChange={handleAdInputChange}
                        className="dashboard__checkbox"
                      />
                      Enviar para aprovação
                    </label>
                  </div>

                  <div className="dashboard__form-actions">
                    <button
                      type="button"
                      onClick={resetAdForm}
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
                        editingAd ? 'Atualizar Anúncio' : 'Criar Anúncio'
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
                
                {pendingLoading ? (
                  <LoadingSpinner text="Carregando posts pendentes..." />
                ) : (
                  <div className="approval-grid">
                    {pendingNews && pendingNews.length > 0 ? (
                      pendingNews.map((post) => (
                        <div key={post.id} className="approval-card">
                          <div className="approval-card-header">
                            <h3>{post.title}</h3>
                            <span className="pending-badge">Pendente</span>
                          </div>
                          <div className="approval-card-content">
                            <p className="post-author">Por: {post.authorNickname}</p>
                            <p className="post-excerpt">{truncateContent(post.excerpt || post.content)}</p>
                            <div className="post-meta">
                              <span>Enviado em {formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                          <div className="approval-actions">
                            <button 
                              className="btn-approve"
                              onClick={() => handleApproval(post.id, true)}
                              disabled={processingIds.has(post.id)}
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                              {processingIds.has(post.id) ? 'Processando...' : 'Aprovar'}
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => handleApproval(post.id, false)}
                              disabled={processingIds.has(post.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              {processingIds.has(post.id) ? 'Processando...' : 'Rejeitar'}
                            </button>
                            <button 
                              className="btn-view"
                              onClick={() => handleViewDetails(post)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                              Ver Detalhes
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-pending-posts">
                        <p>Não há posts pendentes de aprovação.</p>
                        <button onClick={refetchPending} className="btn-refresh">
                          Atualizar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Approve Ads Tab - Admin Only */}
            {activeTab === 'approve-ads' && user?.role === 'admin' && (
              <div className="approval-section">
                <div className="approval-header">
                  <h2>Anúncios Pendentes de Aprovação</h2>
                  <p>Revise e aprove anúncios enviados por usuários</p>
                </div>
                
                {pendingAdsLoading ? (
                  <LoadingSpinner text="Carregando anúncios pendentes..." />
                ) : (
                  <div className="approval-grid">
                    {pendingAds && pendingAds.length > 0 ? (
                      pendingAds.map((ad, index) => (
                        <div key={ad.id || `pending-ad-${index}`} className="approval-card ad-card">
                          <div className="approval-card-header">
                            <h3>{ad.title}</h3>
                            <span className="pending-badge">Pendente</span>
                          </div>
                          <div className="approval-card-content">
                            <p className="ad-author">Por: {ad.authorNickname}</p>
                            <p className="ad-category">Categoria: {ad.category}</p>
                            <p className="ad-description">{truncateContent(ad.description)}</p>
                            <p className="ad-price">Preço: {ad.price}</p>
                            <p className="ad-contact">Contato: {ad.contactEmail}</p>
                            <div className="ad-meta">
                              <span>Enviado em {formatDate(ad.createdAt)}</span>
                            </div>
                          </div>
                          <div className="approval-actions">
                            <button 
                              className="btn-approve"
                              onClick={() => handleAdApproval(ad.id, true)}
                              disabled={processingIds.has(ad.id)}
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                              {processingIds.has(ad.id) ? 'Processando...' : 'Aprovar'}
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => handleAdApproval(ad.id, false)}
                              disabled={processingIds.has(ad.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              {processingIds.has(ad.id) ? 'Processando...' : 'Rejeitar'}
                            </button>
                            <button 
                              className="btn-view"
                              onClick={() => handleViewAdDetails(ad)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                              Ver Detalhes
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-pending-content">
                        <p>Nenhum anúncio pendente de aprovação.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Post Details Modal */}
      {showDetailsModal && selectedPost && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPost.title}</h2>
              <button className="modal-close" onClick={closeDetailsModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="post-details">
                <div className="post-meta-details">
                  <p><strong>Autor:</strong> {selectedPost.authorNickname || selectedPost.authorId}</p>
                  <p><strong>Data de Envio:</strong> {formatDate(selectedPost.createdAt)}</p>
                  {selectedPost.updatedAt !== selectedPost.createdAt && (
                    <p><strong>Última Atualização:</strong> {formatDate(selectedPost.updatedAt)}</p>
                  )}
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${getPostStatus(selectedPost).class}`}>
                      {getPostStatus(selectedPost).text}
                    </span>
                  </p>
                  {selectedPost.approved !== null && selectedPost.approvedAt && (
                    <p><strong>{selectedPost.approved ? 'Aprovado' : 'Rejeitado'} em:</strong> {formatDate(selectedPost.approvedAt)}</p>
                  )}
                </div>
                
                {selectedPost.excerpt && (
                  <div className="post-section">
                    <h3>Resumo:</h3>
                    <p>{selectedPost.excerpt}</p>
                  </div>
                )}
                
                <div className="post-section">
                  <h3>Conteúdo Completo:</h3>
                  <div className="post-content">
                    {selectedPost.content.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                
                {selectedPost.imageUrl && (
                  <div className="post-section">
                    <h3>Imagem:</h3>
                    <img 
                      src={selectedPost.imageUrl} 
                      alt={selectedPost.title}
                      className="post-image"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-approve"
                  onClick={() => {
                    handleApproval(selectedPost.id, true);
                    closeDetailsModal();
                  }}
                  disabled={processingIds.has(selectedPost.id)}
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Aprovar Post
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => {
                    handleApproval(selectedPost.id, false);
                    closeDetailsModal();
                  }}
                  disabled={processingIds.has(selectedPost.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Rejeitar Post
                </button>
                <button className="btn-secondary" onClick={closeDetailsModal}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
