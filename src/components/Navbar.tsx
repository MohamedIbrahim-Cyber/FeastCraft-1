import React, { useState, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Globe,
  ShoppingBag,
  Bike,
  Store,
  User,
  LogOut,
  ChevronDown,
  Clock,
  Menu as MenuIcon,
  X,
  Sparkles,
  Flame,
} from 'lucide-react';
import { ThemeMode, Locale, FulfillmentType, DeliveryZone } from '../types';
import { HeaderMark } from './HeaderMark';

interface NavbarProps {
  onLogoClick?: () => void;
  onMenuClick?: () => void;
  onDealsClick?: () => void;
  onOurCrustClick?: () => void;
  onSearchClick?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  locale: Locale;
  onToggleLocale: () => void;
  // Fast Casual Customer Props
  cartItemCount: number;
  cartTotalAmount: number;
  onOpenCartDrawer: () => void;
  fulfillmentType: FulfillmentType;
  selectedZone: DeliveryZone | null;
  onOpenZoneModal: () => void;
  // User Auth State
  currentUser?: { name?: string | null; email?: string | null; role?: string } | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  // Order Status Tracker
  onOpenOrderStatus?: () => void;
  hasActiveOrder?: boolean;
  activeOrderNumber?: string;
  // Admin portal navigation
  isAdminView?: boolean;
  onToggleAdmin?: () => void;
  // Custom overlay flag (defaults to floating over hero)
  isOverlay?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLogoClick,
  onMenuClick,
  onDealsClick,
  onOurCrustClick,
  onSearchClick,
  theme,
  onToggleTheme,
  locale,
  onToggleLocale,
  cartItemCount,
  cartTotalAmount,
  onOpenCartDrawer,
  fulfillmentType,
  selectedZone,
  onOpenZoneModal,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenOrderStatus,
  hasActiveOrder = false,
  activeOrderNumber,
  isAdminView = false,
  onToggleAdmin,
  isOverlay = true,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === 'dark';
  const isArabic = locale === 'ar';

