import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layers,
  Check,
  Copy,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Clock,
  CreditCard,
  Utensils,
  Bike,
  Store,
  Flame,
  AlertTriangle,
  RefreshCw,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { DESIGN_SYSTEM_TOKENS, BRAND_TOKENS, INITIAL_MENU_ITEMS, DELIVERY_ZONES } from '../../data/mockData';
import { HeaderMark } from '../HeaderMark';

interface ScreenDesignSystemProps {
  isDark: boolean;
  isArabic: boolean;
}

export const ScreenDesignSystem: React.FC<ScreenDesignSystemProps> = ({ isDark, isArabic }) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'audit' | 'colors' | 'typography' | 'components' | 'bidirectional'>('audit');

  // Interactive WCAG color tester
  const [fgColor, setFgColor] = useState('#A13D2D');
  const [bgColor, setBgColor] = useState('#F1DED0');

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getLuminance = (hex: string) => {
    const rgb = hex.replace('#', '').match(/.{1,2}/g)?.map((x) => parseInt(x, 16) / 255) || [0, 0, 0];
    const a = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  const calculateContrast = (hex1: string, hex2: string) => {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return ((brightest + 0.05) / (darkest + 0.05)).toFixed(2);
  };

  const activeContrast = calculateContrast(fgColor, bgColor);
  const contrastNum = parseFloat(activeContrast);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Eyebrow & System Identity */}
      <div className="text-start space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-lantern-red/10 text-lantern-red">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isArabic ? 'نظام التصميم ومختبر الألوان وإمكانية الوصول' : 'FeastCraft Design System & Accessibility Lab'}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className={`text-3xl sm:text-4xl font-extrabold font-display tracking-tight ${
                isDark ? 'text-evening-cream' : 'text-temple-brown'
              }`}
            >
              {isArabic ? 'مكتبة مكونات FeastCraft وتدقيق WCAG 2.1' : 'Fast-Casual Design Tokens & Component Kit'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-gray max-w-2xl mt-1">
              WCAG 2.1 AA contrast matrix, artisanal fast-casual components, full RTL/LTR mirror support, and multi-scale chef icons.
            </p>
          </div>

          <div className="p-3 rounded-2xl border bg-black/5 dark:bg-black/30 border-black/5 dark:border-white/5 flex items-center gap-3">
            <HeaderMark size="md" isArabic={isArabic} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5">
        {[
          { id: 'audit', labelEn: 'QA & Accessibility Auditor (WCAG 2.1)', labelAr: 'مختبر تدقيق إمكانية الوصول والتراكبات', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'colors', labelEn: 'Color Palette & Variables', labelAr: 'جدول متغيرات الألوان', icon: <Palette className="w-4 h-4" /> },
          { id: 'typography', labelEn: 'Typography Scales & Fonts', labelAr: 'مصفوفة الخطوط والأوزان', icon: <Type className="w-4 h-4" /> },
          { id: 'components', labelEn: 'Component Kit & Fast Food Chips', labelAr: 'مكتبة المكونات وشارات الوجبات', icon: <Layers className="w-4 h-4" /> },
          { id: 'bidirectional', labelEn: 'LTR / RTL Bidirectional Pairs', labelAr: 'المقارنة ثنائية الاتجاه LTR/RTL', icon: <ArrowRight className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              activeSection === tab.id
                ? 'bg-lantern-red text-evening-cream shadow-md'
                : 'text-stone-gray hover:text-black dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* SECTION 0: QA & ACCESSIBILITY AUDIT LAB */}
      {activeSection === 'audit' && (
        <div className="space-y-8 text-start">
          {/* 1. Contrast Guarantee Matrix */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#FAF5F0] border-[#DEC7B7]'
            }`}
          >
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display flex items-center gap-2">
                <Palette className="w-5 h-5 text-lantern-red" />
                <span>1. WCAG 2.1 AA & AAA Contrast Compliance Matrix</span>
              </h3>
              <p className="text-xs text-stone-gray">
                Mathematical contrast ratios guaranteed across all FeastCraft fast-casual palettes.
              </p>
            </div>

            {/* Standard Pairings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="p-5 rounded-2xl border flex flex-col justify-between space-y-3"
                style={{ backgroundColor: '#F1DED0', color: '#A13D2D', borderColor: '#DEC7B7' }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold">#A13D2D on #F1DED0</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    5.05:1 • PASS AA
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-lg font-display">Lantern Red on Evening Cream</h4>
                  <p className="text-xs opacity-90">
                    Primary fast-casual brand pairing for buttons and badge highlights.
                  </p>
                </div>
              </div>

              <div
                className="p-5 rounded-2xl border flex flex-col justify-between space-y-3"
                style={{ backgroundColor: '#4A352A', color: '#F1DED0', borderColor: '#574034' }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold">#F1DED0 on #4A352A</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    8.66:1 • PASS AAA
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-lg font-display">Evening Cream on Temple Brown</h4>
                  <p className="text-xs opacity-90">
                    Exceeds WCAG 2.1 AAA high-contrast requirement for headers and footers.
                  </p>
                </div>
              </div>

              <div
                className="p-5 rounded-2xl border flex flex-col justify-between space-y-3"
                style={{ backgroundColor: '#2D201A', color: '#FFFFFF', borderColor: '#574034' }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold">#FFFFFF on #2D201A</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    14.2:1 • PASS AAA
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-lg font-display">Pure White on Dark Surface</h4>
                  <p className="text-xs opacity-90">
                    Maximum legibility for dark mode menus and kitchen display orders.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Color Contrast Inspector */}
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-black/30 border-white/5' : 'bg-white border-black/5'
              }`}
            >
              <h4 className="text-sm font-bold font-display text-stone-gray uppercase tracking-wider">
                Live Contrast Tester
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div>
                  <label className="text-xs font-bold text-stone-gray block mb-1">Foreground Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-gray block mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-center">
                  <span className="text-[10px] text-stone-gray uppercase font-bold block">Contrast Ratio</span>
                  <span className="text-2xl font-extrabold font-mono text-lantern-red">{activeContrast}:1</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span>WCAG AA (Normal):</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        contrastNum >= 4.5
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {contrastNum >= 4.5 ? 'PASS (≥4.5:1)' : 'FAIL'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>WCAG AAA (Enhanced):</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        contrastNum >= 7.0
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {contrastNum >= 7.0 ? 'PASS (≥7.0:1)' : 'FAIL (<7.0)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Chef's Head Silhouette Multi-Scale Vector Inspection */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#FAF5F0] border-[#DEC7B7]'
            }`}
          >
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lantern-red" />
                <span>2. Chef's Brand Silhouette Multi-Scale Vector Inspection</span>
              </h3>
              <p className="text-xs text-stone-gray">
                Verify crisp vector rendering at 16px, 24px, 32px, 48px, 64px, and 128px across Light and Dark backgrounds.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center items-end">
              {[
                { size: '16px' as const, label: '16px (Favicon/Micro)' },
                { size: '24px' as const, label: '24px (Inline/Tab)' },
                { size: '32px' as const, label: '32px (Header/Pill)' },
                { size: '48px' as const, label: '48px (Standard/Nav)' },
                { size: '64px' as const, label: '64px (Hero/Modal)' },
                { size: '128px' as const, label: '128px (Brand Display)' },
              ].map((item) => (
                <div
                  key={item.size}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-end gap-3 min-h-[160px] ${
                    isDark ? 'bg-black/30 border-white/5' : 'bg-white border-black/5'
                  }`}
                >
                  <HeaderMark size={item.size} showText={false} isDark={isDark} />
                  <span className="text-[11px] font-bold font-mono text-stone-gray">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Colors & Variable Tables */}
      {activeSection === 'colors' && (
        <div className="space-y-6 text-start">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESIGN_SYSTEM_TOKENS.colors.map((color) => (
              <div
                key={color.name}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-sm ${
                  isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'
                }`}
              >
                <div
                  className="h-24 w-full rounded-xl shadow-inner border border-black/10 flex items-end p-3"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
                    {color.hex}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold font-display text-base">{color.name}</h3>
                    <button
                      onClick={() => copyToClipboard(color.hex, color.name)}
                      className="text-xs font-semibold px-2 py-1 rounded bg-black/5 dark:bg-white/10 hover:bg-lantern-red hover:text-white transition-colors flex items-center gap-1"
                    >
                      {copiedToken === color.name ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedToken === color.name ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-stone-gray">{color.role}</p>
                  <div className="text-[11px] font-mono p-2 rounded bg-black/5 dark:bg-black/30 text-stone-gray">
                    {color.token}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Typography Scales */}
      {activeSection === 'typography' && (
        <div className="space-y-8 text-start">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#FAF5F0] border-[#DEC7B7]'
            }`}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-lantern-red uppercase tracking-wider font-mono">
                Display & Headings Typographic Hierarchy
              </span>
              <h2 className="text-2xl font-bold font-display">Outfit (ENG) + Cairo (AR)</h2>
              <p className="text-xs text-stone-gray">
                Used for pizza titles, smash burger names, combo descriptions, and numeric pricing in EGP.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/30 border border-black/5 space-y-1">
                <span className="text-[10px] font-mono text-stone-gray">Display 2XL (36px / Bold 900)</span>
                <p className="text-3xl sm:text-4xl font-black font-display leading-tight">
                  Truffle Funghi Wood-Fired Pizza
                </p>
                <p className="text-2xl sm:text-3xl font-black font-display font-arabic leading-tight pt-1">
                  بيتزا ترافل فونجي كرافت بالحطب
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/30 border border-black/5 space-y-1">
                <span className="text-[10px] font-mono text-stone-gray">Display XL (24px / Bold 700)</span>
                <p className="text-xl sm:text-2xl font-bold font-display">
                  Double Smashed Wagyu Burger • 285 EGP
                </p>
                <p className="text-xl sm:text-2xl font-bold font-display font-arabic pt-1">
                  دبل سماش واغيو برجر • ٢٨٥ ج.م
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Component Kit */}
      {activeSection === 'components' && (
        <div className="space-y-8 text-start">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#FAF5F0] border-[#DEC7B7]'
            }`}
          >
            <h3 className="text-xl font-bold font-display">Fast-Casual Action Buttons & Badges</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                type="button"
                className="min-h-[44px] px-6 py-2.5 rounded-2xl font-black text-xs text-white bg-lantern-red hover:bg-[#8B3426] active:scale-95 transition-all shadow-md shadow-lantern-red/20 flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart • 220 EGP</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  🔥 Best Seller
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                  Spicy (حار)
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  🌱 Vegetarian
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Bidirectional LTR / RTL Screen Pairs */}
      {activeSection === 'bidirectional' && (
        <div className="space-y-6 text-start">
          <div className="p-4 rounded-xl bg-lantern-red/10 border border-lantern-red/20 text-xs text-lantern-red font-semibold">
            ✨ FeastCraft Dual-Direction Architecture: Fully mirrored menu item cards, fulfillment toggles, price formatting, and Arabic font pairings.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LTR (English) Preview Card */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-dark-surface border-dark-border text-evening-cream' : 'bg-[#FAF5F0] border-[#E8D4C5] text-temple-brown'
              }`}
              dir="ltr"
            >
              <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                  LTR Preview (English)
                </span>
                <HeaderMark size="sm" isArabic={false} isDark={isDark} />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-black/10 overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80"
                    alt="Truffle Pizza"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black">Truffle Funghi Craft Pizza</h3>
                  <p className="text-xs text-stone-gray">Wild forest mushrooms, white truffle oil & fior di latte</p>
                  <span className="font-mono font-black text-lantern-red text-sm mt-1 block">220.00 EGP</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full min-h-[44px] py-2.5 rounded-2xl font-black text-xs bg-lantern-red text-white flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Add to Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* RTL (Arabic) Mirrored Preview Card */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-dark-surface border-dark-border text-evening-cream' : 'bg-[#FAF5F0] border-[#E8D4C5] text-temple-brown'
              }`}
              dir="rtl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                  RTL Preview (العربية)
                </span>
                <HeaderMark size="sm" isArabic={true} isDark={isDark} />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-black/10 overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80"
                    alt="Truffle Pizza"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black">بيتزا ترافل فونجي كرافت</h3>
                  <p className="text-xs text-stone-gray">مشروم غابات بري، زيت كمأة بيضاء وموزاريلا طازجة</p>
                  <span className="font-mono font-black text-lantern-red text-sm mt-1 block">٢٢٠.٠٠ ج.م</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full min-h-[44px] py-2.5 rounded-2xl font-black text-xs bg-lantern-red text-white flex items-center justify-center gap-2 shadow-sm"
              >
                <span>إضافة للطلب</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
