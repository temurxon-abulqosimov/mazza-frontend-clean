import React from 'react';
import { BusinessType } from '../types';

interface CategoryFilterProps {
  selectedCategory: BusinessType | 'all';
  onCategoryChange: (category: BusinessType | 'all') => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', label: 'All', icon: '' },
    { id: BusinessType.MARKET, label: 'Market', icon: '' },
    { id: BusinessType.BAKERY, label: 'Bakery', icon: '' },
    { id: BusinessType.RESTAURANT, label: 'Restaurant', icon: '' },
    { id: BusinessType.CAFE, label: 'Cafe', icon: '' },
    { id: BusinessType.OTHER, label: 'Other', icon: '' },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id as BusinessType | 'all')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
