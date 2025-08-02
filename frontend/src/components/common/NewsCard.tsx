import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faEdit, faTrash, faEye, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NewsPost } from '../../types/news';

export interface NewsCardProps {
  post: NewsPost;
  index: number;
  cardRef?: (el: HTMLDivElement | null) => void;
  onEdit?: (post: NewsPost) => void;
  onDelete?: (post: NewsPost) => void;
  onPublish?: (post: NewsPost) => void;
  onView?: (post: NewsPost) => void;
  onApprove?: (post: NewsPost) => void;
  onReject?: (post: NewsPost) => void;
  viewType?: 'card' | '3x' | 'list';
  isPending?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  post,
  index,
  cardRef,
  onEdit,
  onDelete,
  onPublish,
  onView,
  onApprove,
  onReject,
  viewType = 'card',
  isPending = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (viewType === 'list') {
    return (
      <div className={`news-list-item ${post.published ? 'published' : 'draft'} ${isPending ? 'pending' : ''}`}>
        <div className="list-item-header">
          <h3 className="list-item-title">{post.title}</h3>
          <div className="status-badges">
            {isPending ? (
              <>
                <span className="status-badge pending">POST PENDENTE</span>
                <span className="status-badge draft">AGUARDANDO APROVAÇÃO</span>
              </>
            ) : (
              <span className={`status-badge ${post.published ? 'published' : 'draft'}`}>
                {post.published ? 'PUBLICADO' : 'RASCUNHO'}
              </span>
            )}
          </div>
        </div>
        
        <div className="list-item-content">
          <p className="list-item-description">{post.content}</p>
        </div>
        
        <div className="list-item-footer">
          <span className="list-item-date">
            Data: {formatDate(post.createdAt)}
          </span>
          <div className="list-item-actions">
            {isPending ? (
              <>
                {onEdit && (
                  <button className="action-btn edit" onClick={() => onEdit(post)}>
                    <FontAwesomeIcon icon={faEdit} /> EDITAR
                  </button>
                )}
                {onApprove && (
                  <button className="action-btn approve" onClick={() => onApprove(post)}>
                    <FontAwesomeIcon icon={faCheck} /> PUBLICAR
                  </button>
                )}
                {onReject && (
                  <button className="action-btn reject" onClick={() => onReject(post)}>
                    <FontAwesomeIcon icon={faTimes} /> EXCLUIR
                  </button>
                )}
              </>
            ) : (
              <>
                {onEdit && (
                  <button className="action-btn edit" onClick={() => onEdit(post)}>
                    <FontAwesomeIcon icon={faEdit} /> EDITAR
                  </button>
                )}
                {onPublish && !post.published && (
                  <button className="action-btn publish" onClick={() => onPublish(post)}>
                    <FontAwesomeIcon icon={faEye} /> PUBLICAR
                  </button>
                )}
                {onDelete && (
                  <button className="action-btn delete" onClick={() => onDelete(post)}>
                    <FontAwesomeIcon icon={faTrash} /> EXCLUIR
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const cardClass = viewType === '3x' ? 'pokemon-card-3x' : 'pokemon-card';
  const contentClass = viewType === '3x' ? 'card-content-3x' : 'card-content';
  const headerClass = viewType === '3x' ? 'card-header-3x' : 'card-header';
  const badgesClass = viewType === '3x' ? 'status-badges-3x' : 'status-badges';
  const imageClass = viewType === '3x' ? 'card-image-3x' : 'card-image';
  const titleClass = viewType === '3x' ? 'card-title-3x' : 'card-title';
  const descriptionClass = viewType === '3x' ? 'card-description-3x' : 'card-description';
  const footerClass = viewType === '3x' ? 'card-footer-3x' : 'card-footer';
  const dateClass = viewType === '3x' ? 'card-date-3x' : 'card-date';
  const actionsClass = viewType === '3x' ? 'card-actions-3x' : 'card-actions';

  return (
    <div
      key={post.id || `news-${viewType}-${index}`}
      className={`${cardClass} ${isPending ? 'pending' : post.published ? 'published' : 'draft'}`}
      ref={cardRef}
      data-tilt
      data-tilt-max="15"
      data-tilt-speed="1000"
      data-tilt-perspective="1000"
    >
      <div className="pokemon-card-inner">
        <div className="pokemon-card-front">
          <div className={headerClass}>
            <div className={badgesClass}>
              {isPending ? (
                <>
                  <span className="status-badge pending">POST PENDENTE</span>
                  <span className="status-badge draft">AGUARDANDO APROVAÇÃO</span>
                </>
              ) : (
                <span className={`status-badge ${post.published ? 'published' : 'draft'}`}>
                  {post.published ? 'PUBLICADO' : 'RASCUNHO'}
                </span>
              )}
            </div>
          </div>
          
          <div className={contentClass}>
            <div className={imageClass}>
              {post.imageUrl ? (
                <img src={post.imageUrl} alt={post.title} />
              ) : (
                <FontAwesomeIcon icon={faNewspaper} className="placeholder-icon" />
              )}
            </div>
            
            <h3 className={titleClass}>{post.title}</h3>
            <p className={descriptionClass}>{post.content}</p>
          </div>
          
          <div className={footerClass}>
            <span className={dateClass}>
              {formatDate(post.createdAt)}
            </span>
            <div className={actionsClass}>
              {isPending ? (
                <>
                  {onEdit && (
                    <button className="action-btn edit" onClick={() => onEdit(post)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  )}
                  {onApprove && (
                    <button className="action-btn publish" onClick={() => onApprove(post)}>
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}
                  {onReject && (
                    <button className="action-btn delete" onClick={() => onReject(post)}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </>
              ) : (
                <>
                  {onEdit && (
                    <button className="action-btn edit" onClick={() => onEdit(post)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  )}
                  {onPublish && !post.published && (
                    <button className="action-btn publish" onClick={() => onPublish(post)}>
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  )}
                  {onDelete && (
                    <button className="action-btn delete" onClick={() => onDelete(post)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
