
import React, { useState, useEffect } from 'react';
import { ServiceCategory } from '../types/serviceCategory';
import { ServiceCategoryService } from '../services/serviceCategoryService';
import { CategoryStatsService, CategoryStats } from '../services/categoryStatsService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AdminCategories.scss';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);


  const fetchCategories = () => {
    setLoading(true);
    Promise.all([
      ServiceCategoryService.getAllCategories(),
      CategoryStatsService.getCategoryStats()
    ])
      .then(([cats, stats]) => {
        setCategories(cats);
        setCategoryStats(stats);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar categorias');
        setLoading(false);
      });
  };
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      await ServiceCategoryService.deleteCategory(id);
      setSuccess('Categoria excluída com sucesso!');
      fetchCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
    } finally {
      setDeletingId(null);
    }
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar categoria');
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
        <table className="categories-list-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Qtd. Anúncios</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => {
              const stat = categoryStats.find(s => s.categoryId === cat.id);
              const adsCount = stat ? stat.adsCount : 0;
              // Only allow delete if there are no published ads/news for this category
              const canDelete = adsCount === 0;
              return (
                <tr key={cat.id} className={cat.active ? '' : 'inactive'}>
                  <td>{cat.name} {cat.active ? '' : '(Inativa)'}</td>
                  <td style={{ textAlign: 'center' }}>{adsCount}</td>
                  <td>
                    <button
                      className="delete-category-btn"
                      disabled={!canDelete || deletingId === cat.id}
                      onClick={() => handleDeleteCategory(cat.id)}
                      title={canDelete ? 'Excluir categoria' : 'Não é possível excluir: existem anúncios publicados'}
                    >
                      {deletingId === cat.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCategories;
