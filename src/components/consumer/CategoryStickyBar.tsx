import React from 'react';
import { Flame, Pizza, Beef, Utensils, Cake, CupSoda } from 'lucide-react';
import { Category } from '../../types';

interface CategoryStickyBarProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  isArabic: boolean;
  isDark: boolean;
}

export const CategoryStickyBar: React.FC<CategoryStickyBarProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  isArabic,
  isDark,
}) => {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'Pizza':
        return <Pizza className="w-4 h-4 text-lantern-red" />;
      case 'Beef':
        return <Beef className="w-4 h-4 text-orange-600" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4 text-emerald-500" />;
      case 'Cake':
        return <Cake className="w-4 h-4 text-pink-500" />;
      case 'CupSoda':
        return <CupSoda className="w-4 h-4 text-cyan-500" />;
      default:
        return <Utensils className="w-4 h-4 text-lantern-red" />;
    }
  };

  return (
    <div
      className={`sticky top-16 sm:top-20 z-30 border-b backdrop-blur-md transition-colors ${
        isDark
          ? 'bg-dark-surface/95 border-dark-border shadow-md'
          : 'bg-[#FCF7F3]/95 border-[#E8D4C5] shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {categories
            .filter((c) => c.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((cat) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-tab-${cat.id}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                    isActive
                      ? 'bg-lantern-red text-white border-lantern-red shadow-md scale-[1.02]'
                      : isDark
                      ? 'bg-dark-surface-elevated border-dark-border text-evening-cream/80 hover:text-evening-cream hover:border-lantern-red/50'
                      : 'bg-white border-[#E5D2C3] text-temple-brown hover:bg-[#F4EAE2] hover:border-lantern-red/40'
                  }`}
                >
                  <span>{getIcon(cat.icon)}</span>
                  <span>{isArabic ? cat.nameAr : cat.name}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};
