import React from 'react';
import { HeroSection } from '../../components/consumer/HeroSection';
import { Navbar } from '../../components/Navbar';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, INITIAL_DELIVERY_ZONES } from '../../data/mockData';

export default function CustomerLandingPage() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [locale, setLocale] = React.useState<'en' | 'ar'>('en');
  const [cartCount, setCartCount] = React.useState(0);
  const [cartTotal, setCartTotal] = React.useState(0);

  const isArabic = locale === 'ar';
  const isDark = theme === 'dark';

  const handleScrollToMenu = () => {
    const el = document.getElementById('menu-catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className={`min-h-screen ${isDark ? 'bg-dark-surface text-evening-cream' : 'bg-[#FCF8F5] text-temple-brown'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Floating Transparent Header Bar */}
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        locale={locale}
        onToggleLocale={() => setLocale(l => l === 'en' ? 'ar' : 'en')}
        cartItemCount={cartCount}
        cartTotalAmount={cartTotal}
        onOpenCartDrawer={() => {}}
        fulfillmentType="DELIVERY"
        selectedZone={INITIAL_DELIVERY_ZONES[0]}
        onOpenZoneModal={() => {}}
        onMenuClick={handleScrollToMenu}
        onOrderNowClick={handleScrollToMenu}
        onSearchClick={() => {
          const input = document.getElementById('menu-search-input');
          input?.focus();
        }}
        isOverlay={true}
      />

      {/* Redesigned Full-Bleed Atmospheric Hero Section */}
      <HeroSection
        onOrderNowClick={handleScrollToMenu}
        onExploreCrustClick={() => {
          const el = document.getElementById('our-crust-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onDealsClick={() => {
          const el = document.getElementById('section-cat-deals');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        fulfillmentType="DELIVERY"
        selectedZone={INITIAL_DELIVERY_ZONES[0]}
        onOpenZoneModal={() => {}}
        isArabic={isArabic}
        isDark={isDark}
      />
    </main>
  );
}
