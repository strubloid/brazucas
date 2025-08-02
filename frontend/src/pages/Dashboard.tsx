import React, { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
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
  faCog,
  faChevronLeft,
  faChevronRight,
  faSquare,
  faList
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.scss';
import './PokemonCarousel.scss';
import './ViewModeControls.scss';

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
  
  // Carousel state for news
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Carousel state for ads
  const [currentAdCardIndex, setCurrentAdCardIndex] = useState(0);
  const adCarouselRef = useRef<HTMLDivElement>(null);
  const adCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Carousel state for pending posts approval
  const [currentPendingPostIndex, setCurrentPendingPostIndex] = useState(0);
  const pendingPostCarouselRef = useRef<HTMLDivElement>(null);
  const pendingPostCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Carousel state for pending ads approval
  const [currentPendingAdIndex, setCurrentPendingAdIndex] = useState(0);
  const pendingAdCarouselRef = useRef<HTMLDivElement>(null);
  const pendingAdCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // View mode states for all carousels
  const [newsViewMode, setNewsViewMode] = useState<'card' | 'list'>('card');
  const [adsViewMode, setAdsViewMode] = useState<'card' | 'list'>('card');
  const [pendingPostsViewMode, setPendingPostsViewMode] = useState<'card' | 'list'>('card');
  const [pendingAdsViewMode, setPendingAdsViewMode] = useState<'card' | 'list'>('card');

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

  // Debug ads logging
  React.useEffect(() => {
    if (ads) {
      console.log('Debug - Ads array:', ads);
      ads.forEach((ad, index) => {
        console.log(`Ad ${index}: "${ad.title}", id="${ad.id}", type=${typeof ad.id}`);
      });
    }
  }, [ads]);

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

  // Initialize card positions - Must be before early return
  useEffect(() => {
    if (news && news.length > 0 && cardRefs.current.length > 0) {
      cardRefs.current.forEach((card, index) => {
        if (card) {
          if (index === currentCardIndex) {
            // Current card
            anime.set(card, {
              translateX: 0,
              rotateY: 0,
              opacity: 1,
              scale: 1,
              zIndex: 10
            });
          } else {
            // Hidden cards
            anime.set(card, {
              translateX: index > currentCardIndex ? 600 : -600,
              rotateY: index > currentCardIndex ? 90 : -90,
              opacity: 0,
              scale: 0.7,
              zIndex: 1
            });
          }
        }
      });
    }
  }, [news, currentCardIndex]);

  // Initialize ad card positions - Must be before early return
  useEffect(() => {
    if (ads && ads.length > 0 && adCardRefs.current.length > 0) {
      adCardRefs.current.forEach((card, index) => {
        if (card) {
          if (index === currentAdCardIndex) {
            // Current card
            anime.set(card, {
              translateX: 0,
              rotateY: 0,
              opacity: 1,
              scale: 1,
              zIndex: 10
            });
          } else {
            // Hidden cards
            anime.set(card, {
              translateX: index > currentAdCardIndex ? 600 : -600,
              rotateY: index > currentAdCardIndex ? 90 : -90,
              opacity: 0,
              scale: 0.7,
              zIndex: 1
            });
          }
        }
      });
    }
  }, [ads, currentAdCardIndex]);

  // Initialize pending posts card positions - Must be before early return
  useEffect(() => {
    if (pendingNews && pendingNews.length > 0 && pendingPostCardRefs.current.length > 0) {
      pendingPostCardRefs.current.forEach((card, index) => {
        if (card) {
          if (index === currentPendingPostIndex) {
            // Current card
            anime.set(card, {
              translateX: 0,
              rotateY: 0,
              opacity: 1,
              scale: 1,
              zIndex: 10
            });
          } else {
            // Hidden cards
            anime.set(card, {
              translateX: index > currentPendingPostIndex ? 600 : -600,
              rotateY: index > currentPendingPostIndex ? 90 : -90,
              opacity: 0,
              scale: 0.7,
              zIndex: 1
            });
          }
        }
      });
    }
  }, [pendingNews, currentPendingPostIndex]);

  // Initialize pending ads card positions - Must be before early return
  useEffect(() => {
    if (pendingAds && pendingAds.length > 0 && pendingAdCardRefs.current.length > 0) {
      pendingAdCardRefs.current.forEach((card, index) => {
        if (card) {
          if (index === currentPendingAdIndex) {
            // Current card
            anime.set(card, {
              translateX: 0,
              rotateY: 0,
              opacity: 1,
              scale: 1,
              zIndex: 10
            });
          } else {
            // Hidden cards
            anime.set(card, {
              translateX: index > currentPendingAdIndex ? 600 : -600,
              rotateY: index > currentPendingAdIndex ? 90 : -90,
              opacity: 0,
              scale: 0.7,
              zIndex: 1
            });
          }
        }
      });
    }
  }, [pendingAds, currentPendingAdIndex]);

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

  // Wrapper functions for list view actions
  const handleApprovePost = (postId: string) => {
    handleApproval(postId, true);
  };

  const handleRejectPost = (postId: string) => {
    handleApproval(postId, false);
  };

  const handleApproveAd = (adId: string) => {
    handleAdApproval(adId, true);
  };

  const handleRejectAd = (adId: string) => {
    handleAdApproval(adId, false);
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

  const truncateContent = (content: string | null | undefined, maxLength: number = 80) => {
    if (!content) return '';
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

  // Carousel functions for Pokemon card effect
  const nextCard = () => {
    if (!news || news.length === 0) return;
    
    const currentCard = cardRefs.current[currentCardIndex];
    const nextIndex = (currentCardIndex + 1) % news.length;
    const nextCard = cardRefs.current[nextIndex];
    
    if (currentCard && nextCard) {
      // Animate current card out (to the left)
      anime({
        targets: currentCard,
        translateX: [-300, -600],
        rotateY: [0, -90],
        opacity: [1, 0],
        scale: [1, 0.7],
        duration: 400,
        easing: 'easeInBack'
      });
      
      // Animate next card in (from the right)
      anime({
        targets: nextCard,
        translateX: [600, 0],
        rotateY: [90, 0],
        opacity: [0, 1],
        scale: [0.7, 1],
        duration: 600,
        delay: 200,
        easing: 'easeOutExpo'
      });
    }
    
    setCurrentCardIndex(nextIndex);
  };

  const prevCard = () => {
    if (!news || news.length === 0) return;
    
    const currentCard = cardRefs.current[currentCardIndex];
    const prevIndex = (currentCardIndex - 1 + news.length) % news.length;
    const prevCard = cardRefs.current[prevIndex];
    
    if (currentCard && prevCard) {
      // Animate current card out (to the right)
      anime({
        targets: currentCard,
        translateX: [0, 600],
        rotateY: [0, 90],
        opacity: [1, 0],
        scale: [1, 0.7],
        duration: 400,
        easing: 'easeInBack'
      });
      
      // Animate previous card in (from the left)
      anime({
        targets: prevCard,
        translateX: [-600, 0],
        rotateY: [-90, 0],
        opacity: [0, 1],
        scale: [0.7, 1],
        duration: 600,
        delay: 200,
        easing: 'easeOutExpo'
      });
    }
    
    setCurrentCardIndex(prevIndex);
  };

  // Carousel functions for Ads Pokemon card effect
  const nextAdCard = () => {
    if (!ads || ads.length === 0) return;
    
    const currentCard = adCardRefs.current[currentAdCardIndex];
    const nextIndex = (currentAdCardIndex + 1) % ads.length;
    const nextCard = adCardRefs.current[nextIndex];
    
    if (currentCard && nextCard) {
      // Animate current card out (to the left)
      anime({
        targets: currentCard,
        translateX: [-300, -600],
        rotateY: [0, -90],
        opacity: [1, 0],
        scale: [1, 0.7],
        duration: 400,
        easing: 'easeInBack'
      });
      
      // Animate next card in (from the right)
      anime({
        targets: nextCard,
        translateX: [600, 0],
        rotateY: [90, 0],
        opacity: [0, 1],
        scale: [0.7, 1],
        duration: 600,
        delay: 200,
        easing: 'easeOutExpo'
      });
    }
    
    setCurrentAdCardIndex(nextIndex);
  };

  const prevAdCard = () => {
    if (!ads || ads.length === 0) return;
    
    const currentCard = adCardRefs.current[currentAdCardIndex];
    const prevIndex = (currentAdCardIndex - 1 + ads.length) % ads.length;
    const prevCard = adCardRefs.current[prevIndex];
    
    if (currentCard && prevCard) {
      // Animate current card out (to the right)
      anime({
        targets: currentCard,
        translateX: [0, 600],
        rotateY: [0, 90],
        opacity: [1, 0],
        scale: [1, 0.7],
        duration: 400,
        easing: 'easeInBack'
      });
      
      // Animate previous card in (from the left)
      anime({
        targets: prevCard,
        translateX: [-600, 0],
        rotateY: [-90, 0],
        opacity: [0, 1],
        scale: [0.7, 1],
        duration: 600,
        delay: 200,
        easing: 'easeOutExpo'
      });
    }
    
    setCurrentAdCardIndex(prevIndex);
  };

  // Carousel functions for Pending Posts approval
  const nextPendingPost = () => {
    if (!pendingNews || pendingNews.length === 0) return;
    
    const currentCard = pendingPostCardRefs.current[currentPendingPostIndex];
    const nextIndex = (currentPendingPostIndex + 1) % pendingNews.length;
    const nextCard = pendingPostCardRefs.current[nextIndex];
    
    if (currentCard && nextCard) {
      // Animate current card out (to the left)
      anime({
        targets: currentCard,
        translateX: [-300, -600],
        rotateY: [0, -90],
        opacity: [1, 0],
        scale: [1, 0.7],
        duration: 400,
        easing: 'easeInBack'
      });
      
      // Animate next card in (from the right)
      anime({
        targets: nextCard,
        translateX: [600, 0],
        rotateY: [90, 0],
        opacity: [0, 1],
        scale: [0.7, 1],
        duration: 600,
        delay: 200,
        easing: 'easeOutExpo'
      });
    }
    
    setCurrentPendingPostIndex(nextIndex);
  };

  const prevPendingPost = () => {
    if (!pendingNews || pendingNews.length === 0) return;
    
    const currentCard = pendingPostCardRefs.current[currentPendingPostIndex];
    const prevIndex = (currentPendingPostIndex - 1 + pendingNews.length) % pendingNews.length;
    const prevCard = pendingPostCardRefs.current[prevIndex];
    
    if (currentCard && prevCard) {
      // Animate current card out (to the right)
      anime({
        targets: currentCard,
        translateX: [0, 600],
        rotateY: [0, 90],
        opacity: [1, 0],
        scale: [1, 0.7],
        duration: 400,
        easing: 'easeInBack'
      });
      
      // Animate previous card in (from the left)
      anime({
        targets: prevCard,
        translateX: [-600, 0],
        rotateY: [-90, 0],
        opacity: [0, 1],
        scale: [0.7, 1],
        duration: 600,
        delay: 200,
        easing: 'easeOutExpo'
      });
    }
    
    setCurrentPendingPostIndex(prevIndex);
  };

  // Carousel functions for Pending Ads approval
  const nextPendingAd = () => {
    if (!pendingAds || pendingAds.length === 0) return;
    
    const currentCard = pendingAdCardRefs.current[currentPendingAdIndex];
    const nextIndex = (currentPendingAdIndex + 1) % pendingAds.length;
    const nextCard = pendingAdCardRefs.current[nextIndex];
    
    if (currentCard && nextCard) {
      // Animate current card out (to the left)
      anime({
        targets: currentCard,
        translateX: [-300, -600],
        rotateY: [0, -90],
        opacity: [1, 0],
        scale: [1, 0.7],
        duration: 400,
        easing: 'easeInBack'
      });
      
      // Animate next card in (from the right)
      anime({
        targets: nextCard,
        translateX: [600, 0],
        rotateY: [90, 0],
        opacity: [0, 1],
        scale: [0.7, 1],
        duration: 600,
        delay: 200,
        easing: 'easeOutExpo'
      });
    }
    
    setCurrentPendingAdIndex(nextIndex);
  };

  const prevPendingAd = () => {
    if (!pendingAds || pendingAds.length === 0) return;
    
    const currentCard = pendingAdCardRefs.current[currentPendingAdIndex];
    const prevIndex = (currentPendingAdIndex - 1 + pendingAds.length) % pendingAds.length;
    const prevCard = pendingAdCardRefs.current[prevIndex];
    
    if (currentCard && prevCard) {
      // Animate current card out (to the right)
      anime({
        targets: currentCard,
        translateX: [0, 600],
        rotateY: [0, 90],
        opacity: [1, 0],
        scale: [1, 0.7],
        duration: 400,
        easing: 'easeInBack'
      });
      
      // Animate previous card in (from the left)
      anime({
        targets: prevCard,
        translateX: [-600, 0],
        rotateY: [-90, 0],
        opacity: [0, 1],
        scale: [0.7, 1],
        duration: 600,
        delay: 200,
        easing: 'easeOutExpo'
      });
    }
    
    setCurrentPendingAdIndex(prevIndex);
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

                {/* Advertisement stats for advertisers and admins */}
                {(user?.role === 'advertiser' || user?.role === 'admin') && (
                  <>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faAd} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-number">{ads?.length || 0}</h3>
                        <p className="stat-label">Total de Anúncios</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon published">
                        <FontAwesomeIcon icon={faEye} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-number">{ads?.filter(a => a.published).length || 0}</h3>
                        <p className="stat-label">Anúncios Publicados</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon draft">
                        <FontAwesomeIcon icon={faClock} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-number">{ads?.filter(a => !a.published).length || 0}</h3>
                        <p className="stat-label">Anúncios Rascunho</p>
                      </div>
                    </div>
                  </>
                )}

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
                  <>
                    {news && news.length > 0 ? (
                      <div className="pokemon-carousel-container">
                        <div className="carousel-header">
                          
                          <div className="view-controls">
                            <div className="view-mode-buttons">
                              <button
                                className={`view-btn ${newsViewMode === 'card' ? 'active' : ''}`}
                                onClick={() => {
                                  console.log('Switching to card view for news');
                                  setNewsViewMode('card');
                                }}
                                title="Visualização em Cards"
                              >
                                <FontAwesomeIcon icon={faSquare} />
                                <span>Cards</span>
                              </button>
                              <button
                                className={`view-btn ${newsViewMode === 'list' ? 'active' : ''}`}
                                onClick={() => {
                                  console.log('Switching to list view for news');
                                  setNewsViewMode('list');
                                }}
                                title="Visualização em Lista"
                              >
                                <FontAwesomeIcon icon={faList} />
                                <span>Lista</span>
                              </button>
                            </div>
                            {newsViewMode === 'card' && (
                              <div className="carousel-info">
                                <span>{currentCardIndex + 1} de {news.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {newsViewMode === 'card' ? (
                          // Pokemon Card View (One by One)
                          <div className="pokemon-carousel" ref={carouselRef}>
                            {/* Navigation buttons */}
                            <button 
                              className="carousel-nav carousel-nav--prev"
                              onClick={prevCard}
                              disabled={news.length <= 1}
                            >
                              <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            
                            <button 
                              className="carousel-nav carousel-nav--next"
                              onClick={nextCard}
                              disabled={news.length <= 1}
                            >
                              <FontAwesomeIcon icon={faChevronRight} />
                            </button>

                            {/* Pokemon Cards */}
                            <div className="cards-container">
                              {news.map((newsPost, index) => (
                                <div
                                  key={newsPost.id}
                                  ref={el => cardRefs.current[index] = el}
                                  className={`pokemon-card ${getPostStatus(newsPost).class}`}
                                  style={{
                                    position: 'absolute',
                                    width: '400px',
                                    height: '550px'
                                  }}
                                >
                                  <div className="pokemon-card-inner">
                                    <div className="pokemon-card-header">
                                      <div className="card-type">Notícia</div>
                                      <div className={`card-status ${getPostStatus(newsPost).class}`}>
                                        {getPostStatus(newsPost).text}
                                      </div>
                                    </div>
                                    
                                    <div className="pokemon-card-image">
                                      {newsPost.imageUrl ? (
                                        <img src={newsPost.imageUrl} alt={newsPost.title} />
                                      ) : (
                                        <div className="placeholder-image">
                                          <FontAwesomeIcon icon={faNewspaper} size="3x" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="pokemon-card-content">
                                      <h3 className="pokemon-card-title">{newsPost.title}</h3>
                                      <p className="pokemon-card-excerpt">{truncateContent(newsPost.excerpt, 100)}</p>
                                      
                                      <div className="pokemon-card-meta">
                                        <div className="meta-item">
                                          <span className="meta-label">Data:</span>
                                          <span className="meta-value">{new Date(newsPost.createdAt).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        {newsPost.published && (
                                          <div className="meta-item">
                                            <span className="meta-label">Publicado:</span>
                                            <span className="meta-value">Sim</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="pokemon-card-actions">
                                      <button
                                        onClick={() => handleEditNews(newsPost)}
                                        className="pokemon-action-btn pokemon-action-btn--edit"
                                      >
                                        <FontAwesomeIcon icon={faEdit} />
                                        Editar
                                      </button>
                                      
                                      {!newsPost.published && (
                                        <button
                                          onClick={() => handlePublishNews(newsPost.id)}
                                          className="pokemon-action-btn pokemon-action-btn--publish"
                                        >
                                          <FontAwesomeIcon icon={faEye} />
                                          Publicar
                                        </button>
                                      )}
                                      
                                      <button
                                        onClick={() => handleDeleteNews(newsPost.id)}
                                        className="pokemon-action-btn pokemon-action-btn--delete"
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                        Excluir
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Dots indicator */}
                            <div className="carousel-dots">
                              {news.map((_, index) => (
                                <button
                                  key={index}
                                  className={`carousel-dot ${index === currentCardIndex ? 'active' : ''}`}
                                  onClick={() => {
                                    const currentCard = cardRefs.current[currentCardIndex];
                                    const targetCard = cardRefs.current[index];
                                    
                                    if (currentCard && targetCard && index !== currentCardIndex) {
                                      // Animate current card out
                                      anime({
                                        targets: currentCard,
                                        opacity: [1, 0],
                                        scale: [1, 0.7],
                                        rotateY: [0, index > currentCardIndex ? 90 : -90],
                                        duration: 300,
                                        easing: 'easeInBack'
                                      });
                                      
                                      // Animate target card in
                                      anime({
                                        targets: targetCard,
                                        translateX: [index > currentCardIndex ? 600 : -600, 0],
                                        rotateY: [index > currentCardIndex ? 90 : -90, 0],
                                        opacity: [0, 1],
                                        scale: [0.7, 1],
                                        duration: 500,
                                        delay: 150,
                                        easing: 'easeOutExpo'
                                      });
                                      
                                      setCurrentCardIndex(index);
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          // List View (Multiple Items)
                          <div className="list-view-container">
                            <div className="news-list-grid">
                              {news.map((newsPost) => (
                                <div key={newsPost.id} className={`news-list-item ${getPostStatus(newsPost).class}`}>
                                  <div className="news-list-content">
                                    <div className="news-list-header">
                                      <h3 className="news-list-title">{newsPost.title}</h3>
                                      <span className={`news-list-status ${getPostStatus(newsPost).class}`}>
                                        {getPostStatus(newsPost).text}
                                      </span>
                                    </div>
                                    <p className="news-list-excerpt">{truncateContent(newsPost.excerpt, 150)}</p>
                                    <div className="news-list-meta">
                                      <span className="news-list-date">
                                        {new Date(newsPost.createdAt).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="news-list-actions">
                                    <button
                                      onClick={() => handleEditNews(newsPost)}
                                      className="list-action-btn list-action-btn--edit"
                                      title="Editar"
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    
                                    {!newsPost.published && (
                                      <button
                                        onClick={() => handlePublishNews(newsPost.id)}
                                        className="list-action-btn list-action-btn--publish"
                                        title="Publicar"
                                      >
                                        <FontAwesomeIcon icon={faEye} />
                                      </button>
                                    )}
                                    
                                    <button
                                      onClick={() => handleDeleteNews(newsPost.id)}
                                      className="list-action-btn list-action-btn--delete"
                                      title="Excluir"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="dashboard__empty">
                        <p>Nenhuma notícia encontrada.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Ads Management Tab */}
            {activeTab === 'ads' && (
              <div className="dashboard__news">
                {adsLoading ? (
                  <LoadingSpinner text="Carregando anúncios..." />
                ) : (
                  <>
                    {ads && ads.length > 0 ? (
                      <div className="pokemon-carousel-container">
                        <div className="carousel-header">
                          
                          <div className="view-controls">
                            <div className="view-mode-buttons">
                              <button
                                className={`view-btn ${adsViewMode === 'card' ? 'active' : ''}`}
                                onClick={() => {
                                  console.log('Switching to card view for ads');
                                  setAdsViewMode('card');
                                }}
                                title="Visualização em Cards"
                              >
                                <FontAwesomeIcon icon={faSquare} />
                                <span>Cards</span>
                              </button>
                              <button
                                className={`view-btn ${adsViewMode === 'list' ? 'active' : ''}`}
                                onClick={() => {
                                  console.log('Switching to list view for ads');
                                  setAdsViewMode('list');
                                }}
                                title="Visualização em Lista"
                              >
                                <FontAwesomeIcon icon={faList} />
                                <span>Lista</span>
                              </button>
                            </div>
                            {adsViewMode === 'card' && (
                              <div className="carousel-info">
                                <span>{currentAdCardIndex + 1} de {ads.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {adsViewMode === 'card' ? (
                          // Pokemon Card View (One by One)
                          <div className="pokemon-carousel" ref={adCarouselRef}>
                            {/* Navigation buttons */}
                            <button 
                              className="carousel-nav carousel-nav--prev"
                              onClick={prevAdCard}
                              disabled={ads.length <= 1}
                            >
                              <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            
                            <button 
                              className="carousel-nav carousel-nav--next"
                              onClick={nextAdCard}
                              disabled={ads.length <= 1}
                            >
                              <FontAwesomeIcon icon={faChevronRight} />
                            </button>

                            {/* Pokemon Cards for Ads */}
                            <div className="cards-container">
                              {ads.map((ad, index) => (
                                <div
                                  key={ad.id || `ad-${index}`}
                                  ref={el => adCardRefs.current[index] = el}
                                  className={`pokemon-card ${getAdStatus(ad).class}`}
                                  style={{
                                    position: 'absolute',
                                    width: '400px',
                                    height: '550px'
                                  }}
                                >
                                  <div className="pokemon-card-inner">
                                    <div className="pokemon-card-header">
                                      <div className="card-type">Anúncio</div>
                                      <div className={`card-status ${getAdStatus(ad).class}`}>
                                        {getAdStatus(ad).text}
                                      </div>
                                    </div>
                                    
                                    <div className="pokemon-card-image">
                                      <div className="placeholder-image">
                                        <FontAwesomeIcon icon={faAd} size="3x" />
                                      </div>
                                    </div>
                                    
                                    <div className="pokemon-card-content">
                                      <h3 className="pokemon-card-title">{ad.title}</h3>
                                      <p className="pokemon-card-excerpt">{truncateContent(ad.description, 100)}</p>
                                      
                                      <div className="pokemon-card-meta">
                                        <div className="meta-item">
                                          <span className="meta-label">Categoria:</span>
                                          <span className="meta-value">{ad.category}</span>
                                        </div>
                                        <div className="meta-item">
                                          <span className="meta-label">Preço:</span>
                                          <span className="meta-value">{ad.price}</span>
                                        </div>
                                        <div className="meta-item">
                                          <span className="meta-label">Data:</span>
                                          <span className="meta-value">{new Date(ad.createdAt).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="pokemon-card-actions">
                                      {/* Only show Edit if ad is not rejected */}
                                      {getAdStatus(ad).class !== 'rejected' && getAdStatus(ad).class !== 'published' && (
                                        <button
                                          onClick={() => handleEditAd(ad)}
                                          className="pokemon-action-btn pokemon-action-btn--edit"
                                        >
                                          <FontAwesomeIcon icon={faEdit} />
                                          Editar
                                        </button>
                                      )}
                                      
                                      {/* Only show Publish if ad is not published and not rejected */}
                                      {!ad.published && getAdStatus(ad).class !== 'rejected' && (
                                        <button
                                          onClick={() => handlePublishAd(ad.id)}
                                          className="pokemon-action-btn pokemon-action-btn--publish"
                                        >
                                          <FontAwesomeIcon icon={faEye} />
                                          Publicar
                                        </button>
                                      )}
                                      
                                      <button
                                        onClick={() => handleDeleteAd(ad.id)}
                                        className="pokemon-action-btn pokemon-action-btn--delete"
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                        Excluir
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Dots indicator for ads */}
                            <div className="carousel-dots">
                              {ads.map((_, index) => (
                                <button
                                  key={index}
                                  className={`carousel-dot ${index === currentAdCardIndex ? 'active' : ''}`}
                                  onClick={() => {
                                    const currentCard = adCardRefs.current[currentAdCardIndex];
                                    const targetCard = adCardRefs.current[index];
                                    
                                    if (currentCard && targetCard && index !== currentAdCardIndex) {
                                      // Animate current card out
                                      anime({
                                        targets: currentCard,
                                        opacity: [1, 0],
                                        scale: [1, 0.7],
                                        rotateY: [0, index > currentAdCardIndex ? 90 : -90],
                                        duration: 300,
                                        easing: 'easeInBack'
                                      });
                                      
                                      // Animate target card in
                                      anime({
                                        targets: targetCard,
                                        translateX: [index > currentAdCardIndex ? 600 : -600, 0],
                                        rotateY: [index > currentAdCardIndex ? 90 : -90, 0],
                                        opacity: [0, 1],
                                        scale: [0.7, 1],
                                        duration: 500,
                                        delay: 150,
                                        easing: 'easeOutExpo'
                                      });
                                      
                                      setCurrentAdCardIndex(index);
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          // List View (Multiple Items)
                          <div className="list-view-container">
                            <div className="ads-list-grid">
                              {ads.map((ad) => (
                                <div key={ad.id || `ad-list-${ad.id}`} className={`ads-list-item ${getAdStatus(ad).class}`}>
                                  <div className="ads-list-content">
                                    <div className="ads-list-header">
                                      <h3 className="ads-list-title">{ad.title}</h3>
                                      <span className={`ads-list-status ${getAdStatus(ad).class}`}>
                                        {getAdStatus(ad).text}
                                      </span>
                                    </div>
                                    <p className="ads-list-excerpt">{truncateContent(ad.description, 150)}</p>
                                    <div className="ads-list-meta">
                                      <span className="ads-list-category">{ad.category}</span>
                                      <span className="ads-list-price">{ad.price}</span>
                                      <span className="ads-list-date">
                                        {new Date(ad.createdAt).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ads-list-actions">
                                    {/* Only show Edit if ad is not rejected */}
                                    {getAdStatus(ad).class !== 'rejected' && getAdStatus(ad).class !== 'published' && (
                                      <button
                                        onClick={() => handleEditAd(ad)}
                                        className="list-action-btn list-action-btn--edit"
                                        title="Editar"
                                      >
                                        <FontAwesomeIcon icon={faEdit} />
                                      </button>
                                    )}
                                    
                                    {/* Only show Publish if ad is not published and not rejected */}
                                    {!ad.published && getAdStatus(ad).class !== 'rejected' && (
                                      <button
                                        onClick={() => handlePublishAd(ad.id)}
                                        className="list-action-btn list-action-btn--publish"
                                        title="Publicar"
                                      >
                                        <FontAwesomeIcon icon={faEye} />
                                      </button>
                                    )}
                                    
                                    <button
                                      onClick={() => handleDeleteAd(ad.id)}
                                      className="list-action-btn list-action-btn--delete"
                                      title="Excluir"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="dashboard__empty">
                        <p>Nenhum anúncio encontrado.</p>
                      </div>
                    )}
                  </>
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
                                
                {pendingLoading ? (
                  <LoadingSpinner text="Carregando posts pendentes..." />
                ) : (
                  <>
                    {pendingNews && pendingNews.length > 0 ? (
                      <div className="pokemon-carousel-container">
                        <div className="view-controls">
                          <div className="view-mode-buttons">
                            <button
                                className={`view-btn ${pendingPostsViewMode === 'card' ? 'active' : ''}`}
                                onClick={() => {
                                  console.log('Switching to card view for pending posts');
                                  setPendingPostsViewMode('card');
                                }}
                                title="Vista de Cartas Pokemon"
                            >
                                <FontAwesomeIcon icon={faSquare} />
                                <span>Cards</span>
                            </button>
                            <button
                                className={`view-btn ${pendingPostsViewMode === 'list' ? 'active' : ''}`}
                                onClick={() => {
                                  console.log('Switching to list view for pending posts');
                                  setPendingPostsViewMode('list');
                                }}
                                title="Vista de Lista"
                            >
                                <FontAwesomeIcon icon={faList} />
                                <span>Lista</span>
                            </button>
                          </div>
                          <div className="carousel-info">
                            {pendingPostsViewMode === 'card' && (
                              <span>{currentPendingPostIndex + 1} de {pendingNews.length}</span>
                            )}
                          </div>
                        </div>
                        
                        {pendingPostsViewMode === 'card' ? (
                          <div className="pokemon-carousel" ref={pendingPostCarouselRef}>
                          {/* Navigation buttons */}
                          <button 
                            className="carousel-nav carousel-nav--prev"
                            onClick={prevPendingPost}
                            disabled={pendingNews.length <= 1}
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </button>
                          
                          <button 
                            className="carousel-nav carousel-nav--next"
                            onClick={nextPendingPost}
                            disabled={pendingNews.length <= 1}
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </button>

                          {/* Pokemon Cards for Pending Posts */}
                          <div className="cards-container">
                            {pendingNews.map((post, index) => (
                              <div
                                key={post.id}
                                ref={el => pendingPostCardRefs.current[index] = el}
                                className="pokemon-card pending"
                                style={{
                                  position: 'absolute',
                                  width: '400px',
                                  height: '550px'
                                }}
                              >
                                <div className="pokemon-card-inner">
                                  <div className="pokemon-card-header">
                                    <div className="card-type">Post Pendente</div>
                                    <div className="card-status pending">
                                      Aguardando Aprovação
                                    </div>
                                  </div>
                                  
                                  <div className="pokemon-card-image">
                                    {post.imageUrl ? (
                                      <img src={post.imageUrl} alt={post.title} />
                                    ) : (
                                      <div className="placeholder-image">
                                        <FontAwesomeIcon icon={faNewspaper} size="3x" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="pokemon-card-content">
                                    <h3 className="pokemon-card-title">{post.title}</h3>
                                    <p className="pokemon-card-excerpt">{truncateContent(post.excerpt || post.content, 100)}</p>
                                    
                                    <div className="pokemon-card-meta">
                                      <div className="meta-item">
                                        <span className="meta-label">Autor:</span>
                                        <span className="meta-value">{post.authorNickname}</span>
                                      </div>
                                      <div className="meta-item">
                                        <span className="meta-label">Enviado:</span>
                                        <span className="meta-value">{formatDate(post.createdAt)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="pokemon-card-actions">
                                    <button
                                      onClick={() => handleApproval(post.id, true)}
                                      className="pokemon-action-btn pokemon-action-btn--publish"
                                      disabled={processingIds.has(post.id)}
                                    >
                                      <FontAwesomeIcon icon={faCheckCircle} />
                                      {processingIds.has(post.id) ? 'Processando...' : 'Aprovar'}
                                    </button>
                                    
                                    <button
                                      onClick={() => handleApproval(post.id, false)}
                                      className="pokemon-action-btn pokemon-action-btn--delete"
                                      disabled={processingIds.has(post.id)}
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                      {processingIds.has(post.id) ? 'Processando...' : 'Rejeitar'}
                                    </button>
                                    
                                    <button
                                      onClick={() => handleViewDetails(post)}
                                      className="pokemon-action-btn pokemon-action-btn--edit"
                                    >
                                      <FontAwesomeIcon icon={faEye} />
                                      Ver Detalhes
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Dots indicator for pending posts */}
                          <div className="carousel-dots">
                            {pendingNews.map((_, index) => (
                              <button
                                key={index}
                                className={`carousel-dot ${index === currentPendingPostIndex ? 'active' : ''}`}
                                onClick={() => {
                                  const currentCard = pendingPostCardRefs.current[currentPendingPostIndex];
                                  const targetCard = pendingPostCardRefs.current[index];
                                  
                                  if (currentCard && targetCard && index !== currentPendingPostIndex) {
                                    // Animate current card out
                                    anime({
                                      targets: currentCard,
                                      opacity: [1, 0],
                                      scale: [1, 0.7],
                                      rotateY: [0, index > currentPendingPostIndex ? 90 : -90],
                                      duration: 300,
                                      easing: 'easeInBack'
                                    });
                                    
                                    // Animate target card in
                                    anime({
                                      targets: targetCard,
                                      translateX: [index > currentPendingPostIndex ? 600 : -600, 0],
                                      rotateY: [index > currentPendingPostIndex ? 90 : -90, 0],
                                      opacity: [0, 1],
                                      scale: [0.7, 1],
                                      duration: 500,
                                      delay: 150,
                                      easing: 'easeOutExpo'
                                    });
                                    
                                    setCurrentPendingPostIndex(index);
                                  }
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        ) : (
                          <div className="list-view-container">
                            <div className="news-list-grid">
                              {pendingNews.map((post) => (
                                <div key={post.id} className="news-list-item pending">
                                  <div className="news-list-content">
                                    <div className="news-list-header">
                                      <h3 className="news-list-title">{post.title}</h3>
                                      <span className="news-list-status pending">Pendente</span>
                                    </div>
                                    <p className="news-list-excerpt">{post.content.substring(0, 150)}...</p>
                                    <div className="news-list-meta">
                                      <span className="news-list-date">
                                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="news-list-actions">
                                    <button
                                      onClick={() => handleApprovePost(post.id)}
                                      className="list-action-btn list-action-btn--publish"
                                      disabled={processingIds.has(post.id)}
                                      title="Aprovar Post"
                                    >
                                      <FontAwesomeIcon icon={faCheckCircle} />
                                    </button>
                                    <button
                                      onClick={() => handleRejectPost(post.id)}
                                      className="list-action-btn list-action-btn--delete"
                                      disabled={processingIds.has(post.id)}
                                      title="Rejeitar Post"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    <button
                                      onClick={() => handleViewDetails(post)}
                                      className="list-action-btn list-action-btn--edit"
                                      title="Ver Detalhes"
                                    >
                                      <FontAwesomeIcon icon={faEye} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-pending-posts">
                        <p>Não há posts pendentes de aprovação.</p>
                        <button onClick={refetchPending} className="btn-refresh">
                          Atualizar
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Approve Ads Tab - Admin Only */}
            {activeTab === 'approve-ads' && user?.role === 'admin' && (
              <div className="approval-section">
                
                {pendingAdsLoading ? (
                  <LoadingSpinner text="Carregando anúncios pendentes..." />
                ) : (
                  <>
                    {pendingAds && pendingAds.length > 0 ? (
                      <div className="pokemon-carousel-container">
                        <div className="view-controls">
                          <div className="view-mode-buttons">
                            <button
                                className={`view-btn ${pendingAdsViewMode === 'card' ? 'active' : ''}`}
                                onClick={() => {
                                  console.log('Switching to card view for pending ads');
                                  setPendingAdsViewMode('card');
                                }}
                                title="Vista de Cartas Pokemon"
                            >
                                <FontAwesomeIcon icon={faSquare} />
                                <span>Cards</span>
                            </button>
                            <button
                                className={`view-btn ${pendingAdsViewMode === 'list' ? 'active' : ''}`}
                                onClick={() => {
                                  console.log('Switching to list view for pending ads');
                                  setPendingAdsViewMode('list');
                                }}
                                title="Vista de Lista"
                            >
                                <FontAwesomeIcon icon={faList} />
                                <span>Lista</span>
                            </button>
                          </div>
                          <div className="carousel-info">
                            {pendingAdsViewMode === 'card' && (
                              <span>{currentPendingAdIndex + 1} de {pendingAds.length}</span>
                            )}
                          </div>
                        </div>
                        
                        {pendingAdsViewMode === 'card' ? (
                        <div className="pokemon-carousel" ref={pendingAdCarouselRef}>
                          {/* Navigation buttons */}
                          <button 
                            className="carousel-nav carousel-nav--prev"
                            onClick={prevPendingAd}
                            disabled={pendingAds.length <= 1}
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </button>
                          
                          <button 
                            className="carousel-nav carousel-nav--next"
                            onClick={nextPendingAd}
                            disabled={pendingAds.length <= 1}
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </button>

                          {/* Pokemon Cards for Pending Ads */}
                          <div className="cards-container">
                            {pendingAds.map((ad, index) => (
                              <div
                                key={ad.id || `pending-ad-${index}`}
                                ref={el => pendingAdCardRefs.current[index] = el}
                                className="pokemon-card pending"
                                style={{
                                  position: 'absolute',
                                  width: '400px',
                                  height: '550px'
                                }}
                              >
                                <div className="pokemon-card-inner">
                                  <div className="pokemon-card-header">
                                    <div className="card-type">Anúncio Pendente</div>
                                    <div className="card-status pending">
                                      Aguardando Aprovação
                                    </div>
                                  </div>
                                  
                                  <div className="pokemon-card-image">
                                    <div className="placeholder-image">
                                      <FontAwesomeIcon icon={faAd} size="3x" />
                                    </div>
                                  </div>
                                  
                                  <div className="pokemon-card-content">
                                    <h3 className="pokemon-card-title">{ad.title}</h3>
                                    <p className="pokemon-card-excerpt">{truncateContent(ad.description, 100)}</p>
                                    
                                    <div className="pokemon-card-meta">
                                      <div className="meta-item">
                                        <span className="meta-label">Autor:</span>
                                        <span className="meta-value">{ad.authorNickname}</span>
                                      </div>
                                      <div className="meta-item">
                                        <span className="meta-label">Categoria:</span>
                                        <span className="meta-value">{ad.category}</span>
                                      </div>
                                      <div className="meta-item">
                                        <span className="meta-label">Preço:</span>
                                        <span className="meta-value">{ad.price}</span>
                                      </div>
                                      <div className="meta-item">
                                        <span className="meta-label">Enviado:</span>
                                        <span className="meta-value">{formatDate(ad.createdAt)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="pokemon-card-actions">
                                    <button
                                      onClick={() => handleAdApproval(ad.id, true)}
                                      className="pokemon-action-btn pokemon-action-btn--publish"
                                      disabled={processingIds.has(ad.id)}
                                    >
                                      <FontAwesomeIcon icon={faCheckCircle} />
                                      {processingIds.has(ad.id) ? 'Processando...' : 'Aprovar'}
                                    </button>
                                    
                                    <button
                                      onClick={() => handleAdApproval(ad.id, false)}
                                      className="pokemon-action-btn pokemon-action-btn--delete"
                                      disabled={processingIds.has(ad.id)}
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                      {processingIds.has(ad.id) ? 'Processando...' : 'Rejeitar'}
                                    </button>
                                    
                                    <button
                                      onClick={() => handleViewAdDetails(ad)}
                                      className="pokemon-action-btn pokemon-action-btn--edit"
                                    >
                                      <FontAwesomeIcon icon={faEye} />
                                      Ver Detalhes
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Dots indicator for pending ads */}
                          <div className="carousel-dots">
                            {pendingAds.map((_, index) => (
                              <button
                                key={index}
                                className={`carousel-dot ${index === currentPendingAdIndex ? 'active' : ''}`}
                                onClick={() => {
                                  const currentCard = pendingAdCardRefs.current[currentPendingAdIndex];
                                  const targetCard = pendingAdCardRefs.current[index];
                                  
                                  if (currentCard && targetCard && index !== currentPendingAdIndex) {
                                    // Animate current card out
                                    anime({
                                      targets: currentCard,
                                      opacity: [1, 0],
                                      scale: [1, 0.7],
                                      rotateY: [0, index > currentPendingAdIndex ? 90 : -90],
                                      duration: 300,
                                      easing: 'easeInBack'
                                    });
                                    
                                    // Animate target card in
                                    anime({
                                      targets: targetCard,
                                      translateX: [index > currentPendingAdIndex ? 600 : -600, 0],
                                      rotateY: [index > currentPendingAdIndex ? 90 : -90, 0],
                                      opacity: [0, 1],
                                      scale: [0.7, 1],
                                      duration: 500,
                                      delay: 150,
                                      easing: 'easeOutExpo'
                                    });
                                    
                                    setCurrentPendingAdIndex(index);
                                  }
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        ) : (
                          <div className="list-view-container">
                            <div className="ads-list-grid">
                              {pendingAds.map((ad) => (
                                <div key={ad.id} className="ads-list-item pending">
                                  <div className="ads-list-content">
                                    <div className="ads-list-header">
                                      <h3 className="ads-list-title">{ad.title}</h3>
                                      <span className="ads-list-status pending">Pendente</span>
                                    </div>
                                    <p className="ads-list-excerpt">{ad.description.substring(0, 150)}...</p>
                                    <div className="ads-list-meta">
                                      <span className="ads-list-category">{ad.category}</span>
                                      <span className="ads-list-price">€{ad.price}</span>
                                      <span className="ads-list-date">
                                        {new Date(ad.createdAt).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ads-list-actions">
                                    <button
                                      onClick={() => handleApproveAd(ad.id)}
                                      className="list-action-btn list-action-btn--publish"
                                      disabled={processingIds.has(ad.id)}
                                      title="Aprovar Anúncio"
                                    >
                                      <FontAwesomeIcon icon={faCheckCircle} />
                                    </button>
                                    <button
                                      onClick={() => handleRejectAd(ad.id)}
                                      className="list-action-btn list-action-btn--delete"
                                      disabled={processingIds.has(ad.id)}
                                      title="Rejeitar Anúncio"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    <button
                                      onClick={() => handleViewAdDetails(ad)}
                                      className="list-action-btn list-action-btn--edit"
                                      title="Ver Detalhes"
                                    >
                                      <FontAwesomeIcon icon={faEye} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-pending-content">
                        <p>Nenhum anúncio pendente de aprovação.</p>
                      </div>
                    )}
                  </>
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
