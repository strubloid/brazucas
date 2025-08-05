import React, { useState, useRef, useEffect, useMemo } from 'react';
import anime from 'animejs';
import ScrollReveal from 'scrollreveal';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { NewsService } from '../services/newsService';
import { AdService } from '../services/adService';
import { StatisticsService, DashboardStatistics } from '../services/statisticsService';
import { NewsPost, CreateNewsRequest, UpdateNewsRequest } from '../types/news';
import { Advertisement, CreateAdvertisementRequest, UpdateAdvertisementRequest } from '../types/ads';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ViewModeControls, { ViewMode } from '../components/common/ViewModeControls';
import CardView from '../components/common/CardView';
import ThreeXView from '../components/common/ThreeXView';
import ListView from '../components/common/ListView';
import { NewsCard } from '../components/common/NewsCard';
import { AdCard } from '../components/common/AdCard';
import { StatusFilter } from '../components/common/StatusFilter';
import { EnhancedStatusFilter } from '../components/common/EnhancedStatusFilter';
import { StatusManager, NewsStatus, AdStatus } from '../types/status';
import { StatusSystemContext } from '../types/statusSystem';
import { UserRole } from '../types/auth';
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
  faSpinner,
  faChartBar,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.scss';
import './PokemonCarousel.scss';
import '../components/common/CardView.scss';
import '../components/common/ThreeXView.scss';
import '../components/common/ListView.scss';

