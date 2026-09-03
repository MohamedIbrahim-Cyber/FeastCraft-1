import React from 'react';
import {
  Kanban,
  Calendar,
  Utensils,
  TrendingUp,
  ShieldCheck,
  User,
  Users,
  LogOut,
  Globe,
  Sun,
  Moon,
  ChefHat,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  ArrowLeftRight,
  FileText,
  Clock,
} from 'lucide-react';
import { AdminRole, Locale, ThemeMode } from '../../types';
import { HeaderMark } from '../HeaderMark';

interface AdminSidebarProps {
  currentTab: 'dashboard' | 'calendar' | 'prepsheet' | 'menu' | 'analytics' | 'security' | 'users';
  onChangeTab: (tab: 'dashboard' | 'calendar' | 'prepsheet' | 'menu' | 'analytics' | 'security' | 'users') => void;
  currentUser: { name: string; email: string; role: AdminRole };
  onChangeRole: (role: AdminRole) => void;
  onLogout: () => void;
  locale: Locale;
  onToggleLocale: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  isDark: boolean;
  isArabic: boolean;
  onBackToCustomerSite: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onChangeTab,
  currentUser,
  onChangeRole,
  onLogout,
  locale,
  onToggleLocale,
  theme,
  onToggleTheme,
  isDark,
  isArabic,
  onBackToCustomerSite,
}) => {
  const navItems: {
    id: 'dashboard' | 'calendar' | 'prepsheet' | 'menu' | 'analytics' | 'security' | 'users';
    labelEn: string;
    labelAr: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      labelEn: 'Catering Bookings & Pipeline',
      labelAr: 'حجوزات الضيافة والحالات',
      icon: <Kanban className="w-4 h-4" />,
      badge: 'Active',
    },
    {
      id: 'calendar',
      labelEn: 'Kitchen Production Calendar',
      labelAr: 'جدول طاقة المطبخ والفعاليات',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'prepsheet',
      labelEn: 'Kitchen Prep Sheet (Chef Omar)',
      labelAr: 'ورقة تجهيز المطبخ والأوزان',
      icon: <ChefHat className="w-4 h-4 text-amber-500" />,
      badge: 'Live',
    },
    {
      id: 'menu',
      labelEn: 'Menu CMS & Delivery Zones',
      labelAr: 'إدارة المأكولات والمناطق',
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      labelEn: 'Revenue & Headcount Analytics',
      labelAr: 'التحليلات والإيرادات',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'users',
      labelEn: 'Staff & Admin Accounts',
      labelAr: 'حسابات الموظفين والإدارة',
      icon: <Users className="w-4 h-4 text-lantern-red" />,
      badge: 'DB',
    },
    {
      id: 'security',
      labelEn: 'DevSecOps & Threat Shield',
      labelAr: 'مركز الدفاع والأمان (DevSecOps)',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
      badge: 'Active',
    },
  ];

  return (
    <aside
      className={`w-full lg:w-72 flex-shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-e p-4 sm:p-5 text-start transition-all ${
        isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'
      }`}
    >
      {/* Top Brand & Title */}
      <div className="space-y-6">
        {/* Brand Lockup */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeaderMark size={38} className="text-lantern-red" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base font-display text-temple-brown dark:text-evening-cream">
                  FeastCraft HQ
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-lantern-red/10 text-lantern-red">
                  Chef Omar
                </span>
              </div>
              <p className="text-[11px] text-stone-gray">Artisanal Catering Operations</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-lantern-red text-white shadow-md'
                    : isDark
                    ? 'text-stone-gray hover:text-evening-cream hover:bg-dark-surface-elevated'
                    : 'text-stone-gray hover:text-temple-brown hover:bg-stone-100'
                }`}
                style={isActive ? { backgroundColor: '#A13D2D' } : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-stone-gray'}>{item.icon}</span>
                  <span>{isArabic ? item.labelAr : item.labelEn}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Utilities */}
      <div className="space-y-4 pt-6 border-t border-stone-200 dark:border-dark-border">
        {/* User Card */}
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between ${
            isDark ? 'bg-dark-bg border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-lantern-red/10 text-lantern-red flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{currentUser.name}</p>
              <span className="text-[10px] text-stone-gray">{currentUser.role}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-stone-gray hover:text-rose-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Back to Client Customizer button */}
        <button
          type="button"
          onClick={onBackToCustomerSite}
          className="w-full py-2.5 px-3 rounded-xl border border-stone-gray/30 text-xs font-bold text-stone-gray hover:text-lantern-red hover:border-lantern-red transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{isArabic ? 'الرجوع لمخصص الباقات' : 'Client Catering Customizer'}</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
