import React, { useState, useEffect, useCallback } from 'react';
import { NewsService } from '../../services/newsService';
import { NewsPost } from '../../types/news';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.scss';

interface AdminDashboardProps {}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [pendingNews, setPendingNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const loadPendingNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const news = await NewsService.getPendingNews();
      setPendingNews(news);
    } catch (err) {
      console.error('Error loading pending news:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pending news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadPendingNews();
    }
  }, [user, loadPendingNews]);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You must be an administrator to access this page.</p>
        </div>
      </div>
    );
  }

  const handleApproval = async (newsId: string, approved: boolean) => {
    try {
      setProcessingIds(prev => new Set(prev).add(newsId));
      
      await NewsService.approveNews(newsId, approved);
      
      // Remove the processed item from the list
      setPendingNews(prev => prev.filter(news => news.id !== newsId));
      
      // Show success message
      console.log(`News post ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error processing approval:', err);
      setError(err instanceof Error ? err.message : 'Failed to process approval');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(newsId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading pending news...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage pending news posts</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadPendingNews} className="retry-button">
            Retry
          </button>
        </div>
      )}

      <div className="pending-section">
        <h2>Pending News Posts ({pendingNews.length})</h2>
        
        {pendingNews.length === 0 ? (
          <div className="no-pending">
            <p>No pending news posts to review.</p>
            <button onClick={loadPendingNews} className="refresh-button">
              Refresh
            </button>
          </div>
        ) : (
          <div className="pending-list">
            {pendingNews.map((news) => (
              <div key={news.id} className="pending-item">
                <div className="pending-content">
                  <div className="pending-header">
                    <h3>{news.title}</h3>
                    <span className="pending-date">
                      Submitted: {formatDate(news.createdAt)}
                    </span>
                  </div>
                  
                  <div className="pending-excerpt">
                    <p>{news.excerpt}</p>
                  </div>
                  
                  <div className="pending-body">
                    <p>{truncateContent(news.content)}</p>
                  </div>
                  
                  {news.imageUrl && (
                    <div className="pending-image">
                      <img src={news.imageUrl} alt={news.title} />
                    </div>
                  )}
                  
                  <div className="pending-meta">
                    <span className="author">Author ID: {news.authorId}</span>
                    <span className="status">
                      Status: {news.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                <div className="pending-actions">
                  <button
                    onClick={() => handleApproval(news.id, true)}
                    disabled={processingIds.has(news.id)}
                    className="approve-button"
                  >
                    {processingIds.has(news.id) ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleApproval(news.id, false)}
                    disabled={processingIds.has(news.id)}
                    className="reject-button"
                  >
                    {processingIds.has(news.id) ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
