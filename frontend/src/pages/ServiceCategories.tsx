import React, { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { ServiceCategoryService } from '../services/serviceCategoryService';
import { ServiceCategory, CreateServiceCategoryRequest } from '../types/serviceCategory';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/pages/ServiceCategories.scss';

const ServiceCategories: React.FC = () => {
  const { data: categories, loading, error, refetch } = useAsync<ServiceCategory[]>(
    () => ServiceCategoryService.getAllCategories(),
    []
  );

  const [newCategory, setNewCategory] = useState<CreateServiceCategoryRequest>({
    name: '',
    active: true
  });

  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    isEditing: boolean = false
  ) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (isEditing && editingCategory) {
      setEditingCategory({
        ...editingCategory,
        [name]: processedValue
      });
    } else {
      setNewCategory({
        ...newCategory,
        [name]: processedValue
      });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      setErrorMessage('O nome da categoria é obrigatório');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await ServiceCategoryService.createCategory(newCategory);
      setSuccessMessage('Categoria criada com sucesso!');
      setNewCategory({ name: '', active: true });
      refetch();
    } catch (error) {
      setErrorMessage((error as Error).message || 'Erro ao criar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (category: ServiceCategory) => {
    setEditingCategory(category);
    setErrorMessage(null);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setErrorMessage(null);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !editingCategory.name.trim()) {
      setErrorMessage('O nome da categoria é obrigatório');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await ServiceCategoryService.updateCategory(editingCategory.id, {
        name: editingCategory.name,
        active: editingCategory.active
      });
      setSuccessMessage('Categoria atualizada com sucesso!');
      setEditingCategory(null);
      refetch();
    } catch (error) {
      setErrorMessage((error as Error).message || 'Erro ao atualizar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await ServiceCategoryService.deleteCategory(id);
      setSuccessMessage('Categoria excluída com sucesso!');
      refetch();
    } catch (error) {
      setErrorMessage((error as Error).message || 'Erro ao excluir categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="service-categories-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Gerenciar Categorias de Serviços</h1>
          <p>Adicione, edite ou remova categorias para anúncios de serviços</p>
          
          <div className="admin-navigation">
            <a href="/admin/dashboard" className="nav-link">Dashboard</a>
            <a href="/admin/service-categories" className="nav-link active">Categorias de Serviços</a>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <FontAwesomeIcon icon={faTimes} /> {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <FontAwesomeIcon icon={faCheck} /> {successMessage}
          </div>
        )}

        <div className="content-grid">
          {/* New Category Form */}
          <div className="form-section">
            <h2>Adicionar Nova Categoria</h2>
            <form onSubmit={handleCreateCategory} className="category-form">
              <div className="form-group">
                <label htmlFor="name">Nome da Categoria</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newCategory.name}
                  onChange={(e) => handleInputChange(e)}
                  placeholder="Ex: Aulas Particulares"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="active">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={newCategory.active}
                    onChange={(e) => handleInputChange(e)}
                    disabled={isSubmitting}
                  />
                  Categoria Ativa
                </label>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faPlus} /> {isSubmitting ? 'Adicionando...' : 'Adicionar Categoria'}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="categories-list-section">
            <h2>Categorias Existentes</h2>
            
            {categories && categories.length > 0 ? (
              <div className="categories-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category.id}>
                        <td>
                          {editingCategory && editingCategory.id === category.id ? (
                            <input
                              type="text"
                              name="name"
                              value={editingCategory.name}
                              onChange={(e) => handleInputChange(e, true)}
                              disabled={isSubmitting}
                            />
                          ) : (
                            category.name
                          )}
                        </td>
                        <td>
                          {editingCategory && editingCategory.id === category.id ? (
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                name="active"
                                checked={editingCategory.active}
                                onChange={(e) => handleInputChange(e, true)}
                                disabled={isSubmitting}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          ) : (
                            <span className={`status-badge ${category.active ? 'active' : 'inactive'}`}>
                              {category.active ? 'Ativa' : 'Inativa'}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCategory && editingCategory.id === category.id ? (
                            <div className="action-buttons">
                              <button 
                                className="action-btn save" 
                                onClick={handleUpdateCategory}
                                disabled={isSubmitting}
                              >
                                <FontAwesomeIcon icon={faCheck} /> Salvar
                              </button>
                              <button 
                                className="action-btn cancel" 
                                onClick={cancelEditing}
                                disabled={isSubmitting}
                              >
                                <FontAwesomeIcon icon={faTimes} /> Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button 
                                className="action-btn edit"
                                onClick={() => startEditing(category)}
                                disabled={isSubmitting}
                              >
                                <FontAwesomeIcon icon={faEdit} /> Editar
                              </button>
                              <button 
                                className="action-btn delete"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={isSubmitting}
                              >
                                <FontAwesomeIcon icon={faTrash} /> Excluir
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-categories">
                {error ? (
                  <p className="error-message">Erro ao carregar categorias: {error}</p>
                ) : (
                  <p>Nenhuma categoria encontrada. Adicione a primeira categoria usando o formulário.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCategories;
