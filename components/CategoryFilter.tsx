import React from 'react';
import { CuisineType } from '../types';

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
  disabled: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm shadow-sm py-3 border-b border-gray-200">
      <div className="flex overflow-x-auto no-scrollbar px-4 gap-3 max-w-3xl mx-auto">
        {Object.values(CuisineType).map((type) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            disabled={disabled}
            className={`
              whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 transform active:scale-95
              ${
                selected === type
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};