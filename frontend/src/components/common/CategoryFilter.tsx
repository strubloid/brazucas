import React from 'react';
import { ServiceCategory } from '../../types/serviceCategory';

interface CategoryFilterProps {
  categories: ServiceCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  className = ''
}) => {
  if (categories.length === 0) {
    return (
      <div className={`category-filter ${className}`}>
        <h3>Filtrar por categoria:</h3>
        <div className="category-buttons">
          <span style={{ color: '#6b7280', fontSize: '1rem' }}>Nenhuma categoria disponível</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`category-filter ${className}`}>
      <h3>Filtrar por categoria:</h3>
      <div className="category-buttons">
        <button
          key="all"
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          Todas
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
