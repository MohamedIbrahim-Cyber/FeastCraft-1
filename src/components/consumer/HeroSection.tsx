import React from 'react';
import {
  Flame,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  Bike,
  Store,
  ShieldCheck,
  MapPin,
  ArrowDown,
} from 'lucide-react';
import { FulfillmentType, DeliveryZone } from '../../types';

interface HeroSectionProps {
  onOrderNowClick: () => void;
  onExploreCrustClick?: () => void;
  onDealsClick?: () => void;
  fulfillmentType: FulfillmentType;
  selectedZone: DeliveryZone | null;
  onOpenZoneModal: () => void;
  isArabic: boolean;
  isDark: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOrderNowClick,
  onExploreCrustClick,
  onDealsClick,
  fulfillmentType,
  selectedZone,
  onOpenZoneModal,
  isArabic,
  isDark,
}) => {
  return (
    <section
      id="feastcraft-landing-hero"
      className="relative w-full min-h-[85vh] md:min-h-[90vh] flex flex-col justify-between overflow-hidden bg-black text-white select-none"
    >
      {/* 1. Full-Bleed Atmospheric Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2160&auto=format&fit=crop"
          alt="Artisanal Wood-Fired FeastCraft Pizza"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />

        {/* 2. Deep Directional Vignette & Gradient Overlays (WCAG AA Contrast Guarantee) */}
        {/* Desktop Directional Gradient (Left-to-Right for LTR, Right-to-Left for RTL) */}
        <div
          className={`absolute inset-0 hidden sm:block ${
            isArabic
              ? 'bg-gradient-to-l from-black/92 via-black/60 to-black/20'
              : 'bg-gradient-to-r from-black/92 via-black/60 to-black/20'
          }`}
        />

        {/* Mobile Vertical Gradient (Bottom-to-Top to anchor bottom copy) */}
        <div className="absolute inset-0 sm:hidden bg-gradient-to-t from-black/95 via-black/65 to-black/30" />

        {/* Cinematic Bottom Dark Edge to blend smoothly into menu content */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Top Vignette for Floating Navigation Bar Contrast */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Spacer to push content below the floating navbar */}
      <div className="pt-24 sm:pt-28 md:pt-32" />

      {/* 3. Hero Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className={`max-w-3xl ${isArabic ? 'text-right ms-auto' : 'text-left'}`}>
          {/* Brand Kicker / Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-evening-cream text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-lantern-red" />
            <Flame className="w-3.5 h-3.5 text-lantern-red" />
            <span>
              {isArabic ? 'فرن حطب إيطالي ٤٥٠° مئوية' : '450°C Wood-Fired Stone Oven'}
            </span>
          </div>

          {/* Bold Stacked Headline */}
          <h1 className="font-display font-black tracking-tight leading-[0.92] text-evening-cream text-4xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-md">
            {isArabic ? (
              <>
                <span className="block text-white">عجينتنا،</span>
                <span className="block text-evening-cream">سر صنعتنا.</span>
              </>
            ) : (
              <>
                <span className="block text-white">CRAFTED WITH</span>
                <span className="block text-evening-cream">OBSESSION.</span>
              </>
            )}
          </h1>

          {/* Subtitle / Value Proposition Description */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-evening-cream/90 font-sans font-normal leading-relaxed max-w-xl drop-shadow-sm">
            {isArabic
              ? 'عجينة مخمرة ببطء لمدة ٤٨ ساعة ومخبوزة في أفران حطب الزيتون بدرجة ٤٥٠ مئوية مع جبن البافلو الطازج وصلصة سان مارزانو الإيطالية. توصيل فوري ساخن خلال ٣٥ دقيقة.'
              : '48-hour slow-fermented sourdough, blistered in a 450°C stone oven, topped with raw San Marzano tomatoes and molten buffalo mozzarella. Delivered hot in under 35 minutes.'}
          </p>

          {/* Primary CTA & Actions Cluster */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Primary Pill Button */}
            <button
              id="hero-order-now-button"
              type="button"
              onClick={onOrderNowClick}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 rounded-full bg-evening-cream hover:bg-white text-temple-brown font-display font-black text-sm sm:text-base tracking-wide uppercase shadow-lg shadow-black/40 hover:shadow-lantern-red/30 transition-all duration-200 transform hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              <span>{isArabic ? 'اطلب الآن' : 'ORDER NOW'}</span>
              <div className="w-6 h-6 rounded-full bg-temple-brown text-evening-cream flex items-center justify-center group-hover:bg-lantern-red group-hover:text-white transition-colors duration-200">
                {isArabic ? (
                  <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
                ) : (
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
            </button>

            {/* Secondary Action: Our Crust or Deals */}
            {onExploreCrustClick && (
              <button
                id="hero-our-crust-button"
                type="button"
                onClick={onExploreCrustClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-evening-cream hover:text-white font-sans font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-lantern-red" />
                <span>{isArabic ? 'سر العجينة ٤٨ ساعة' : 'Our 48H Crust'}</span>
              </button>
            )}

            {onDealsClick && (
              <button
                id="hero-deals-button"
                type="button"
                onClick={onDealsClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-lantern-red/80 hover:bg-lantern-red text-white font-sans font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 cursor-pointer shadow-sm"
              >
                <Flame className="w-4 h-4" />
                <span>{isArabic ? 'عروض التوفير' : 'Hot Deals'}</span>
              </button>
            )}
          </div>

          {/* Value Proposition Badges */}
          <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-evening-cream/80 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-lantern-red/20 text-lantern-red flex items-center justify-center">
                <Flame className="w-3 h-3" />
              </div>
              <span>{isArabic ? 'تخمير طبيعي ٤٨ ساعة' : '48H Sourdough Fermentation'}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Clock className="w-3 h-3" />
              </div>
              <span>{isArabic ? 'توصيل ساخن < ٣٥ دقيقة' : 'Under 35 Mins Hot Delivery'}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <span>{isArabic ? 'مكونات إيطالية معتمدة ١٠٠٪' : '100% Certified Italian Flour'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Floating Quick Fulfillment Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 w-full">
        <div className="p-3 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-evening-cream shadow-xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-xl bg-lantern-red/20 text-lantern-red flex items-center justify-center shrink-0">
              {fulfillmentType === 'DELIVERY' ? <Bike className="w-4 h-4" /> : <Store className="w-4 h-4" />}
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-stone-gray uppercase tracking-wider block font-semibold">
                {fulfillmentType === 'DELIVERY'
                  ? isArabic
                    ? 'التوصيل المباشر إلى'
                    : 'Fast Delivery to'
                  : isArabic
                  ? 'الاستلام السريع من'
                  : 'Quick Pickup at'}
              </span>
              <span className="font-bold text-evening-cream text-xs sm:text-sm">
                {fulfillmentType === 'DELIVERY'
                  ? selectedZone
                    ? isArabic
                      ? selectedZone.zoneNameAr
                      : selectedZone.zoneName
                    : isArabic
                    ? 'اختر منطقتك بالقاهرة'
                    : 'Select Your Delivery Zone'
                  : isArabic
                  ? 'فرع وسط البلد (شارع طلعت حرب)'
                  : 'Downtown Flagship Branch'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {fulfillmentType === 'DELIVERY'
                  ? `${selectedZone?.estimatedMinutes || 35} ${isArabic ? 'دقيقة للتوصيل' : 'mins ETA'}`
                  : isArabic
                  ? '١٥ دقيقة للاستلام'
                  : '15 mins Pickup'}
              </span>
            </span>

            <button
              id="hero-change-zone-button"
              type="button"
              onClick={onOpenZoneModal}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-evening-cream text-xs font-bold transition-all cursor-pointer hover:text-white"
            >
              {isArabic ? 'تغيير المنطقة' : 'Change Location'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
