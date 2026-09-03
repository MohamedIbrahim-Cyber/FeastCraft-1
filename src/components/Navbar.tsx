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
  ChefHat,
  ShieldCheck,
  Users,
  BarChart3,
  UtensilsCrossed,
  ExternalLink,
  CalendarCheck,
  Receipt,
} from 'lucide-react';
import { ThemeMode, Locale, FulfillmentType, DeliveryZone, ScreenId } from '../types';
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
  currentUser?: { id?: string; name?: string | null; email?: string | null; role?: string; phone?: string | null } | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  // Order Status Tracker
  onOpenOrderStatus?: () => void;
  hasActiveOrder?: boolean;
  activeOrderNumber?: string;
  // Custom overlay flag (defaults to floating over hero)
  isOverlay?: boolean;
  // Admin Mode Props
  isAdminView?: boolean;
  currentAdminScreen?: string;
  onNavigateAdmin?: (screen: ScreenId | 'menu-ordering') => void;
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
  isOverlay = true,
  isAdminView = false,
  currentAdminScreen = 'admin-kds',
  onNavigateAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
      id={isAdminView ? 'admin-main-header' : 'customer-public-header'}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 pt-safe ${
        isAdminView
          ? isDark
            ? 'bg-dark-surface/98 backdrop-blur-xl border-b border-dark-border text-evening-cream shadow-md'
            : 'bg-white/98 backdrop-blur-xl border-b border-[#E8D9CD] text-temple-brown shadow-xs'
          : isScrolled
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
        {/* 1. LEFT: FeastCraft Brand Logo & Admin / Customer Status */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            id="navbar-brand-logo"
            onClick={() => {
              setMobileMenuOpen(false);
              if (isAdminView) {
                onNavigateAdmin?.('admin-kds');
              } else {
                onLogoClick?.();
              }
            }}
            className="cursor-pointer flex items-center select-none flex-shrink-0 transition-opacity hover:opacity-90"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (isAdminView) onNavigateAdmin?.('admin-kds');
                else onLogoClick?.();
              }
            }}
          >
            <HeaderMark size="md" isArabic={isArabic} isDark={!isAdminView && !isScrolled && isOverlay ? true : isDark} />
          </div>

          {/* If in Admin view: Show Admin Operations badge instead of Delivery/Pickup Zone */}
          {isAdminView ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lantern-red/10 border border-lantern-red/30 text-lantern-red text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isArabic ? 'بوابة الإدارة والعمليات' : 'Admin Operations'}</span>
            </div>
          ) : (
            /* Quick Fulfillment Chip (Delivery/Pickup indicator) - ONLY for customer view */
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
          )}
        </div>

        {/* 2. CENTER: Navigation Links (Admin Features vs Customer Features) */}
        {isAdminView ? (
          <nav className="hidden xl:flex items-center gap-1 text-xs font-bold select-none">
            {/* Kitchen KDS */}
            <button
              id="admin-nav-kds"
              type="button"
              onClick={() => onNavigateAdmin?.('admin-kds')}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                currentAdminScreen === 'admin-kds'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : isDark
                  ? 'text-evening-cream hover:bg-white/10'
                  : 'text-temple-brown hover:bg-black/5'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>{isArabic ? 'المطبخ' : 'Kitchen KDS'}</span>
            </button>

            {/* Cashier POS */}
            <button
              id="admin-nav-cashier"
              type="button"
              onClick={() => onNavigateAdmin?.('admin-cashier')}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                currentAdminScreen === 'admin-cashier'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : isDark
                  ? 'text-evening-cream hover:bg-white/10'
                  : 'text-temple-brown hover:bg-black/5'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{isArabic ? 'الكاشير' : 'Cashier POS'}</span>
            </button>

            {/* Delivery Dispatch */}
            <button
              id="admin-nav-delivery"
              type="button"
              onClick={() => onNavigateAdmin?.('admin-delivery')}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                currentAdminScreen === 'admin-delivery'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : isDark
                  ? 'text-evening-cream hover:bg-white/10'
                  : 'text-temple-brown hover:bg-black/5'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>{isArabic ? 'التوصيل' : 'Delivery'}</span>
            </button>

            {/* Table Reservations */}
            <button
              id="admin-nav-reservations"
              type="button"
              onClick={() => onNavigateAdmin?.('admin-reservations')}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                currentAdminScreen === 'admin-reservations'
                  ? 'bg-purple-600 text-white shadow-xs font-black'
                  : isDark
                  ? 'text-evening-cream hover:bg-white/10'
                  : 'text-temple-brown hover:bg-black/5'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{isArabic ? 'الحجوزات' : 'Reservations'}</span>
            </button>

            {/* Menu CMS */}
            <button
              id="admin-nav-menu"
              type="button"
              onClick={() => onNavigateAdmin?.('admin-menu-cms')}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                currentAdminScreen === 'admin-menu-cms'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : isDark
                  ? 'text-evening-cream hover:bg-white/10'
                  : 'text-temple-brown hover:bg-black/5'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{isArabic ? 'المنيو' : 'Menu'}</span>
            </button>

            {/* Staff & Users */}
            <button
              id="admin-nav-users"
              type="button"
              onClick={() => onNavigateAdmin?.('admin-users')}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                currentAdminScreen === 'admin-users'
                  ? 'bg-lantern-red text-white shadow-xs font-black'
                  : isDark
                  ? 'text-evening-cream hover:bg-white/10'
                  : 'text-temple-brown hover:bg-black/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isArabic ? 'الموظفين' : 'Staff'}</span>
            </button>

            {/* Analytics */}
            <button
              id="admin-nav-analytics"
              type="button"
              onClick={() => onNavigateAdmin?.('admin-analytics')}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                currentAdminScreen === 'admin-analytics'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : isDark
                  ? 'text-evening-cream hover:bg-white/10'
                  : 'text-temple-brown hover:bg-black/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isArabic ? 'التقارير' : 'Analytics'}</span>
            </button>
          </nav>
        ) : (
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
          </nav>
        )}

        {/* 3. RIGHT: Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Admin Mode: Storefront preview button (replaces customer search button) */}
          {isAdminView ? (
            <button
              id="navbar-admin-storefront"
              type="button"
              onClick={() => onNavigateAdmin?.('menu-ordering')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-white/5 border-dark-border hover:bg-white/10 text-evening-cream'
                  : 'bg-stone-50 border-[#DEC7B7] hover:bg-stone-100 text-temple-brown shadow-2xs'
              }`}
              title={isArabic ? 'عرض متجر العملاء' : 'View Customer Storefront'}
            >
              <Store className="w-3.5 h-3.5 text-lantern-red" />
              <span>{isArabic ? 'عرض المتجر' : 'Storefront'}</span>
              <ExternalLink className="w-3 h-3 text-stone-gray opacity-70" />
            </button>
          ) : (
            /* Customer Search Trigger - ONLY in customer view */
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
          )}

          {/* Preferences Cluster: Language Switcher + Theme Switcher */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Language Switcher Pill */}
            <button
              id="navbar-language-chip"
              data-testid="navbar-locale-toggle"
              type="button"
              onClick={onToggleLocale}
              className={`h-9 sm:h-10 px-3 rounded-full flex items-center gap-1.5 border text-xs font-bold transition-all duration-200 cursor-pointer ${
                !isAdminView && !isScrolled && isOverlay
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
                !isAdminView && !isScrolled && isOverlay
                  ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                  : isDark
                  ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
                  : 'bg-white border-[#DEC7B7] text-temple-brown shadow-2xs'
              }`}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-lantern-red" />}
            </button>

            {/* Account / User / Profile Chip */}
            <div className="relative">
              <button
                id="navbar-profile-chip"
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 border text-xs font-bold transition-all duration-200 cursor-pointer ${
                  !isAdminView && hasActiveOrder
                    ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30'
                    : !isAdminView && !isScrolled && isOverlay
                    ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                    : isDark
                    ? 'bg-dark-surface-elevated border-dark-border text-evening-cream hover:border-lantern-red/40'
                    : 'bg-white border-[#DEC7B7] text-temple-brown hover:border-lantern-red/40 shadow-2xs'
                }`}
                title={currentUser ? currentUser.name || 'Account' : 'Account'}
              >
                {currentUser ? (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                    currentUser.role === 'ADMIN' ? 'bg-lantern-red' : currentUser.role === 'STAFF' ? 'bg-amber-600' : 'bg-lantern-red'
                  }`}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                ) : (
                  <User className="w-4 h-4 text-lantern-red" />
                )}

                <span className="hidden md:inline font-sans text-xs">
                  {currentUser ? currentUser.name?.split(' ')[0] : isArabic ? 'حسابي' : 'Account'}
                </span>

                {currentUser?.role && (
                  <span className={`hidden sm:inline px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-lantern-red/15 text-lantern-red border border-lantern-red/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    {currentUser.role}
                  </span>
                )}

                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isProfileMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  {/* Click-away backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />

                  <div
                    id="navbar-profile-dropdown"
                    className={`absolute end-0 top-full mt-2 w-80 sm:w-88 rounded-2xl p-4 shadow-2xl border backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                      isDark
                        ? 'bg-[#1C1816]/98 border-[#4A352A] text-[#FAF7F2]'
                        : 'bg-white/98 border-[#E8D9CD] text-[#2C2420]'
                    }`}
                  >
                    {/* Header: Profile Info */}
                    <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-xs ${
                          currentUser?.role === 'ADMIN' ? 'bg-lantern-red' : currentUser?.role === 'STAFF' ? 'bg-amber-600' : 'bg-lantern-red'
                        }`}>
                          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs">
                              {currentUser?.name || (isArabic ? 'عميل كـ ضيف' : 'Guest Customer')}
                            </span>
                            {currentUser?.role && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-lantern-red/10 text-lantern-red border border-lantern-red/20">
                                {currentUser.role}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-gray truncate max-w-[170px]">
                            {currentUser?.email || currentUser?.phone || (isArabic ? 'سجل لمتابعة وحفظ الطلبات' : 'Sign in to save orders')}
                          </div>
                        </div>
                      </div>

                      {!currentUser && onOpenAuthModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenAuthModal();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-lantern-red hover:bg-[#8B3426] text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          {isArabic ? 'دخول' : 'Sign In'}
                        </button>
                      )}
                    </div>

                    {/* Admin Mode: Admin Feature Shortcuts (NO CUSTOMER ORDERS / DELIVERY) */}
                    {isAdminView ? (
                      <div className="py-2.5 border-b border-black/5 dark:border-white/10 space-y-1">
                        <div className="text-[10px] font-bold text-stone-gray uppercase tracking-wider mb-1 px-1">
                          {isArabic ? 'أقسام الإدارة والعمليات' : 'Admin Operations Shortcuts'}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigateAdmin?.('admin-kds');
                          }}
                          className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            currentAdminScreen === 'admin-kds'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                            <span>{isArabic ? 'شاشة تحضير المطبخ KDS' : 'Kitchen KDS Display'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-gray">Live</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigateAdmin?.('admin-cashier');
                          }}
                          className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            currentAdminScreen === 'admin-cashier'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{isArabic ? 'نقطة البيع والكاشير POS' : 'Cashier POS Terminal'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-gray">In-Store</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigateAdmin?.('admin-delivery');
                          }}
                          className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            currentAdminScreen === 'admin-delivery'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Bike className="w-3.5 h-3.5 text-blue-500" />
                            <span>{isArabic ? 'إدارة التوصيل والمندوبين' : 'Delivery Dispatch & Drivers'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-gray">Fleet</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigateAdmin?.('admin-reservations');
                          }}
                          className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            currentAdminScreen === 'admin-reservations'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CalendarCheck className="w-3.5 h-3.5 text-purple-500" />
                            <span>{isArabic ? 'حجوزات الطاولات والصالة' : 'Table Reservations'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-gray">Tables</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigateAdmin?.('admin-menu-cms');
                          }}
                          className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            currentAdminScreen === 'admin-menu-cms'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
                            <span>{isArabic ? 'إدارة المنيو والأسعار' : 'Menu Catalog CMS'}</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigateAdmin?.('admin-users');
                          }}
                          className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            currentAdminScreen === 'admin-users'
                              ? 'bg-lantern-red/15 text-lantern-red font-bold'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-lantern-red" />
                            <span>{isArabic ? 'حسابات الموظفين والصلاحيات' : 'Staff Accounts & Roles'}</span>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">Bcrypt</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigateAdmin?.('admin-analytics');
                          }}
                          className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            currentAdminScreen === 'admin-analytics'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                            <span>{isArabic ? 'التقارير والمبيعات' : 'Reports & Analytics'}</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigateAdmin?.('menu-ordering');
                          }}
                          className="w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-gray hover:text-black dark:hover:text-white"
                        >
                          <div className="flex items-center gap-2">
                            <Store className="w-3.5 h-3.5 text-lantern-red" />
                            <span>{isArabic ? 'العودة للمتجر للعملاء' : 'Back to Storefront'}</span>
                          </div>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      /* Customer Mode: ORDERED ORDERS & LIVE TRACKING SECTION */
                      <>
                        <div className="py-3 border-b border-black/5 dark:border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <Clock className="w-3.5 h-3.5 text-lantern-red" />
                              <span>{isArabic ? 'طلباتي وحالة التوصيل' : 'My Orders & Live Tracking'}</span>
                            </div>
                            {hasActiveOrder && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {isArabic ? 'طلب نشط' : 'Active'}
                              </span>
                            )}
                          </div>

                          {hasActiveOrder ? (
                            <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                                  {activeOrderNumber || '#FC-ACTIVE'}
                                </span>
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  {isArabic ? 'جاري التحضير والتوصيل' : 'In Kitchen / Preparing'}
                                </span>
                              </div>
                              {onOpenOrderStatus && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsProfileMenuOpen(false);
                                    onOpenOrderStatus();
                                  }}
                                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{isArabic ? 'عرض مسار الطلب المباشر' : 'View Live Order Status'}</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-[11px] text-stone-gray">
                                {isArabic
                                  ? 'تابع حالة أي طلب سابق أو جارٍ برقم الفاتورة.'
                                  : 'Track any current or previous order using your order number.'}
                              </p>
                              {onOpenOrderStatus && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsProfileMenuOpen(false);
                                    onOpenOrderStatus();
                                  }}
                                  className="w-full py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Clock className="w-3.5 h-3.5 text-lantern-red" />
                                  <span>{isArabic ? 'البحث عن طلب / تتبع طلباتي' : 'Lookup & Track Orders'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Customer Mode: Delivery Location Shortcut */}
                        <div className="py-2.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {fulfillmentType === 'DELIVERY' ? (
                              <Bike className="w-3.5 h-3.5 text-lantern-red" />
                            ) : (
                              <Store className="w-3.5 h-3.5 text-lantern-red" />
                            )}
                            <span className="text-stone-gray">
                              {fulfillmentType === 'DELIVERY'
                                ? selectedZone
                                  ? isArabic
                                    ? selectedZone.zoneNameAr
                                    : selectedZone.zoneName
                                  : isArabic
                                  ? 'توصيل'
                                  : 'Delivery'
                                : isArabic
                                ? 'استلام من الفرع'
                                : 'Pickup'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              onOpenZoneModal();
                            }}
                            className="text-[11px] text-lantern-red hover:underline font-bold cursor-pointer"
                          >
                            {isArabic ? 'تغيير' : 'Change'}
                          </button>
                        </div>
                      </>
                    )}

                    {/* Quick Preferences (Language + Theme) */}
                    <div className="pt-2.5 pb-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onToggleLocale();
                        }}
                        className="flex-1 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Globe className="w-3 h-3 text-lantern-red" />
                        <span>{locale === 'en' ? 'العربية' : 'English'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onToggleTheme();
                        }}
                        className="flex-1 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        {isDark ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-lantern-red" />}
                        <span>{isDark ? 'Light' : 'Dark'}</span>
                      </button>
                    </div>

                    {/* Sign Out action (if logged in) */}
                    {currentUser && onLogout && (
                      <div className="pt-2 border-t border-black/5 dark:border-white/10 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Chip 3: Cart Button - ONLY in customer view, REMOVED in admin view */}
          {!isAdminView && (
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
          )}

          {/* Mobile Hamburger Button */}
          <button
            id="navbar-mobile-hamburger"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-9 h-9 rounded-full lg:hidden flex items-center justify-center border transition-colors cursor-pointer ${
              !isAdminView && !isScrolled && isOverlay
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
          {/* Admin Mode Mobile Menu */}
          {isAdminView ? (
            <>
              {/* Admin Portal Header Banner */}
              <div className="p-3.5 rounded-2xl bg-lantern-red/10 border border-lantern-red/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-lantern-red text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">
                      {isArabic ? 'بوابة العمليات والإدارة' : 'Admin Operations Portal'}
                    </span>
                    <span className="text-[10px] text-stone-gray block">
                      {currentUser?.email || 'Logged in Staff/Admin'}
                    </span>
                  </div>
                </div>

                {currentUser?.role && (
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-lantern-red text-white">
                    {currentUser.role}
                  </span>
                )}
              </div>

              {/* Admin Features Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-kds');
                  }}
                  className={`p-3 rounded-xl border text-start flex flex-col gap-1 transition-all cursor-pointer ${
                    currentAdminScreen === 'admin-kds'
                      ? 'bg-amber-500 text-white border-amber-600 font-bold'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  <span className="text-xs">{isArabic ? 'شاشة المطبخ KDS' : 'Kitchen KDS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-cashier');
                  }}
                  className={`p-3 rounded-xl border text-start flex flex-col gap-1 transition-all cursor-pointer ${
                    currentAdminScreen === 'admin-cashier'
                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span className="text-xs">{isArabic ? 'الكاشير POS' : 'Cashier POS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-delivery');
                  }}
                  className={`p-3 rounded-xl border text-start flex flex-col gap-1 transition-all cursor-pointer ${
                    currentAdminScreen === 'admin-delivery'
                      ? 'bg-blue-600 text-white border-blue-700 font-bold'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span className="text-xs">{isArabic ? 'إدارة التوصيل' : 'Delivery Fleet'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-reservations');
                  }}
                  className={`p-3 rounded-xl border text-start flex flex-col gap-1 transition-all cursor-pointer ${
                    currentAdminScreen === 'admin-reservations'
                      ? 'bg-purple-600 text-white border-purple-700 font-bold'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span className="text-xs">{isArabic ? 'حجوزات الصالة' : 'Reservations'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-menu-cms');
                  }}
                  className={`p-3 rounded-xl border text-start flex flex-col gap-1 transition-all cursor-pointer ${
                    currentAdminScreen === 'admin-menu-cms'
                      ? 'bg-amber-500 text-white border-amber-600 font-bold'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span className="text-xs">{isArabic ? 'إدارة المنيو' : 'Menu CMS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-users');
                  }}
                  className={`p-3 rounded-xl border text-start flex flex-col gap-1 transition-all cursor-pointer ${
                    currentAdminScreen === 'admin-users'
                      ? 'bg-lantern-red text-white border-lantern-red font-bold'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-xs">{isArabic ? 'الموظفين والحسابات' : 'Users & Staff'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAdmin?.('admin-analytics');
                  }}
                  className={`p-3 rounded-xl border text-start flex flex-col gap-1 transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                    currentAdminScreen === 'admin-analytics'
                      ? 'bg-amber-500 text-white border-amber-600 font-bold'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs">{isArabic ? 'التقارير والمبيعات' : 'Analytics'}</span>
                </button>
              </div>

              {/* Quick Link to Customer Storefront */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateAdmin?.('menu-ordering');
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Store className="w-4 h-4 text-lantern-red" />
                <span>{isArabic ? 'العودة لمتجر العملاء (Storefront)' : 'Back to Customer Storefront'}</span>
              </button>
            </>
          ) : (
            /* Customer Mode Mobile Menu */
            <>
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
              <div className="grid grid-cols-3 gap-2 pt-2">
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
                  🔥 {isArabic ? 'العروض' : 'Deals'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOurCrustClick?.();
                  }}
                  className="p-3 rounded-xl border border-black/5 dark:border-white/5 text-center font-bold text-xs hover:bg-lantern-red/10 transition-colors"
                >
                  ✨ {isArabic ? 'العجينة' : 'Crust'}
                </button>
              </div>

              {/* Profile & My Orders Mobile Card */}
              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-lantern-red text-white flex items-center justify-center font-bold text-xs">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">
                        {currentUser?.name || (isArabic ? 'حسابي / طلباتي' : 'My Account & Orders')}
                      </span>
                      <span className="text-[10px] text-stone-gray block">
                        {currentUser?.email || (isArabic ? 'متابعة الطلبات المباشرة' : 'Track live and past orders')}
                      </span>
                    </div>
                  </div>

                  {!currentUser && onOpenAuthModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="px-3 py-1 rounded-xl bg-lantern-red text-white text-xs font-bold"
                    >
                      {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                    </button>
                  )}
                </div>

                {/* Mobile Orders & Tracking Trigger */}
                {onOpenOrderStatus && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenOrderStatus();
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                      hasActiveOrder
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-dark-surface border-black/10 dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-lantern-red" />
                      <span>
                        {hasActiveOrder
                          ? isArabic
                            ? `طلب نشط: ${activeOrderNumber || 'جاري التحضير'}`
                            : `Active Order: ${activeOrderNumber || 'Preparing'}`
                          : isArabic
                          ? 'طلباتي وتتبع الفواتير'
                          : 'My Orders & Order Tracker'}
                      </span>
                    </div>
                    {hasActiveOrder && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Utilities Row: Theme & Auth */}
          <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleTheme}
                className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-lantern-red" />}
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleLocale}
                className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-lantern-red" />
                <span>{locale === 'en' ? 'عربي' : 'EN'}</span>
              </button>
            </div>

            {currentUser && onLogout && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="text-rose-500 text-xs font-bold hover:underline cursor-pointer"
              >
                {isArabic ? 'خروج' : 'Logout'}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