const Dashboard: React.FC = () => {
  const dashboardRef = useAnimateOnMount('fadeIn');
  const { user } = useAuth();  
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'create' | 'ads' | 'create-ad' | 'approve-posts' | 'approve-ads'>('overview');
  const [previousTab, setPreviousTab] = useState<'overview' | 'news' | 'create' | 'ads' | 'create-ad' | 'approve-posts' | 'approve-ads'>('overview');
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
  
  // Status filtering states - Initialize with default statuses to prevent empty state
  const [selectedNewsStatuses, setSelectedNewsStatuses] = useState<string[]>(['draft', 'pending_approval', 'published', 'rejected']);
  const [selectedAdStatuses, setSelectedAdStatuses] = useState<string[]>(['draft', 'pending_approval', 'approved', 'published', 'rejected', 'expired']);

  // Initialize status filters after component mounts
  useEffect(() => {
    try {
      setSelectedNewsStatuses(StatusManager.getNewsStatuses());
      setSelectedAdStatuses(StatusManager.getAdStatuses());
    } catch (error) {
      console.error('Error initializing status filters:', error);
      // Fallback to empty arrays if StatusManager fails
      setSelectedNewsStatuses([]);
      setSelectedAdStatuses([]);
    }
  }, []);

  // Initialize ScrollReveal animations
  useEffect(() => {
    const sr = ScrollReveal({
      reset: true, // Changed back to true for the alternating effect
      distance: '80px',
      duration: 800,
      delay: 100,
      easing: 'cubic-bezier(0.5, 0, 0, 1)',
    }) as any; // Type assertion to bypass any remaining type conflicts

    // Animate the stats table container
    sr.reveal('.stats-table-container, .user-stats-container', {
      origin: 'top',
      duration: 1000,
      delay: 200,
      scale: 0.9,
      reset: false, // Keep stats visible once shown
    });

    // Animate table rows sequentially
    sr.reveal('.stats-table tbody tr', {
      origin: 'left',
      duration: 600,
      delay: 100,
      interval: 150,
      reset: false, // Keep table rows visible
    });

    // Animate admin extra stats cards
    sr.reveal('.admin-extra-stats .stat-card', {
      origin: 'bottom',
      duration: 800,
      delay: 300,
      interval: 200,
      scale: 0.8,
      reset: false, // Keep stats cards visible
    });

    // Animate approval cards
    sr.reveal('.approval-card', {
      origin: 'bottom',
      duration: 600,
      delay: 100,
      interval: 100,
      reset: false,
    });

    // Animate news cards
    sr.reveal('.dashboard__news-item', {
      origin: 'right',
      duration: 700,
      delay: 150,
      interval: 120,
      reset: false,
    });

    // Animate CardView items (Pokemon cards and ad cards)
    sr.reveal('.pokemon-card, .pokemon-card-3x', {
      origin: 'bottom',
      duration: 800,
      delay: 200,
      scale: 0.85,
      interval: 100,
      reset: false, // Keep cards visible once shown
    });

    // Animate ThreeXView items with staggered effect
    sr.reveal('.pokemon-card-3x', {
      origin: 'left',
      duration: 700,
      delay: 100,
      interval: 150,
      distance: '80px',
      reset: false, // Keep 3x view cards visible
    });

    // Enhanced ListView items with alternating left/right reveal - Now handled by ListView component
    // ListView component will handle its own ScrollReveal animations for better control

    // Animate ViewModeControls
    sr.reveal('.view-mode-controls', {
      origin: 'top',
      duration: 600,
      delay: 150,
      reset: false,
    });

    // Animate status filters
    sr.reveal('.dashboard-status-filter', {
      origin: 'top',
      duration: 600,
      delay: 100,
      reset: false,
    });

    // Animate pokemon-carousel-container
    sr.reveal('.pokemon-carousel-container', {
      origin: 'bottom',
      duration: 800,
      delay: 200,
      reset: false,
    });

    // Animate empty state messages
    sr.reveal('.dashboard__empty, .no-pending-posts, .no-pending-content', {
      origin: 'bottom',
      duration: 600,
      delay: 200,
      scale: 0.9,
      reset: false,
    });

    return () => {
      sr.destroy();
    };
  }, [activeTab]);
  
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
  const [newsViewMode, setNewsViewMode] = useState<ViewMode>('card');
  const [adsViewMode, setAdsViewMode] = useState<ViewMode>('card');
  const [pendingPostsViewMode, setPendingPostsViewMode] = useState<ViewMode>('card');
  const [pendingAdsViewMode, setPendingAdsViewMode] = useState<ViewMode>('card');
  
  // 3x view pagination state
  const [currentPage3x, setCurrentPage3x] = useState<number>(0);
  const [currentAdsPage3x, setCurrentAdsPage3x] = useState<number>(0);
  const [currentPendingPostsPage3x, setCurrentPendingPostsPage3x] = useState<number>(0);
  const [currentPendingAdsPage3x, setCurrentPendingAdsPage3x] = useState<number>(0);

  // Statistics state
  const [statistics, setStatistics] = useState<DashboardStatistics>({
    totalUsers: 0,
    totalNews: 0,
    publishedNews: 0,
    draftNews: 0,
    totalAds: 0,
    publishedAds: 0,
    draftAds: 0,
    pendingPosts: 0,
    pendingAds: 0
  });

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
    () => user?.role === UserRole.ADMIN ? NewsService.getPendingNews() : Promise.resolve([]),
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
    () => user?.role === UserRole.ADMIN ? AdService.getPendingAds() : Promise.resolve([]),
    [user?.role]
  );

  // Filter data based on selected statuses
  const filteredNews = React.useMemo(() => {
    if (!news || !Array.isArray(news)) return [];
    
    // If no statuses selected, don't show any items
    if (selectedNewsStatuses.length === 0) {
      console.log('Dashboard: No news statuses selected, showing no news');
      return [];
    }
    
    try {
      return news.filter(newsPost => {
        // Safety check - ensure newsPost exists and has required properties
        if (!newsPost || typeof newsPost !== 'object') {
          console.warn('Invalid news post in filter:', newsPost);
          return false;
        }
        
        const status = StatusManager.getNewsStatus({
          published: newsPost.published || false,
          approved: newsPost.approved
        });
        return selectedNewsStatuses.includes(status);
      });
    } catch (error) {
      console.error('Error filtering news:', error);
      return [];
    }
  }, [news, selectedNewsStatuses]);

  const filteredAds = React.useMemo(() => {
    if (!ads || !Array.isArray(ads) || selectedAdStatuses.length === 0) return [];
    
    try {
      return ads.filter(ad => {
        // Safety check - ensure ad exists and has required properties
        if (!ad || typeof ad !== 'object') {
          console.warn('Invalid ad in filter:', ad);
          return false;
        }
        
        const status = StatusManager.getAdStatus({
          published: ad.published || false,
          approved: ad.approved
        });
        return selectedAdStatuses.includes(status);
      });
    } catch (error) {
      return [];
    }
  }, [ads, selectedAdStatuses]);

  // State for statistics loading
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  
  // Debounce mechanism - Track last refresh time to prevent rapid clicks
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  
  // Stats debug state to verify updates
  const [statsUpdated, setStatsUpdated] = useState<number>(0);

  // Fetch statistics for admin dashboard
  const fetchStatistics = React.useCallback(async () => {
    if (user?.role === UserRole.ADMIN) {
      try {
        console.log('Fetching fresh statistics...');
        const stats = await StatisticsService.getDashboardStatistics();
        
        console.log('Statistics received:', stats);
        
        if (stats && typeof stats === 'object') {
          // Force a rerender by creating a new object with a timestamp
          setStatistics({
            ...stats,
            // This ensures the object is different from the previous one
            _updatedAt: Date.now() 
          });
          
          // Update stats counter to verify refresh
          setStatsUpdated(prev => prev + 1);
          
          return stats;
        } else {
          console.error('Invalid statistics format received:', stats);
          return null;
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Keep default statistics (all zeros)
        return null;
      }
    }
    return null;
  }, [user?.role]);
  
  // Reference to track if a refresh is in progress
  const isRefreshingRef = React.useRef(false);
  
  // Function to refresh all data with debouncing
  const refreshAllData = React.useCallback(async () => {
    console.log('Refresh clicked. Current state:', { 
      isRefreshing: isRefreshingRef.current, 
      loadingStats: loadingStats 
    });
    
    // Strong protection against concurrent refreshes
    if (isRefreshingRef.current || loadingStats) {
      console.log('Refresh already in progress, ignoring click');
      return;
    }
    
    // Set the refreshing flag immediately to prevent any race conditions
    isRefreshingRef.current = true;
    
    // Prevent multiple rapid clicks (debouncing)
    const now = Date.now();
    if (now - lastRefreshTime < 3000) { // 3 second cooldown
      console.log('Refresh too soon, ignoring click');
      isRefreshingRef.current = false; // Reset flag if we're not proceeding
      return;
    }
    
    // Update last refresh time
    setLastRefreshTime(now);
    
    if (user?.role === UserRole.ADMIN) {
      try {
        // Set loading state once
        setLoadingStats(true);
        console.log('Starting refresh process...');
        
        // First get statistics to ensure it's fresh
        console.log('Fetching statistics...');
        const newStats = await StatisticsService.getDashboardStatistics();
        console.log('Statistics received in refreshAllData:', newStats);
        
        // Only update if we have valid stats
        if (newStats && typeof newStats === 'object') {
          console.log('Updating statistics state with new data');
          // No need to call setStatistics twice, the fetchStatistics already does it
        }
        
        // Then refresh other data in parallel
        console.log('Refreshing other data sources...');
        await Promise.all([
          refetch(),
          refetchPending(),
          refetchAds(),
          refetchPendingAds()
        ]);
        
        console.log('All data refreshed successfully');
        
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        console.log('Refresh process complete, resetting state');
        setLoadingStats(false);
        // Reset the refreshing flag after operation completes
        isRefreshingRef.current = false;
      }
    } else {
      // Make sure to reset the flag even if not an admin
      isRefreshingRef.current = false;
    }
  }, [user?.role, loadingStats, lastRefreshTime, fetchStatistics, refetch, refetchPending, refetchAds, refetchPendingAds]);
  
  // Reference to track if initial fetch has run
  const hasInitialFetchRunRef = React.useRef(false);
  
  // Fetch statistics on component mount, but only once
  React.useEffect(() => {
    if (user?.role === UserRole.ADMIN && !loadingStats && !hasInitialFetchRunRef.current) {
      console.log('Initial statistics fetch on component mount');
      hasInitialFetchRunRef.current = true;
      setLoadingStats(true);
      fetchStatistics().finally(() => {
        setLoadingStats(false);
      });
    }
  }, [user?.role, loadingStats, fetchStatistics]);

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

  const handleCancelNews = (): void => {
    resetForm();
    setActiveTab(previousTab);
  };

  const handleCancelAd = (): void => {
    resetAdForm();
    setActiveTab(previousTab);
  };

  const handleTabChange = (newTab: typeof activeTab): void => {
    setPreviousTab(activeTab);
    setActiveTab(newTab);
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
    setPreviousTab(activeTab);
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
    setPreviousTab(activeTab);
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
      return { text: 'Aguardando Aprovação', class: 'pending' };
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
      return { text: 'Aguardando Aprovação', class: 'pending' };
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
      const action = post.approved ? 'Publicado' : 'Rejeitado';
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
      const action = ad.approved ? 'Publicado' : 'Rejeitado';
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
    const nextIndex = (currentCardIndex + 1) % news.length;
    setCurrentCardIndex(nextIndex);
  };

  const prevCard = () => {
    if (!news || news.length === 0) return;
    const prevIndex = (currentCardIndex - 1 + news.length) % news.length;
    setCurrentCardIndex(prevIndex);
  };

  // Carousel functions for Ads Pokemon card effect
  const nextAdCard = () => {
    if (!ads || ads.length === 0) return;
    const nextIndex = (currentAdCardIndex + 1) % ads.length;
    setCurrentAdCardIndex(nextIndex);
  };

  const prevAdCard = () => {
    if (!ads || ads.length === 0) return;
    const prevIndex = (currentAdCardIndex - 1 + ads.length) % ads.length;
    setCurrentAdCardIndex(prevIndex);
  };

  // Carousel functions for Pending Posts approval
  const nextPendingPost = () => {
    if (!pendingNews || pendingNews.length === 0) return;
    const nextIndex = (currentPendingPostIndex + 1) % pendingNews.length;
    setCurrentPendingPostIndex(nextIndex);
  };

  const prevPendingPost = () => {
    if (!pendingNews || pendingNews.length === 0) return;
    const prevIndex = (currentPendingPostIndex - 1 + pendingNews.length) % pendingNews.length;
    setCurrentPendingPostIndex(prevIndex);
  };

  // Carousel functions for Pending Ads approval
  const nextPendingAd = () => {
    if (!pendingAds || pendingAds.length === 0) return;
    const nextIndex = (currentPendingAdIndex + 1) % pendingAds.length;
    setCurrentPendingAdIndex(nextIndex);
  };

  const prevPendingAd = () => {
    if (!pendingAds || pendingAds.length === 0) return;
    const prevIndex = (currentPendingAdIndex - 1 + pendingAds.length) % pendingAds.length;
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
              onClick={() => handleTabChange('overview')}
            >
              <FontAwesomeIcon icon={faHome} className="nav-icon" />
              <span>Visão Geral</span>
            </button>
            
            <button
              className={`nav-item ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => handleTabChange('news')}
            >
              <FontAwesomeIcon icon={faNewspaper} className="nav-icon" />
              <span>Notícias</span>
            </button>
            
            <button
              className={`nav-item ${activeTab === 'create' ? 'active' : ''} ${editingNews ? 'edit-mode' : ''}`}
              onClick={() => {
                handleTabChange('create');
                if (!editingNews) resetForm();
              }}
              style={editingNews ? { backgroundColor: '#f5e88a', color: '#8b6f1a' } : {}}
            >
              <FontAwesomeIcon icon={editingNews ? faEdit : faPlus} className="nav-icon" />
              <span>{editingNews ? 'Editar Notícia' : 'Nova Notícia'}</span>
            </button>

            {/* Anunciante Section - Only for advertisers and admins */}
            {(user?.role === UserRole.ADVERTISER || user?.role === UserRole.ADMIN) && (
              <>
                <div className="nav-divider">
                  <span>Anunciante</span>
                </div>

                <button
                  className={`nav-item ${activeTab === 'ads' ? 'active' : ''}`}
                  onClick={() => handleTabChange('ads')}
                >
                  <FontAwesomeIcon icon={faAd} className="nav-icon" />
                  <span>Anúncios</span>
                </button>

                <button
                  className={`nav-item ${activeTab === 'create-ad' ? 'active' : ''} ${editingAd ? 'edit-mode' : ''}`}
                  onClick={() => {
                    handleTabChange('create-ad');
                    if (!editingAd) resetAdForm();
                  }}
                  style={editingAd ? { backgroundColor: '#f5e88a', color: '#8b6f1a' } : {}}
                >
                  <FontAwesomeIcon icon={editingAd ? faEdit : faPlus} className="nav-icon" />
                  <span>{editingAd ? 'Editar Anúncio' : 'Novo Anúncio'}</span>
                </button>
              </>
            )}

            {user?.role === UserRole.ADMIN && (
              <>
                <div className="nav-divider">
                  <span>Aprovações</span>
                </div>
                
                <button
                  className={`nav-item ${activeTab === 'approve-posts' ? 'active' : ''}`}
                  onClick={() => handleTabChange('approve-posts')}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="nav-icon" />
                  <span>Aprovar Posts</span>
                  {pendingNews && pendingNews.length > 0 && (
                    <span className="badge">{pendingNews.length}</span>
                  )}
                </button>
                
                <button
                  className={`nav-item ${activeTab === 'approve-ads' ? 'active' : ''}`}
                  onClick={() => handleTabChange('approve-ads')}
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
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px' 
              }}>
                <div>
                  {user?.role === UserRole.ADMIN && (
                    <>
                      <h2>Dashboard Administrativo</h2>
                      <small style={{ 
                        color: '#7f8c8d', 
                        fontSize: '12px',
                        marginTop: '5px',
                        display: 'block'
                      }}>
                        Stats atualizado: {statsUpdated} vezes | Última atualização: {lastRefreshTime ? new Date(lastRefreshTime).toLocaleTimeString() : 'Nunca'}
                      </small>
                    </>
                  )}
                </div>
                {user?.role === UserRole.ADMIN && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault(); // Prevent any default actions
                      if (!loadingStats && !isRefreshingRef.current) {
                        refreshAllData();
                      }
                    }}
                    disabled={loadingStats}
                    style={{
                      background: loadingStats ? '#95a5a6' : '#2ecc71',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: loadingStats ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FontAwesomeIcon icon={loadingStats ? faSpinner : faNewspaper} spin={loadingStats} />
                    {loadingStats ? 'Atualizando dados...' : 'Atualizar Dashboard'}
                  </button>
                )}
              </div>
              <div className="overview-grid">
                {user?.role === UserRole.ADMIN ? (
                  // Admin Dashboard with comprehensive stats table
                  <div className="stats-table-container">
                    <table className="stats-table">
                      <thead className="stats-header">
                        <tr className="stats-row">
                          <th className="stats-cell header-cell"></th>
                          <th className="stats-cell header-cell">
                            <FontAwesomeIcon icon={faNewspaper} />
                            <span>Notícias</span>
                          </th>
                          <th className="stats-cell header-cell">
                            <FontAwesomeIcon icon={faAd} />
                            <span>Anúncios</span>
                          </th>
                          <th className="stats-cell header-cell">
                            <FontAwesomeIcon icon={faChartBar} />
                            <span>Total</span>
                          </th>
                        </tr>
                      </thead>
                      
                      <tbody>
                        <tr className="stats-row">
                          <td className="stats-cell row-label">
                            <FontAwesomeIcon icon={faFileAlt} />
                            <span>Total</span>
                          </td>
                          <td className="stats-cell stat-number">
                            {statistics.totalNews !== undefined ? statistics.totalNews : 0}
                          </td>
                          <td className="stats-cell stat-number">
                            {statistics.totalAds !== undefined ? statistics.totalAds : 0}
                          </td>
                          <td className="stats-cell stat-number total">
                            {(statistics.totalNews || 0) + (statistics.totalAds || 0)}
                          </td>
                        </tr>
                        
                        <tr className="stats-row">
                          <td className="stats-cell row-label">
                            <FontAwesomeIcon icon={faClock} />
                            <span>Rascunhos</span>
                          </td>
                          <td className="stats-cell stat-number draft">
                            {statistics.draftNews !== undefined ? statistics.draftNews : 0}
                          </td>
                          <td className="stats-cell stat-number draft">
                            {statistics.draftAds !== undefined ? statistics.draftAds : 0}
                          </td>
                          <td className="stats-cell stat-number total">
                            {(statistics.draftNews || 0) + (statistics.draftAds || 0)}
                          </td>
                        </tr>
                        
                        <tr className="stats-row">
                          <td className="stats-cell row-label">
                            <FontAwesomeIcon icon={faEye} />
                            <span>Publicados</span>
                          </td>
                          <td className="stats-cell stat-number published">
                            {statistics.publishedNews !== undefined ? statistics.publishedNews : 0}
                          </td>
                          <td className="stats-cell stat-number published">
                            {statistics.publishedAds !== undefined ? statistics.publishedAds : 0}
                          </td>
                          <td className="stats-cell stat-number total">
                            {(statistics.publishedNews || 0) + (statistics.publishedAds || 0)}
                          </td>
                        </tr>
                        
                        <tr className="stats-row">
                          <td className="stats-cell row-label">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            <span>Pendentes</span>
                          </td>
                          <td className="stats-cell stat-number pending">
                            {statistics.pendingPosts !== undefined ? statistics.pendingPosts : 0}
                          </td>
                          <td className="stats-cell stat-number pending">
                            {statistics.pendingAds !== undefined ? statistics.pendingAds : 0}
                          </td>
                          <td className="stats-cell stat-number total">
                            {(statistics.pendingPosts || 0) + (statistics.pendingAds || 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    
                    {/* Additional admin stats */}
                    <div className="admin-extra-stats">
                      <div className="stat-card">
                        <div className="stat-icon users">
                          <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div className="stat-content">
                          <h3 className="stat-number">
                            {statistics.totalUsers !== undefined ? statistics.totalUsers : 0}
                          </h3>
                          <p className="stat-label">Usuários Registrados</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Regular user dashboard - show only their content
                  <div className="user-stats-container">
                    {user && [UserRole.ADVERTISER, UserRole.ADMIN].includes(user.role) ? (
                      // Advertiser/Admin user can see both news and ads
                      <table className="stats-table">
                        <thead className="stats-header">
                          <tr className="stats-row">
                            <th className="stats-cell header-cell"></th>
                            <th className="stats-cell header-cell">
                              <FontAwesomeIcon icon={faNewspaper} />
                              <span>Notícias</span>
                            </th>
                            <th className="stats-cell header-cell">
                              <FontAwesomeIcon icon={faAd} />
                              <span>Anúncios</span>
                            </th>
                            <th className="stats-cell header-cell">
                              <FontAwesomeIcon icon={faChartBar} />
                              <span>Total</span>
                            </th>
                          </tr>
                        </thead>
                        
                        <tbody>
                          <tr className="stats-row">
                            <td className="stats-cell row-label">
                              <FontAwesomeIcon icon={faFileAlt} />
                              <span>Total</span>
                            </td>
                            <td className="stats-cell stat-number">
                              {news?.length || 0}
                            </td>
                            <td className="stats-cell stat-number">
                              {ads?.length || 0}
                            </td>
                            <td className="stats-cell stat-number total">
                              {(news?.length || 0) + (ads?.length || 0)}
                            </td>
                          </tr>
                          
                          <tr className="stats-row">
                            <td className="stats-cell row-label">
                              <FontAwesomeIcon icon={faClock} />
                              <span>Rascunhos</span>
                            </td>
                            <td className="stats-cell stat-number draft">
                              {news?.filter(n => !n.published || n.approved !== true).length || 0}
                            </td>
                            <td className="stats-cell stat-number draft">
                              {ads?.filter(a => !a.published || a.approved !== true).length || 0}
                            </td>
                            <td className="stats-cell stat-number total">
                              {(news?.filter(n => !n.published || n.approved !== true).length || 0) + 
                               (ads?.filter(a => !a.published || a.approved !== true).length || 0)}
                            </td>
                          </tr>
                          
                          <tr className="stats-row">
                            <td className="stats-cell row-label">
                              <FontAwesomeIcon icon={faEye} />
                              <span>Publicados</span>
                            </td>
                            <td className="stats-cell stat-number published">
                              {news?.filter(n => n.published && n.approved === true).length || 0}
                            </td>
                            <td className="stats-cell stat-number published">
                              {ads?.filter(a => a.published && a.approved === true).length || 0}
                            </td>
                            <td className="stats-cell stat-number total">
                              {(news?.filter(n => n.published && n.approved === true).length || 0) + 
                               (ads?.filter(a => a.published && a.approved === true).length || 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      // Regular user can only see news
                      <table className="stats-table single-content">
                        <thead className="stats-header">
                          <tr className="stats-row">
                            <th className="stats-cell header-cell"></th>
                            <th className="stats-cell header-cell">
                              <FontAwesomeIcon icon={faNewspaper} />
                              <span>Notícias</span>
                            </th>
                          </tr>
                        </thead>
                        
                        <tbody>
                          <tr className="stats-row">
                            <td className="stats-cell row-label">
                              <FontAwesomeIcon icon={faFileAlt} />
                              <span>Total</span>
                            </td>
                            <td className="stats-cell stat-number">
                              {news?.length || 0}
                            </td>
                          </tr>
                          
                          <tr className="stats-row">
                            <td className="stats-cell row-label">
                              <FontAwesomeIcon icon={faClock} />
                              <span>Rascunhos</span>
                            </td>
                            <td className="stats-cell stat-number draft">
                              {news?.filter(n => !n.published || n.approved !== true).length || 0}
                            </td>
                          </tr>
                          
                          <tr className="stats-row">
                            <td className="stats-cell row-label">
                              <FontAwesomeIcon icon={faEye} />
                              <span>Publicados</span>
                            </td>
                            <td className="stats-cell stat-number published">
                              {news?.filter(n => n.published && n.approved === true).length || 0}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
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
                    <EnhancedStatusFilter
                      context={{
                        contentType: 'news',
                        context: 'management',
                        userId: user?.id ? parseInt(user.id) : undefined,
                        userRole: user?.role === UserRole.ADMIN ? 'admin' : 'user'
                      }}
                      onSelectionChange={setSelectedNewsStatuses}
                      className="dashboard-status-filter"
                      options={{
                        initialStatuses: selectedNewsStatuses,
                        persistSelection: true,
                        storageKey: 'dashboard-news-status-filter'
                      }}
                    />
                    {filteredNews && filteredNews.length > 0 ? (
                      <div className="pokemon-carousel-container">
                        <ViewModeControls
                          viewMode={newsViewMode}
                          onViewModeChange={setNewsViewMode}
                          totalItems={filteredNews.length}
                          currentPage={newsViewMode === 'list' ? undefined : newsViewMode === 'card' ? 
                            Math.min(currentCardIndex + 1, filteredNews.length) : 
                            Math.min(currentPage3x + 1, Math.ceil(filteredNews.length / 3))}
                          totalPages={newsViewMode === 'list' ? undefined : newsViewMode === 'card' ? 
                            filteredNews.length > 0 ? filteredNews.length : 1 : 
                            Math.max(1, Math.ceil(filteredNews.length / 3))}
                        />
                        
                        {newsViewMode === 'card' ? (
                          <CardView
                            items={filteredNews}
                            currentIndex={currentCardIndex}
                            onPrevious={prevCard}
                            onNext={nextCard}
                            cardsPerPage={1}
                            onDotClick={(index) => {
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
                            renderCard={(newsPost, index) => (
                              <NewsCard
                                post={newsPost}
                                index={index}
                                cardRef={el => cardRefs.current[index] = el}
                                onEdit={handleEditNews}
                                onDelete={(post) => handleDeleteNews(post.id)}
                                onPublish={(post) => handlePublishNews(post.id)}
                                viewType="card"
                              />
                            )}
                            containerRef={carouselRef}
                            cardRefs={cardRefs}
                          />
                        ) : newsViewMode === '3x' ? (
                          <ThreeXView
                            items={filteredNews}
                            currentPage={currentPage3x}
                            onPageChange={setCurrentPage3x}
                            renderCard={(newsPost, index) => (
                              <NewsCard
                                post={newsPost}
                                index={index}
                                onEdit={handleEditNews}
                                onDelete={(post) => handleDeleteNews(post.id)}
                                onPublish={(post) => handlePublishNews(post.id)}
                                viewType="3x"
                              />
                            )}
                          />
                        ) : (
                          <ListView
                            items={filteredNews}
                            renderListItem={(newsPost, index) => (
                              <NewsCard
                                post={newsPost}
                                index={index}
                                onEdit={handleEditNews}
                                onDelete={(post) => handleDeleteNews(post.id)}
                                onPublish={(post) => handlePublishNews(post.id)}
                                viewType="list"
                              />
                            )}
                          />
                        )}
                      </div>
                    ) : filteredNews.length === 0 && news && news.length > 0 ? (
                      <div className="dashboard__empty">
                        <p>Nenhuma notícia encontrada com os filtros selecionados.</p>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setSelectedNewsStatuses(StatusManager.getNewsStatuses())}
                        >
                          Limpar Filtros
                        </button>
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
                    <EnhancedStatusFilter
                      context={{
                        contentType: 'ads',
                        context: 'management',
                        userId: user?.id ? parseInt(user.id) : undefined,
                        userRole: user?.role === UserRole.ADMIN ? 'admin' : 'user'
                      }}
                      onSelectionChange={setSelectedAdStatuses}
                      className="dashboard-status-filter"
                      options={{
                        initialStatuses: selectedAdStatuses,
                        persistSelection: true,
                        storageKey: 'dashboard-ads-status-filter'
                      }}
                    />
                    {filteredAds && filteredAds.length > 0 ? (
                      <div className="pokemon-carousel-container">
                        <ViewModeControls
                          viewMode={adsViewMode}
                          onViewModeChange={setAdsViewMode}
                          totalItems={filteredAds.length}
                          currentPage={adsViewMode === 'list' ? undefined : adsViewMode === 'card' ? 
                            Math.min(currentAdCardIndex + 1, filteredAds.length) : 
                            Math.min(currentAdsPage3x + 1, Math.ceil(filteredAds.length / 3))}
                          totalPages={adsViewMode === 'list' ? undefined : adsViewMode === 'card' ? 
                            filteredAds.length > 0 ? filteredAds.length : 1 : 
                            Math.max(1, Math.ceil(filteredAds.length / 3))}
                        />
                        
                        {adsViewMode === 'card' ? (
                          <CardView
                            items={filteredAds}
                            currentIndex={currentAdCardIndex}
                            onPrevious={prevAdCard}
                            onNext={nextAdCard}
                            cardsPerPage={1}
                            onDotClick={(index) => {
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
                            renderCard={(ad, index) => (
                              <AdCard
                                ad={ad}
                                index={index}
                                cardRef={el => adCardRefs.current[index] = el}
                                onEdit={handleEditAd}
                                onDelete={(ad) => handleDeleteAd(ad.id)}
                                onPublish={(ad) => handlePublishAd(ad.id)}
                                viewType="card"
                              />
                            )}
                            containerRef={adCarouselRef}
                            cardRefs={adCardRefs}
                          />
                        ) : adsViewMode === '3x' ? (
                          <ThreeXView
                            items={filteredAds}
                            renderCard={(ad, index) => (
                              <AdCard
                                ad={ad}
                                index={index}
                                onEdit={handleEditAd}
                                onDelete={(ad) => handleDeleteAd(ad.id)}
                                onPublish={(ad) => handlePublishAd(ad.id)}
                                viewType="3x"
                              />
                            )}
                          />
                        ) : (
                          <ListView
                            items={filteredAds}
                            listType="ads"
                            renderListItem={(ad, index) => (
                              <AdCard
                                ad={ad}
                                index={index}
                                onEdit={handleEditAd}
                                onDelete={(ad) => handleDeleteAd(ad.id)}
                                onPublish={(ad) => handlePublishAd(ad.id)}
                                viewType="list"
                              />
                            )}
                          />
                        )}
                      </div>
                    ) : filteredAds.length === 0 && ads && ads.length > 0 ? (
                      <div className="dashboard__empty">
                        <p>Nenhum anúncio encontrado com os filtros selecionados.</p>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setSelectedAdStatuses(StatusManager.getAdStatuses())}
                        >
                          Limpar Filtros
                        </button>
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
                      onClick={handleCancelNews}
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
                      onClick={handleCancelAd}
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
            {activeTab === 'approve-posts' && user?.role === UserRole.ADMIN && (
              <div className="approval-section">
                {pendingLoading ? (
                  <LoadingSpinner text="Carregando posts pendentes..." />
                ) : (
                  <>
                    <EnhancedStatusFilter
                      context={{
                        contentType: 'news',
                        context: 'approval',
                        userId: user?.id ? parseInt(user.id) : undefined,
                        userRole: 'admin'
                      }}
                      className="dashboard-status-filter approval-filter"
                      compact={true}
                      options={{
                        persistSelection: true,
                        storageKey: 'dashboard-approval-news-filter'
                      }}
                    />
                    {pendingNews && pendingNews.length > 0 ? (
                      <div className="pokemon-carousel-container">
                        <ViewModeControls
                          viewMode={pendingPostsViewMode}
                          onViewModeChange={setPendingPostsViewMode}
                          totalItems={pendingNews.length}
                          currentPage={pendingPostsViewMode === 'list' ? undefined : pendingPostsViewMode === 'card' ? 
                            Math.min(currentPendingPostIndex + 1, pendingNews.length) : 
                            Math.min(currentPendingPostsPage3x + 1, Math.ceil(pendingNews.length / 3))}
                          totalPages={pendingPostsViewMode === 'list' ? undefined : pendingPostsViewMode === 'card' ? 
                            pendingNews.length > 0 ? pendingNews.length : 1 : 
                            Math.max(1, Math.ceil(pendingNews.length / 3))}
                        />
                        
                        {pendingPostsViewMode === 'card' ? (
                          <CardView
                            items={pendingNews}
                            currentIndex={currentPendingPostIndex}
                            onPrevious={prevPendingPost}
                            onNext={nextPendingPost}
                            cardsPerPage={1}
                            onDotClick={(index) => {
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
                            renderCard={(post, index) => (
                              <NewsCard
                                post={post}
                                index={index}
                                cardRef={el => pendingPostCardRefs.current[index] = el}
                                onApprove={(post) => handleApproval(post.id, true)}
                                onReject={(post) => handleApproval(post.id, false)}
                                onView={handleViewDetails}
                                viewType="card"
                                isPending={true}
                              />
                            )}
                            containerRef={pendingPostCarouselRef}
                            cardRefs={pendingPostCardRefs}
                          />
                        ) : pendingPostsViewMode === '3x' ? (
                          <ThreeXView
                            items={pendingNews}
                            renderCard={(post, index) => (
                              <NewsCard
                                post={post}
                                index={index}
                                onApprove={(post) => handleApproval(post.id, true)}
                                onReject={(post) => handleApproval(post.id, false)}
                                onView={handleViewDetails}
                                viewType="3x"
                                isPending={true}
                              />
                            )}
                          />
                        ) : (
                          <ListView
                            items={pendingNews}
                            renderListItem={(post, index) => (
                              <NewsCard
                                post={post}
                                index={index}
                                onApprove={(post) => handleApproval(post.id, true)}
                                onReject={(post) => handleApproval(post.id, false)}
                                onView={handleViewDetails}
                                viewType="list"
                                isPending={true}
                              />
                            )}
                          />
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
            {activeTab === 'approve-ads' && user?.role === UserRole.ADMIN && (
              <div className="approval-section">
                {pendingAdsLoading ? (
                  <LoadingSpinner text="Carregando anúncios pendentes..." />
                ) : (
                  <>
                    <EnhancedStatusFilter
                      context={{
                        contentType: 'ads',
                        context: 'approval',
                        userId: user?.id ? parseInt(user.id) : undefined,
                        userRole: 'admin'
                      }}
                      className="dashboard-status-filter approval-filter"
                      compact={true}
                      options={{
                        persistSelection: true,
                        storageKey: 'dashboard-approval-ads-filter'
                      }}
                    />
                    {pendingAds && pendingAds.length > 0 ? (
                      <div className="pokemon-carousel-container">
                        <ViewModeControls
                          viewMode={pendingAdsViewMode}
                          onViewModeChange={setPendingAdsViewMode}
                          totalItems={pendingAds.length}
                          currentPage={pendingAdsViewMode === 'list' ? undefined : pendingAdsViewMode === 'card' ? 
                            Math.min(currentPendingAdIndex + 1, pendingAds.length) : 
                            Math.min(currentPendingAdsPage3x + 1, Math.ceil(pendingAds.length / 3))}
                          totalPages={pendingAdsViewMode === 'list' ? undefined : pendingAdsViewMode === 'card' ? 
                            pendingAds.length > 0 ? pendingAds.length : 1 : 
                            Math.max(1, Math.ceil(pendingAds.length / 3))}
                        />
                        
                        {pendingAdsViewMode === 'card' ? (
                          <CardView
                            items={pendingAds}
                            currentIndex={currentPendingAdIndex}
                            onPrevious={prevPendingAd}
                            onNext={nextPendingAd}
                            cardsPerPage={1}
                            onDotClick={(index) => {
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
                            renderCard={(ad, index) => (
                              <AdCard
                                ad={ad}
                                index={index}
                                cardRef={el => pendingAdCardRefs.current[index] = el}
                                onApprove={(ad) => handleAdApproval(ad.id, true)}
                                onReject={(ad) => handleAdApproval(ad.id, false)}
                                onView={handleViewAdDetails}
                                viewType="card"
                                isPending={true}
                              />
                            )}
                            containerRef={pendingAdCarouselRef}
                            cardRefs={pendingAdCardRefs}
                          />
                        ) : pendingAdsViewMode === '3x' ? (
                          <ThreeXView
                            items={pendingAds}
                            renderCard={(ad, index) => (
                              <AdCard
                                ad={ad}
                                index={index}
                                onApprove={(ad) => handleAdApproval(ad.id, true)}
                                onReject={(ad) => handleAdApproval(ad.id, false)}
                                onView={handleViewAdDetails}
                                viewType="3x"
                                isPending={true}
                              />
                            )}
                          />
                        ) : (
                          <ListView
                            items={pendingAds}
                            listType="ads"
                            renderListItem={(ad, index) => (
                              <AdCard
                                ad={ad}
                                index={index}
                                onApprove={(ad) => handleAdApproval(ad.id, true)}
                                onReject={(ad) => handleAdApproval(ad.id, false)}
                                onView={handleViewAdDetails}
                                viewType="list"
                                isPending={true}
                              />
                            )}
                          />
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
                    <p><strong>{selectedPost.approved ? 'Publicado' : 'Rejeitado'} em:</strong> {formatDate(selectedPost.approvedAt)}</p>
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
