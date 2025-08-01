import React, { useState } from 'react';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { AdService } from '../services/adService';
import { CreateAdRequest, Advertisement } from '../types/ads';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AdSubmission.scss';

const AdSubmission: React.FC = () => {
  const pageRef = useAnimateOnMount('fadeIn');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');

  const { data: existingAds, loading: adsLoading, refetch } = useAsync<Advertisement[]>(
    () => AdService.getAllAds(),
    []
  );

  const [formData, setFormData] = useState<CreateAdRequest>({
    title: '',
    content: '',
    imageUrl: '',
    youtubeUrl: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setSubmitError('');
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setSubmitError('Título é obrigatório');
      return false;
    }

    if (!formData.content.trim()) {
      setSubmitError('Conteúdo é obrigatório');
      return false;
    }

    if (formData.content.length > 500) {
      setSubmitError('Conteúdo deve ter no máximo 500 caracteres');
      return false;
    }

    if (!formData.imageUrl && !formData.youtubeUrl) {
      setSubmitError('Deve fornecer uma imagem ou vídeo do YouTube');
      return false;
    }

    if (formData.imageUrl && formData.youtubeUrl) {
      setSubmitError('Forneça apenas uma imagem OU um vídeo do YouTube, não ambos');
      return false;
    }

    if (formData.youtubeUrl && !isValidYouTubeUrl(formData.youtubeUrl)) {
      setSubmitError('URL do YouTube inválida');
      return false;
    }

    return true;
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Clean up the form data
      const submitData: CreateAdRequest = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl?.trim() || undefined,
        youtubeUrl: formData.youtubeUrl?.trim() || undefined,
      };

      await AdService.createAd(submitData);
      
      setSubmitSuccess('Anúncio enviado com sucesso! Aguarde a aprovação.');
      setFormData({
        title: '',
        content: '',
        imageUrl: '',
        youtubeUrl: '',
      });
      
      refetch();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao enviar anúncio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={pageRef} className="ad-submission">
      <div className="ad-submission__container">
        <header className="ad-submission__header">
          <h1 className="ad-submission__title">Submeter Anúncio</h1>
          <p className="ad-submission__subtitle">
            Promova seu negócio ou serviço para a comunidade brasileira em Cork
          </p>
        </header>

        <div className="ad-submission__content">
          <div className="ad-submission__info">
            <div className="ad-submission__info-card">
              <h3>📝 Diretrizes para Anúncios</h3>
              <ul>
                <li>Máximo de 500 caracteres no conteúdo</li>
                <li>Apenas uma imagem OU um vídeo do YouTube</li>
                <li>Conteúdo deve ser relevante para a comunidade</li>
                <li>Anúncios passam por aprovação antes da publicação</li>
                <li>Cada anunciante pode ter apenas um anúncio ativo</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="ad-submission__form">
            {submitError && (
              <div className="ad-submission__message ad-submission__message--error">
                ⚠️ {submitError}
              </div>
            )}
            
            {submitSuccess && (
              <div className="ad-submission__message ad-submission__message--success">
                ✅ {submitSuccess}
              </div>
            )}

            <div className="ad-submission__field">
              <label htmlFor="title" className="ad-submission__label">
                Título do Anúncio *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="ad-submission__input"
                placeholder="Ex: Aulas de Português para Estrangeiros"
                required
                maxLength={100}
                disabled={isSubmitting}
              />
              <small className="ad-submission__char-count">
                {formData.title.length}/100 caracteres
              </small>
            </div>

            <div className="ad-submission__field">
              <label htmlFor="content" className="ad-submission__label">
                Descrição *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="ad-submission__textarea"
                placeholder="Descreva seu produto ou serviço..."
                required
                maxLength={500}
                rows={6}
                disabled={isSubmitting}
              />
              <small className="ad-submission__char-count">
                {formData.content.length}/500 caracteres
              </small>
            </div>

            <div className="ad-submission__media-section">
              <h3 className="ad-submission__media-title">Mídia (escolha uma opção)</h3>
              
              <div className="ad-submission__field">
                <label htmlFor="imageUrl" className="ad-submission__label">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="ad-submission__input"
                  placeholder="https://exemplo.com/imagem.jpg"
                  disabled={isSubmitting || !!formData.youtubeUrl}
                />
              </div>

              <div className="ad-submission__divider">
                <span>OU</span>
              </div>

              <div className="ad-submission__field">
                <label htmlFor="youtubeUrl" className="ad-submission__label">
                  URL do YouTube
                </label>
                <input
                  type="url"
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleInputChange}
                  className="ad-submission__input"
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={isSubmitting || !!formData.imageUrl}
                />
              </div>
            </div>

            <div className="ad-submission__actions">
              <button
                type="submit"
                className="ad-submission__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="small" text="Enviando..." />
                ) : (
                  'Submeter Anúncio'
                )}
              </button>
            </div>
          </form>

          {/* Show existing ads for this advertiser */}
          <div className="ad-submission__existing">
            <h3 className="ad-submission__existing-title">Seus Anúncios</h3>
            
            {adsLoading ? (
              <LoadingSpinner size="small" text="Carregando..." />
            ) : existingAds && existingAds.length > 0 ? (
              <div className="ad-submission__existing-list">
                {existingAds.map((ad) => (
                  <div key={ad.id} className="ad-submission__existing-item">
                    <h4>{ad.title}</h4>
                    <p>{ad.content}</p>
                    <div className="ad-submission__existing-status">
                      <span className={`ad-submission__status ad-submission__status--${ad.approved ? 'approved' : 'pending'}`}>
                        {ad.approved ? '✅ Aprovado' : '⏳ Aguardando Aprovação'}
                      </span>
                      <span className="ad-submission__date">
                        {new Date(ad.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ad-submission__no-ads">
                <p>Você ainda não tem anúncios submetidos.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSubmission;
