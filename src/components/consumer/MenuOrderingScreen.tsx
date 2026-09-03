import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Flame,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  Bike,
  Store,
  Clock,
  MapPin,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Wheat,
  Thermometer,
  ShieldCheck,
} from 'lucide-react';
import { Category, MenuItem, CartItem, FulfillmentType, DeliveryZone, Order } from '../../types';
import { CategoryStickyBar } from './CategoryStickyBar';
import { MenuItemCard } from './MenuItemCard';
import { HeroSection } from './HeroSection';

interface MenuOrderingScreenProps {
  categories: Category[];
  menuItems: MenuItem[];
  onSelectItemForCustomization: (item: MenuItem) => void;
  cartItems: CartItem[];
  onOpenCartDrawer: () => void;
  fulfillmentType: FulfillmentType;
  selectedZone: DeliveryZone | null;
  onOpenZoneModal: () => void;
  activeOrder?: Order | null;
  onTrackOrder?: (order: Order) => void;
  onOpenOrderStatusModal?: () => void;
  isRestaurantOpen?: boolean;
  isArabic: boolean;
  isDark: boolean;
}

export const MenuOrderingScreen: React.FC<MenuOrderingScreenProps> = ({
  categories,
  menuItems,
  onSelectItemForCustomization,
  cartItems,
  onOpenCartDrawer,
  fulfillmentType,
  selectedZone,
  onOpenZoneModal,
  activeOrder,
  onTrackOrder,
  onOpenOrderStatusModal,
  isRestaurantOpen = true,
  isArabic,
  isDark,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || 'cat-deals');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'POPULAR' | 'SPICY' | 'VEGETARIAN'>('ALL');

  // Category section refs for smooth jump-scrolling
  const categoryRefs = useRef<{ [catId: string]: HTMLElement | null }>({});
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectCategory = (catId: string) => {
    setActiveCategoryId(catId);
    const element = categoryRefs.current[catId];
    if (element) {
      const yOffset = -130;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleScrollToMenu = () => {
    const el = document.getElementById('menu-catalog-section');
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleScrollToCrust = () => {
    const el = document.getElementById('our-crust-section');
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleScrollToDeals = () => {
    handleSelectCategory('cat-deals');
  };

  // Filter items based on search and dietary preferences
  const filterItem = (item: MenuItem) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
      const matchAr = item.nameAr.toLowerCase().includes(q) || item.descriptionAr?.toLowerCase().includes(q);
      if (!matchEn && !matchAr) return false;
    }

    if (dietaryFilter === 'POPULAR' && !item.isPopular) return false;
    if (dietaryFilter === 'SPICY' && !item.isSpicy) return false;
    if (dietaryFilter === 'VEGETARIAN' && !item.isVegetarian) return false;

    return true;
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="min-h-screen pb-24 animate-fadeIn">
      {/* 1. Full-Bleed Atmospheric Landing Hero Section */}
      <HeroSection
        onOrderNowClick={handleScrollToMenu}
        onExploreCrustClick={handleScrollToCrust}
        onDealsClick={handleScrollToDeals}
        fulfillmentType={fulfillmentType}
        selectedZone={selectedZone}
        onOpenZoneModal={onOpenZoneModal}
        isArabic={isArabic}
        isDark={isDark}
      />

      {/* 2. Menu Catalog Anchor Section */}
      <div id="menu-catalog-section" className="relative">
        {/* Active Live Order Status Alert Banner (if customer has an in-flight order) */}
        {activeOrder && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
            <div
              id="menu-active-order-status-banner"
              onClick={() => onTrackOrder?.(activeOrder)}
              className="p-4 rounded-2xl bg-lantern-red/10 border border-lantern-red/30 hover:border-lantern-red text-temple-brown dark:text-evening-cream cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs group"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-lantern-red text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-lantern-red">
                      {isArabic ? 'طلب نشط قيد التنفيذ' : 'Live Order in Progress'}
                    </span>
                    <span className="font-mono font-bold text-xs bg-white dark:bg-dark-surface px-2 py-0.5 rounded-lg border border-lantern-red/20 shadow-2xs">
                      {activeOrder.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs font-bold mt-0.5">
                    {activeOrder.status === 'RECEIVED'
                      ? isArabic
                        ? 'تم استلام طلبك وبانتظار بدء الطهي في المطبخ ✅'
                        : 'Order received & queued for cooking ✅'
                      : activeOrder.status === 'KITCHEN_PREPARING'
                      ? isArabic
                        ? 'شيف عمر يجهز وجبتك في المطبخ الآن 👨‍🍳'
                        : 'Chef Omar is baking and assembling your order 👨‍🍳'
                      : activeOrder.status === 'OUT_FOR_DELIVERY'
                      ? isArabic
                        ? 'الطلب في الطريق مع مندوب التوصيل الآن 🛵'
                        : 'Courier is on the road to your address 🛵'
                      : activeOrder.status === 'READY_FOR_PICKUP'
                      ? isArabic
                        ? 'طلبك جاهز للاستلام من الفرع الآن 🛍️'
                        : 'Your order is ready for pickup at the counter 🛍️'
                      : isArabic
                      ? 'تم اكتمال الطلب بنجاح 🎉'
                      : 'Order completed 🎉'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs font-black text-lantern-red flex items-center gap-1 group-hover:underline">
                  <span>{isArabic ? 'عرض التتبع المباشر' : 'Track Live Status'}</span>
                  {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2 flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-stone-gray absolute top-3 start-3.5 pointer-events-none" />
            <input
              id="menu-search-input"
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isArabic
                  ? 'ابحث عن بيتزا حطب، برجر سماش، أجنحة، كركديه...'
                  : 'Search pizzas, smash burgers, wings, desserts...'
              }
              className={`w-full ps-10 pe-4 py-2.5 rounded-2xl text-xs font-semibold border transition-colors focus:outline-none focus:border-lantern-red ${
                isDark
                  ? 'bg-dark-surface-elevated border-dark-border text-evening-cream placeholder-stone-gray/60'
                  : 'bg-white border-[#DEC7B7] text-temple-brown placeholder-stone-gray/60 shadow-2xs'
              }`}
            />
          </div>

          {/* Dietary Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setDietaryFilter('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                dietaryFilter === 'ALL'
                  ? 'bg-lantern-red text-white border-lantern-red shadow-xs'
                  : isDark
                  ? 'bg-dark-surface border-dark-border text-evening-cream'
                  : 'bg-white border-stone-gray/20 text-stone-gray hover:text-temple-brown'
              }`}
            >
              {isArabic ? 'الكل' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setDietaryFilter('POPULAR')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                dietaryFilter === 'POPULAR'
                  ? 'bg-lantern-red text-white border-lantern-red shadow-xs'
                  : isDark
                  ? 'bg-dark-surface border-dark-border text-evening-cream'
                  : 'bg-white border-stone-gray/20 text-stone-gray hover:text-temple-brown'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{isArabic ? 'الأكثر طلباً' : 'Popular'}</span>
            </button>
            <button
              type="button"
              onClick={() => setDietaryFilter('SPICY')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                dietaryFilter === 'SPICY'
                  ? 'bg-lantern-red text-white border-lantern-red shadow-xs'
                  : isDark
                  ? 'bg-dark-surface border-dark-border text-evening-cream'
                  : 'bg-white border-stone-gray/20 text-stone-gray hover:text-temple-brown'
              }`}
            >
              <Flame className="w-3 h-3 text-red-500" />
              <span>{isArabic ? 'حار 🌶️' : 'Spicy'}</span>
            </button>
            <button
              type="button"
              onClick={() => setDietaryFilter('VEGETARIAN')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                dietaryFilter === 'VEGETARIAN'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : isDark
                  ? 'bg-dark-surface border-dark-border text-evening-cream'
                  : 'bg-white border-stone-gray/20 text-stone-gray hover:text-temple-brown'
              }`}
            >
              <span>🌱</span>
              <span>{isArabic ? 'نباتي' : 'Vegetarian'}</span>
            </button>
          </div>
        </div>

        {/* Sticky Category Navigation Bar */}
        <CategoryStickyBar
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={handleSelectCategory}
          isArabic={isArabic}
          isDark={isDark}
        />

        {/* Menu Categories Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
          {categories
            .filter((cat) => cat.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((category) => {
              const categoryItems = menuItems.filter(
                (item) => item.categoryId === category.id && filterItem(item)
              );

              if (categoryItems.length === 0) return null;

              return (
                <section
                  key={category.id}
                  id={`section-${category.id}`}
                  ref={(el) => (categoryRefs.current[category.id] = el)}
                  className="scroll-mt-36"
                >
                  {/* Category Section Header */}
                  <div className="flex items-center justify-between pb-3 mb-6 border-b border-black/10 dark:border-white/10">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                        <span>{isArabic ? category.nameAr : category.name}</span>
                      </h2>
                      <p className="text-xs text-stone-gray mt-0.5">
                        {isArabic
                          ? `${categoryItems.length} صنف محضر طازجاً عند الطلب`
                          : `${categoryItems.length} fresh artisanal items`}
                      </p>
                    </div>
                  </div>

                  {/* Grid of Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {categoryItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onSelectItem={onSelectItemForCustomization}
                        isArabic={isArabic}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
        </div>

        {/* 3. "Our Crust" Artisan Story Showcase Section */}
        <section
          id="our-crust-section"
          className={`max-w-7xl mx-auto mx-4 sm:mx-6 lg:mx-auto mb-16 p-6 sm:p-10 rounded-3xl border transition-colors ${
            isDark
              ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
              : 'bg-[#F6EEE7] border-[#EADBD0] text-temple-brown'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-lantern-red/10 text-lantern-red border border-lantern-red/20">
                <Wheat className="w-3.5 h-3.5" />
                <span>{isArabic ? 'سر عجينة فيست كرافت' : 'The 48-Hour Sourdough Secret'}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
                {isArabic
                  ? 'لماذا تختلف عجينة بيتزا فيست كرافت عن أي بيتزا أخرى؟'
                  : 'Why FeastCraft Crust Hits Different: 48-Hour Cold Fermentation'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-gray leading-relaxed">
                {isArabic
                  ? 'نستخدم دقيق القمح الإيطالي نمرة 00 مع خميرة طبيعية عمرها ٥ سنوات. نخمر العجينة على البارد لمدة ٤٨ ساعة لتفكيك السكريات المعقدة مما يمنحها قواماً خفيفاً سهل الهضم، وحوافاً مقرمشة منفوخة بفقاعات هوائية ذهبية عند خبزها في فرن الحطب الحجري.'
                  : 'We blend organic Tipo 00 Italian flour with our 5-year living sourdough starter. Cold-fermented for 48 uninterrupted hours to develop complex airy structure, crisp leopard-spotting, and supreme digestibility.'}
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-center">
                  <span className="block text-lg font-black font-mono text-lantern-red">48H</span>
                  <span className="text-[11px] font-bold text-stone-gray">{isArabic ? 'تخمير بارد' : 'Cold Ferment'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-center">
                  <span className="block text-lg font-black font-mono text-lantern-red">450°C</span>
                  <span className="text-[11px] font-bold text-stone-gray">{isArabic ? 'فرن حطب' : 'Stone Oven'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-center">
                  <span className="block text-lg font-black font-mono text-emerald-500">100%</span>
                  <span className="text-[11px] font-bold text-stone-gray">{isArabic ? 'مكونات طبيعية' : 'Digestible'}</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-4/3 lg:aspect-square">
              <img
                src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=800&auto=format&fit=crop"
                alt="Slow fermented artisan dough"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-bold text-white">
                  {isArabic ? '🍕 خبيز فوري على لهب الحطب' : '🍕 Blistered in 90 seconds'}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Bottom Cart Bar (Mobile & Quick Checkout) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))] left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-slideUp">
          <button
            type="button"
            onClick={onOpenCartDrawer}
            className="w-full py-3.5 px-5 rounded-2xl bg-lantern-red hover:bg-[#8B3426] text-white font-black text-sm shadow-2xl shadow-lantern-red/40 active:scale-98 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center font-mono text-xs">
                {totalCartCount}
              </div>
              <span>{isArabic ? 'عرض سلة الطلب' : 'View Cart & Order'}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-base">
              <span>{totalCartAmount.toFixed(0)}</span>
              <span className="text-xs font-normal">{isArabic ? 'ج.م' : 'EGP'}</span>
              {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
