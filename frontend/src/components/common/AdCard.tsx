import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAd, faEdit, faTrash, faEye, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

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

  if (viewType === 'list') {
    return (
      <div className={`news-list-item ad ${ad.status || 'draft'} ${isPending ? 'pending' : ''}`}>
        <div className="list-item-header">
          <h3 className="list-item-title">{ad.title}</h3>
          <div className="status-badges">
            {isPending ? (
              <>
                <span className="status-badge pending">ANÚNCIO PENDENTE</span>
                <span className="status-badge draft">AGUARDANDO APROVAÇÃO</span>
              </>
            ) : (
              <span className={`status-badge ${ad.status}`}>
                {ad.status === 'published' ? 'PUBLICADO' : 'RASCUNHO'}
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
            {isPending ? (
              <>
                {onEdit && (
                  <button className="action-btn edit" onClick={() => onEdit(ad)}>
                    <FontAwesomeIcon icon={faEdit} /> EDITAR
                  </button>
                )}
                {onApprove && (
                  <button className="action-btn approve" onClick={() => onApprove(ad)}>
                    <FontAwesomeIcon icon={faCheck} /> PUBLICAR
                  </button>
                )}
                {onReject && (
                  <button className="action-btn reject" onClick={() => onReject(ad)}>
                    <FontAwesomeIcon icon={faTimes} /> EXCLUIR
                  </button>
                )}
              </>
            ) : (
              <>
                {onEdit && (
                  <button className="action-btn edit" onClick={() => onEdit(ad)}>
                    <FontAwesomeIcon icon={faEdit} /> EDITAR
                  </button>
                )}
                {onPublish && ad.status !== 'published' && (
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
      className={`${cardClass} ad ${isPending ? 'pending' : ad.status || 'draft'}`}
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
                  <span className="status-badge pending">ANÚNCIO PENDENTE</span>
                  <span className="status-badge draft">AGUARDANDO APROVAÇÃO</span>
                </>
              ) : (
                <span className={`status-badge ${ad.status}`}>
                  {ad.status === 'published' ? 'PUBLICADO' : 'RASCUNHO'}
                </span>
              )}
            </div>
          </div>
          
          <div className={contentClass}>
            <div className={imageClass}>
              {ad.imageUrl ? (
                <img src={ad.imageUrl} alt={ad.title} />
              ) : (
                <FontAwesomeIcon icon={faAd} className="placeholder-icon" />
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
            <span className={dateClass}>
              {formatDate(ad.createdAt || ad.date)}
            </span>
            <div className={actionsClass}>
              {isPending ? (
                <>
                  {onEdit && (
                    <button className="action-btn edit" onClick={() => onEdit(ad)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  )}
                  {onApprove && (
                    <button className="action-btn publish" onClick={() => onApprove(ad)}>
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}
                  {onReject && (
                    <button className="action-btn delete" onClick={() => onReject(ad)}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </>
              ) : (
                <>
                  {onEdit && (
                    <button className="action-btn edit" onClick={() => onEdit(ad)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  )}
                  {onPublish && ad.status !== 'published' && (
                    <button className="action-btn publish" onClick={() => onPublish(ad)}>
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  )}
                  {onDelete && (
                    <button className="action-btn delete" onClick={() => onDelete(ad)}>
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
