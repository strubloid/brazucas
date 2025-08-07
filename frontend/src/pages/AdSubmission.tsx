import React, { useState } from 'react';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { useAsync } from '../hooks/useAsync';
import { AdService } from '../services/adService';
import { ServiceCategoryService } from '../services/serviceCategoryService';
import { CreateAdvertisementRequest, Advertisement } from '../types/ads';
import { ServiceCategory } from '../types/serviceCategory';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AdSubmission.scss';

const AdSubmission: React.FC = () => {
  const pageRef = useAnimateOnMount('fadeIn');
  
  const { data: existingAds, loading: adsLoading, refetch } = useAsync<Advertisement[]>(
    () => AdService.getMyAds(),
    []
  );
  
  // Load all categories to match the admin table
  const { data: serviceCategories, loading: categoriesLoading } = useAsync<ServiceCategory[]>(
    () => ServiceCategoryService.getAllCategories(),
    []
  );

  const [formData, setFormData] = useState<CreateAdvertisementRequest>({
    title: '',
    description: '',
    category: '',
    price: '',
    contactEmail: '',
    published: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'O título é obrigatório.';
    }

    if (!formData.description.trim()) {
      return 'A descrição é obrigatória.';
    }

    if (formData.description.length > 500) {
      return 'A descrição deve ter no máximo 500 caracteres.';
    }

    if (!formData.category.trim()) {
      return 'A categoria é obrigatória.';
    }

    if (!formData.price.trim()) {
      return 'O preço é obrigatório.';
    }

    if (!formData.contactEmail.trim()) {
      return 'O email de contato é obrigatório.';
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      return 'Email de contato inválido.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const submitData: CreateAdvertisementRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
            category: formData.category.trim(), // now this is the category id
        price: formData.price.trim(),
        contactEmail: formData.contactEmail.trim(),
        published: true, // Submit for approval
      };

      await AdService.createAd(submitData);
      
      setSubmitSuccess('Anúncio enviado com sucesso! Aguarde aprovação.');
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        contactEmail: '',
        published: false,
      });
      
      refetch();
    } catch (error) {
      console.error('Error submitting advertisement:', error);
      setSubmitError(error instanceof Error ? error.message : 'Erro ao enviar anúncio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use the hardcoded categories as fallback if API fails
  const fallbackCategories = [
    'Serviços Domésticos',
    'Limpeza',
    'Jardinagem',
    'Manutenção',
    'Culinária',
    'Tutoria/Ensino',
    'Cuidado de Crianças',
    'Cuidado de Idosos',
    'Pet Care',
    'Transporte',
    'Outros',
  ];

  const getStatusBadge = (ad: Advertisement) => {
    if (ad.approved === null) {
      return <span className="status-badge pending">Pendente</span>;
    } else if (ad.approved === true) {
      return <span className="status-badge published">Publicado</span>;
    } else {
      return <span className="status-badge rejected">Rejeitado</span>;
    }
  };

  if (adsLoading || categoriesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="ad-submission-page" ref={pageRef}>
      <div className="page-container">
        <div className="page-header">
          <h1>Enviar Anúncio</h1>
          <p>Publique seu serviço e conecte-se com a comunidade brazuca!</p>
        </div>

        <div className="content-grid">
          {/* Form Section */}
          <div className="form-section">
            <form onSubmit={handleSubmit} className="ad-form">
              <div className="form-group">
                <label htmlFor="title">Título do Serviço *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Serviços de limpeza doméstica"
                  disabled={isSubmitting}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoria *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {(serviceCategories && serviceCategories.length > 0
                    ? serviceCategories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))
                    : fallbackCategories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Descrição do Serviço *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva detalhadamente seu serviço, experiência e diferenciais..."
                  disabled={isSubmitting}
                  maxLength={500}
                  rows={6}
                  required
                />
                <div className="char-count">
                  {formData.description.length}/500 caracteres
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="price">Preço *</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Ex: €20/hora, €50/dia, A combinar"
                  disabled={isSubmitting}
                  maxLength={20}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail">Email de Contato *</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="seu.email@exemplo.com"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {submitError && (
                <div className="error-message">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="success-message">
                  {submitSuccess}
                </div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Anúncio'}
              </button>
            </form>
          </div>

          {/* My Ads Section */}
          <div className="my-ads-section">
            <h2>Meus Anúncios</h2>
            
            {existingAds && existingAds.length > 0 ? (
              <div className="ads-list">
                {existingAds.map(ad => (
                  <div key={ad.id} className="ad-card">
                    <div className="ad-header">
                      <h3>{ad.title}</h3>
                      {getStatusBadge(ad)}
                    </div>
                    <div className="ad-details">
                      <p className="category">{ad.category}</p>
                      <p className="description">{ad.description}</p>
                      <div className="ad-footer">
                        <span className="price">{ad.price}</span>
                        <span className="contact">{ad.contactEmail}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-ads">
                <p>Você ainda não possui anúncios enviados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSubmission;
