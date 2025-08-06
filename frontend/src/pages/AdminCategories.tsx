import React, { useState, useEffect } from 'react';
import { ServiceCategory } from '../types/serviceCategory';
import { ServiceCategoryService } from '../services/serviceCategoryService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AdminCategories.scss';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCategories = () => {
    setLoading(true);
    ServiceCategoryService.getAllCategories()
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar categorias');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setAdding(true);
    setError(null);
    setSuccess(null);
    try {
      await ServiceCategoryService.createCategory({ name: newCategory.trim(), active: true });
      setSuccess('Categoria adicionada com sucesso!');
      setNewCategory('');
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar categoria');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="admin-categories-page">
      <h2>Gerenciar Categorias de Serviços</h2>
      <form className="add-category-form" onSubmit={handleAddCategory}>
        <input
          type="text"
          placeholder="Nova categoria"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          disabled={adding}
        />
        <button type="submit" disabled={adding || !newCategory.trim()}>
          {adding ? 'Adicionando...' : 'Adicionar'}
        </button>
      </form>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <LoadingSpinner text="Carregando categorias..." />
      ) : (
        <ul className="categories-list">
          {categories.map(cat => (
            <li key={cat.id} className={cat.active ? '' : 'inactive'}>
              {cat.name} {cat.active ? '' : '(Inativa)'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminCategories;
