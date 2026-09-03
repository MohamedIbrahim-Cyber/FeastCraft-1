import React from 'react';
import { Plus, Flame, Sparkles, Clock, Ban } from 'lucide-react';
import { MenuItem } from '../../types';

interface MenuItemCardProps {
  item: MenuItem;
  onSelectItem: (item: MenuItem) => void;
  isArabic: boolean;
  isDark: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onSelectItem,
  isArabic,
  isDark,
}) => {
  const isSoldOut = !item.isAvailable;
  const hasOptions = item.optionGroups && item.optionGroups.length > 0;

  return (
    <div
      id={`item-card-${item.id}`}
      onClick={() => {
        if (!isSoldOut) {
          onSelectItem(item);
        }
      }}
      className={`group relative rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
        isSoldOut
          ? 'opacity-60 cursor-not-allowed border-stone-gray/30'
          : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
      } ${
        isDark
          ? 'bg-dark-surface-elevated border-dark-border hover:border-lantern-red/50'
          : 'bg-white border-[#EADAD0] hover:border-lantern-red/40'
      }`}
    >
      {/* Image Container */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-black/10">
        <img
          src={item.imageUrl}
          alt={isArabic ? item.nameAr : item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Gradient Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.isPopular && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-white shadow-md">
                <Sparkles className="w-3 h-3" />
                {isArabic ? 'الأكثر طلباً' : 'Popular'}
              </span>
            )}
            {item.isSpicy && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-red-600 text-white shadow-md">
                <Flame className="w-3 h-3" />
                {isArabic ? 'حار 🔥' : 'Spicy 🔥'}
              </span>
            )}
            {item.isVegetarian && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-md">
                🌱 {isArabic ? 'نباتي' : 'Veg'}
              </span>
            )}
          </div>

          {item.prepTimeMinutes && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
              <Clock className="w-2.5 h-2.5" />
              {item.prepTimeMinutes} {isArabic ? 'د' : 'min'}
            </span>
          )}
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center">
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
              <Ban className="w-4 h-4" />
              {isArabic ? 'نفذت الكمية (Sold Out)' : 'Sold Out (86)'}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3
              className={`font-black text-base leading-snug line-clamp-1 transition-colors ${
                isDark ? 'text-evening-cream group-hover:text-faded-coral' : 'text-temple-brown group-hover:text-lantern-red'
              }`}
            >
              {isArabic ? item.nameAr : item.name}
            </h3>
          </div>

          <p
            className={`text-xs line-clamp-2 leading-relaxed mb-3 ${
              isDark ? 'text-stone-gray' : 'text-stone-gray'
            }`}
          >
            {isArabic ? item.descriptionAr : item.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-stone-gray block uppercase tracking-wider">
              {hasOptions ? (isArabic ? 'يبدأ من' : 'Starts from') : (isArabic ? 'السعر' : 'Price')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-lantern-red font-mono">
                {item.basePrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-stone-gray">
                {isArabic ? 'ج.م' : 'EGP'}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isSoldOut}
            onClick={(e) => {
              e.stopPropagation();
              if (!isSoldOut) {
                onSelectItem(item);
              }
            }}
            className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-black flex items-center gap-1.5 transition-all duration-200 shadow-sm cursor-pointer ${
              isSoldOut
                ? 'bg-stone-gray/30 text-stone-gray cursor-not-allowed'
                : 'bg-lantern-red hover:bg-[#8B3426] active:scale-95 text-white shadow-lantern-red/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{hasOptions ? (isArabic ? 'تخصيص' : 'Customize') : (isArabic ? 'إضافة +' : 'Add +')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