  // Listen to scroll to adjust background intensity if needed
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="customer-public-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isDark
            ? 'bg-dark-surface/95 backdrop-blur-xl border-b border-dark-border text-evening-cream shadow-md'
            : 'bg-white/95 backdrop-blur-xl border-b border-[#E8D9CD] text-temple-brown shadow-sm'
          : isOverlay
          ? 'bg-black/25 backdrop-blur-md border-b border-white/10 text-white'
          : isDark
          ? 'bg-dark-surface/90 backdrop-blur-xl border-b border-dark-border text-evening-cream'
          : 'bg-[#FCF8F5]/90 backdrop-blur-xl border-b border-[#E8D9CD] text-temple-brown'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* 1. LEFT: FeastCraft Brand Logo & Chef Silhouette */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <div
            id="navbar-brand-logo"
            onClick={() => {
              setMobileMenuOpen(false);
              onLogoClick?.();
            }}
            className="cursor-pointer flex items-center select-none flex-shrink-0 transition-opacity hover:opacity-90"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onLogoClick?.();
            }}
          >
            <HeaderMark size="md" isArabic={isArabic} isDark={!isScrolled && isOverlay ? true : isDark} />
          </div>

          {/* Quick Fulfillment Chip (Delivery/Pickup indicator) */}
          <button
            id="navbar-fulfillment-toggle"
            type="button"
            onClick={onOpenZoneModal}
            className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer ${
              !isScrolled && isOverlay
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-evening-cream'
                : isDark
                ? 'bg-dark-surface-elevated/80 border-dark-border hover:border-lantern-red/50 text-evening-cream'
                : 'bg-white/80 border-[#E2D3C7] hover:border-lantern-red/40 text-temple-brown shadow-2xs'
            }`}
            title="Change Delivery Zone or Mode"
          >
            <div className="w-5 h-5 rounded-full bg-lantern-red text-white flex items-center justify-center flex-shrink-0">
              {fulfillmentType === 'DELIVERY' ? <Bike className="w-3 h-3" /> : <Store className="w-3 h-3" />}
            </div>
            <div className="text-start leading-tight min-w-0">
              <span className="text-[11px] font-bold truncate max-w-[120px] block">
                {fulfillmentType === 'DELIVERY'
                  ? selectedZone
                    ? isArabic
                      ? selectedZone.zoneNameAr
                      : selectedZone.zoneName
                    : isArabic
                    ? 'اختر المنطقة'
                    : 'Select Zone'
                  : isArabic
                  ? 'فرع وسط البلد'
                  : 'Downtown Branch'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-stone-gray opacity-80" />
          </button>
        </div>

        {/* 2. CENTER: Clean Uppercase Navigation Text Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold tracking-widest uppercase select-none">
          <button
            id="nav-link-menu"
            type="button"
            onClick={onMenuClick}
            className={`transition-colors duration-200 cursor-pointer hover:text-faded-coral ${
              !isScrolled && isOverlay ? 'text-white/90' : isDark ? 'text-evening-cream' : 'text-temple-brown'
            }`}
          >
            {isArabic ? 'القائمة' : 'MENU'}
          </button>

          <button
            id="nav-link-deals"
            type="button"
            onClick={onDealsClick}
            className={`transition-colors duration-200 cursor-pointer flex items-center gap-1.5 hover:text-faded-coral ${
              !isScrolled && isOverlay ? 'text-white/90' : isDark ? 'text-evening-cream' : 'text-temple-brown'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-lantern-red" />
            <span>{isArabic ? 'العروض' : 'DEALS'}</span>
          </button>

          <button
            id="nav-link-crust"
            type="button"
            onClick={onOurCrustClick}
            className={`transition-colors duration-200 cursor-pointer flex items-center gap-1.5 hover:text-faded-coral ${
              !isScrolled && isOverlay ? 'text-white/90' : isDark ? 'text-evening-cream' : 'text-temple-brown'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isArabic ? 'سر العجينة' : 'OUR CRUST'}</span>
          </button>

          {onOpenOrderStatus && (
            <button
              id="nav-link-track-order"
              type="button"
              onClick={onOpenOrderStatus}
              className={`relative transition-colors duration-200 cursor-pointer flex items-center gap-1.5 hover:text-faded-coral ${
                hasActiveOrder
                  ? 'text-lantern-red font-bold'
                  : !isScrolled && isOverlay
                  ? 'text-white/90'
                  : isDark
                  ? 'text-evening-cream'
                  : 'text-temple-brown'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-lantern-red" />
              <span>
                {hasActiveOrder
                  ? isArabic
                    ? `تتبع الطلب ${activeOrderNumber || ''}`
                    : `TRACK ${activeOrderNumber || 'ORDER'}`
                  : isArabic
                  ? 'تتبع الطلب'
                  : 'TRACK ORDER'}
              </span>
              {hasActiveOrder && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          )}

          {/* Admin / Kitchen Portal Shortcut */}
          {onToggleAdmin && (
            <button
              id="nav-link-admin"
              type="button"
              onClick={onToggleAdmin}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                isAdminView
                  ? 'bg-amber-500 text-white border-amber-600'
                  : !isScrolled && isOverlay
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  : isDark
                  ? 'bg-dark-surface-elevated hover:bg-dark-surface-elevated/80 border-dark-border text-evening-cream'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
              }`}
              title="Kitchen Portal"
            >
              🧑‍🍳 {isAdminView ? (isArabic ? 'المتجر' : 'Store') : isArabic ? 'المطبخ' : 'Kitchen'}
            </button>
          )}
        </nav>

        {/* 3. RIGHT: Action Cluster with 3 Circular Pill Buttons/Chips */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Action Chip 1: Search Trigger */}
          <button
            id="navbar-search-trigger"
            type="button"
            onClick={onSearchClick}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
              !isScrolled && isOverlay
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white hover:text-faded-coral'
                : isDark
                ? 'bg-dark-surface-elevated border-dark-border text-evening-cream hover:text-lantern-red hover:border-lantern-red/40'
                : 'bg-white border-[#DEC7B7] text-temple-brown hover:text-lantern-red hover:border-lantern-red/40 shadow-2xs'
            }`}
            title={isArabic ? 'بحث في القائمة' : 'Search Menu'}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Action Chip 2: Theme / Language / Account Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Language Switcher Pill */}
            <button
              id="navbar-language-chip"
              data-testid="navbar-locale-toggle"
              type="button"
              onClick={onToggleLocale}
              className={`h-9 sm:h-10 px-3 rounded-full flex items-center gap-1.5 border text-xs font-bold transition-all duration-200 cursor-pointer ${
                !isScrolled && isOverlay
                  ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                  : isDark
                  ? 'bg-dark-surface-elevated border-dark-border text-evening-cream hover:border-lantern-red/40'
                  : 'bg-white border-[#DEC7B7] text-temple-brown hover:border-lantern-red/40 shadow-2xs'
              }`}
              title="Switch Language (AR / ENG)"
            >
              <Globe className="w-3.5 h-3.5 text-lantern-red" />
              <span>{locale === 'en' ? 'عربي' : 'EN'}</span>
            </button>

            {/* Theme Toggle Chip */}
            <button
              id="navbar-theme-chip"
              data-testid="navbar-theme-toggle"
              type="button"
              onClick={onToggleTheme}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full hidden sm:flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                !isScrolled && isOverlay
                  ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                  : isDark
                  ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
                  : 'bg-white border-[#DEC7B7] text-temple-brown shadow-2xs'
              }`}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-lantern-red" />}
            </button>

            {/* Account / User Chip */}
            {currentUser ? (
              <div className="flex items-center gap-1 bg-black/20 dark:bg-white/5 px-2 py-1 rounded-full border border-white/10">
                <div className="w-7 h-7 rounded-full bg-lantern-red text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Sign out"
                    className="p-1 text-stone-gray hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  id="navbar-auth-chip"
                  type="button"
                  onClick={onOpenAuthModal}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full hidden sm:flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                    !isScrolled && isOverlay
                      ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                      : isDark
                      ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
                      : 'bg-white border-[#DEC7B7] text-temple-brown shadow-2xs'
                  }`}
                  title="Sign In"
                >
                  <User className="w-4 h-4 text-lantern-red" />
                </button>
              )
            )}
          </div>

          {/* Action Chip 3: Cart Button with Dynamic Badge & Total */}
          <button
            id="navbar-cart-button"
            data-testid="navbar-cart-trigger"
            type="button"
            onClick={onOpenCartDrawer}
            className="group relative px-3.5 sm:px-4 h-9 sm:h-10 rounded-full bg-lantern-red hover:bg-[#8B3426] text-white font-bold text-xs shadow-md shadow-lantern-red/30 hover:shadow-lg hover:shadow-lantern-red/40 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer flex-shrink-0"
            title="View Order Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:-rotate-6" />
              {cartItemCount > 0 && (
                <span
                  id="navbar-cart-badge"
                  className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-temple-brown font-mono font-black text-[10px] flex items-center justify-center shadow-sm border border-white dark:border-dark-surface animate-in fade-in zoom-in-75 duration-200"
                >
                  {cartItemCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 font-sans">
              <span className="font-bold hidden xs:inline">
                {isArabic ? 'السلة' : 'Cart'}
              </span>
              {cartTotalAmount > 0 ? (
                <>
                  <span className="text-white/60 hidden sm:inline">•</span>
                  <span className="font-mono font-black text-xs">
                    {cartTotalAmount.toFixed(0)} {isArabic ? 'ج.م' : 'EGP'}
                  </span>
                </>
              ) : null}
            </div>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            id="navbar-mobile-hamburger"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-9 h-9 rounded-full lg:hidden flex items-center justify-center border transition-colors cursor-pointer ${
              !isScrolled && isOverlay
                ? 'bg-white/10 border-white/15 text-white'
                : isDark
                ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
                : 'bg-white border-[#DEC7B7] text-temple-brown shadow-2xs'
            }`}
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Overlay Menu */}
      {mobileMenuOpen && (
        <div
          id="navbar-mobile-overlay-menu"
          className={`lg:hidden border-b px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200 ${
            isDark
              ? 'bg-dark-surface border-dark-border text-evening-cream'
              : 'bg-[#FCF8F5] border-[#E8D9CD] text-temple-brown'
          }`}
        >
          {/* Quick Fulfillment Zone on Mobile */}
          <div
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenZoneModal();
            }}
            className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-lantern-red/10 text-lantern-red flex items-center justify-center">
                {fulfillmentType === 'DELIVERY' ? <Bike className="w-4 h-4" /> : <Store className="w-4 h-4" />}
              </div>
              <div className="text-start">
                <span className="text-[10px] text-stone-gray block">
                  {fulfillmentType === 'DELIVERY' ? (isArabic ? 'توصيل إلى' : 'Delivery to') : (isArabic ? 'استلام من' : 'Pickup at')}
                </span>
                <span className="text-xs font-bold">
                  {fulfillmentType === 'DELIVERY'
                    ? selectedZone
                      ? isArabic
                        ? selectedZone.zoneNameAr
                        : selectedZone.zoneName
                      : isArabic
                      ? 'اختر المنطقة'
                      : 'Select Zone'
                    : isArabic
                    ? 'فرع وسط البلد'
                    : 'Downtown Branch'}
                </span>
              </div>
            </div>
            <span className="text-xs text-lantern-red font-bold underline">
              {isArabic ? 'تغيير' : 'Change'}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onMenuClick?.();
              }}
              className="p-3 rounded-xl border border-black/5 dark:border-white/5 text-center font-bold text-xs hover:bg-lantern-red/10 transition-colors"
            >
              🍕 {isArabic ? 'القائمة' : 'Menu'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onDealsClick?.();
              }}
              className="p-3 rounded-xl border border-black/5 dark:border-white/5 text-center font-bold text-xs hover:bg-lantern-red/10 transition-colors"
            >
              🔥 {isArabic ? 'العروض والكومبو' : 'Deals & Combos'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOurCrustClick?.();
              }}
              className="p-3 rounded-xl border border-black/5 dark:border-white/5 text-center font-bold text-xs hover:bg-lantern-red/10 transition-colors"
            >
              ✨ {isArabic ? 'سر العجينة ٤٨ ساعة' : 'Our 48H Crust'}
            </button>
            {onOpenOrderStatus && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenOrderStatus();
                }}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                  hasActiveOrder
                    ? 'bg-lantern-red/15 border-lantern-red/40 text-lantern-red'
                    : 'border-black/5 dark:border-white/5 hover:bg-lantern-red/10'
                }`}
              >
                ⏱️ {isArabic ? 'تتبع حالة الطلب' : 'Track Order'}
              </button>
            )}
          </div>

          {/* Utilities Row: Theme & Auth */}
          <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleTheme}
                className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-lantern-red" />}
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold">{currentUser.name}</span>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-red-500 font-bold"
                  >
                    {isArabic ? 'خروج' : 'Logout'}
                  </button>
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-lantern-red text-white text-xs font-bold"
                >
                  {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};
