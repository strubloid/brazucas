import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAd, faEdit, faTrash, faEye, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { StatusManager } from '../../types/status';

export interface AdCardProps {
  ad: any;
  index: number;
  cardRef?: (el: HTMLDivElement | null) => void;
  onEdit?: (ad: any) => void;
  onDelete?: (ad: any) => void;
  onPublish?: (ad: any) => void;
  onView?: (ad: any) => void;
  onApprove?: (ad: any) => void;
  onReject?: (ad: any) => void;
  viewType?: 'card' | '3x' | 'list';
  isPending?: boolean;
}

export const AdCard: React.FC<AdCardProps> = ({
  ad,
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
  // Safety check - if ad is undefined, return null to prevent crashes
  if (!ad || typeof ad !== 'object') {
    console.warn('AdCard: Received invalid ad data:', ad);
    return null;
  }

  // Calculate actual status for consistent button logic
  const adStatus = StatusManager.getAdStatus({ 
    published: ad.published || false, 
    approved: ad.approved 
  });
  
  // Status-based logic variables for consistent behavior
  const isActuallyPending = adStatus === 'pending' || adStatus === 'draft';
  const isPublished = adStatus === 'published';
  const isDraft = adStatus === 'draft';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on buttons
    if ((e.target as HTMLElement).closest('.action-btn')) {
      return;
    }
    
    // Only trigger edit for non-published ads
    const isPublished = ad.status === 'approved' || ad.status === 'published';
    if (!isPublished && onEdit) {
      onEdit(ad);
    }
  };

  if (viewType === 'list') {
    return (
      <div className={`news-list-item ad ${adStatus} ${isPending ? 'pending' : ''}`}>
        <div className="list-item-header">
          <h3 className="list-item-title">{ad.title}</h3>
          <div className="status-badges">
            {isPending ? (
              <>
                <span className="status-badge pending">ANÚNCIO PENDENTE</span>
                <span className="status-badge draft"> AGUARDANDO APROVAÇÃO</span>
              </>
            ) : (
              <span className={`status-badge ${adStatus}`}>
                {StatusManager.getStatusLabel(adStatus)}
              </span>
            )}
          </div>
        </div>
        
        <div className="list-item-content">
          <p className="list-item-description">{ad.description}</p>
          <div className="list-item-details">
            <div className="detail-item category">
              <span className="label">Categoria:</span>
              <span className="value">{ad.category}</span>
            </div>
            <div className="detail-item price">
              <span className="label">Preço:</span>
              <span className="value">{formatPrice(ad.price)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Localização:</span>
              <span className="value">{ad.location || 'Não especificado'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Contato:</span>
              <span className="value">{ad.contact || 'Não especificado'}</span>
            </div>
          </div>
        </div>
        
        <div className="list-item-footer">
          <span className="list-item-date">
            Data: {formatDate(ad.createdAt || ad.date)}
          </span>
          <div className="list-item-actions">
            {isActuallyPending ? (
              // Pending ads: show edit, approve/publish, and reject buttons
              <>
                {onEdit && (
                  <button className="action-btn edit" onClick={() => onEdit(ad)}>
                    <FontAwesomeIcon icon={faEdit} /> EDITAR
                  </button>
                )}
                {(onApprove || onPublish) && (
                  <button className="action-btn approve" onClick={() => onApprove ? onApprove(ad) : onPublish ? onPublish(ad) : undefined}>
                    <FontAwesomeIcon icon={faCheck} /> PUBLICAR
                  </button>
                )}
                {(onReject || onDelete) && (
                  <button className="action-btn reject" onClick={() => onReject ? onReject(ad) : onDelete ? onDelete(ad) : undefined}>
                    <FontAwesomeIcon icon={faTimes} /> EXCLUIR
                  </button>
                )}
              </>
            ) : (
              <>
                {isPublished ? (
                  // Published ads: only show delete button
                  onDelete && (
                    <button className="action-btn delete" onClick={() => onDelete(ad)}>
                      <FontAwesomeIcon icon={faTrash} /> EXCLUIR
                    </button>
                  )
                ) : (
                  // Draft ads: show edit and publish buttons
                  <>
                    {onEdit && (
                      <button className="action-btn edit" onClick={() => onEdit(ad)}>
                        <FontAwesomeIcon icon={faEdit} /> EDITAR
                      </button>
                    )}
                    {onPublish && (
                      <button className="action-btn publish" onClick={() => onPublish(ad)}>
                        <FontAwesomeIcon icon={faEye} /> PUBLICAR
                      </button>
                    )}
                    {onDelete && (
                      <button className="action-btn delete" onClick={() => onDelete(ad)}>
                        <FontAwesomeIcon icon={faTrash} /> EXCLUIR
                      </button>
                    )}
                  </>
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
  const detailsClass = viewType === '3x' ? 'card-details-3x' : 'card-details';

  return (
    <div
      key={ad.id || `ad-${viewType}-${index}`}
      className={`${cardClass} ad ${isPending ? 'pending' : adStatus} ${!isPublished ? 'clickable' : ''}`}
      ref={cardRef}
      data-tilt
      data-tilt-max="15"
      data-tilt-speed="1000"
      data-tilt-perspective="1000"
      onClick={handleCardClick}
      style={{ cursor: !isPublished ? 'pointer' : 'default' }}
    >
      <div className="pokemon-card-inner">
        <div className="pokemon-card-front">
          <div className={headerClass}>
            <div className="card-header-content">
              {isPending ? (
                <>
                  <span className="status-badge pending">ANÚNCIO PENDENTE</span>
                  <span className="status-badge draft"> AGUARDANDO APROVAÇÃO</span>
                </>
              ) : (
                <span className={`status-badge ${adStatus}`}>
                  {StatusManager.getStatusLabel(adStatus)}
                </span>
              )}
            </div>
            {/* Add date below status badge */}
            <div className="card-header-date">
              {formatDate(ad.createdAt || ad.date)}
            </div>
          </div>
          
          <div className={contentClass}>
            <div className={imageClass}>
              {ad.imageUrl ? (
                <img src={ad.imageUrl} alt={ad.title} />
              ) : (
                <div className="placeholder-content">
                  <div className="brazucas-logo">BRAZUCAS</div>
                </div>
              )}
            </div>
            
            <h3 className={titleClass}>{ad.title}</h3>
            <p className={descriptionClass}>{ad.description}</p>
            
            {viewType === '3x' && (
              <div className={detailsClass}>
                <div className="detail-row">
                  <span className="label">Categoria:</span>
                  <span className="value">{ad.category}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Preço:</span>
                  <span className="value">{formatPrice(ad.price)}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className={footerClass}>
            {viewType === '3x' ? (
              <>
                <div className="card-date-section">
                  <span className={dateClass}>
                    {formatDate(ad.createdAt || ad.date)}
                  </span>
                </div>
                <div className="card-bottom-section">
                  <div className={actionsClass}>
                    {isActuallyPending ? (
                      // Pending ads: show edit, approve/publish, and reject buttons
                      <>
                        {onEdit && (
                          <button className="action-btn edit" onClick={() => onEdit(ad)}>
                            <FontAwesomeIcon icon={faEdit} />
                            <span>EDITAR</span>
                          </button>
                        )}
                        {(onApprove || onPublish) && (
                          <button className="action-btn publish" onClick={() => onApprove ? onApprove(ad) : onPublish ? onPublish(ad) : undefined}>
                            <FontAwesomeIcon icon={faCheck} />
                            <span>PUBLICAR</span>
                          </button>
                        )}
                        {(onReject || onDelete) && (
                          <button className="action-btn delete" onClick={() => onReject ? onReject(ad) : onDelete ? onDelete(ad) : undefined}>
                            <FontAwesomeIcon icon={faTimes} />
                            <span>EXCLUIR</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {isPublished ? (
                          // Published ads: only show delete button
                          onDelete && (
                            <button className="action-btn delete" onClick={() => onDelete(ad)}>
                              <FontAwesomeIcon icon={faTrash} />
                              <span>EXCLUIR</span>
                            </button>
                          )
                        ) : (
                          // Draft ads: show edit and publish buttons
                          <>
                            {onEdit && (
                              <button className="action-btn edit" onClick={() => onEdit(ad)}>
                                <FontAwesomeIcon icon={faEdit} />
                                <span>EDITAR</span>
                              </button>
                            )}
                            {onPublish && (
                              <button className="action-btn publish" onClick={() => onPublish(ad)}>
                                <FontAwesomeIcon icon={faEye} />
                                <span>PUBLICAR</span>
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                
                <div className={actionsClass}>
                  {isActuallyPending ? (
                    // Pending ads: show edit, approve/publish, and reject buttons
                    <>
                      {onEdit && (
                        <button className="action-btn edit" onClick={() => onEdit(ad)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      )}
                      {(onApprove || onPublish) && (
                        <button className="action-btn publish" onClick={() => onApprove ? onApprove(ad) : onPublish ? onPublish(ad) : undefined}>
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                      {(onReject || onDelete) && (
                        <button className="action-btn delete" onClick={() => onReject ? onReject(ad) : onDelete ? onDelete(ad) : undefined}>
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {isPublished ? (
                        // Published ads: only show delete button
                        onDelete && (
                          <button className="action-btn delete" onClick={() => onDelete(ad)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )
                      ) : (
                        // Draft ads: show edit and publish buttons
                        <>
                          {onEdit && (
                            <button className="action-btn edit" onClick={() => onEdit(ad)}>
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          )}
                          {onPublish && (
                            <button className="action-btn publish" onClick={() => onPublish(ad)}>
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
