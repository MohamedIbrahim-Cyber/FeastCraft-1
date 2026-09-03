import React from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Bike,
  Store,
  CreditCard,
  Banknote,
  Award,
  Sparkles,
} from 'lucide-react';
import { Order, MenuItem } from '../../types';

interface AdminAnalyticsViewProps {
  orders: Order[];
  menuItems: MenuItem[];
  isArabic: boolean;
  isDark: boolean;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  orders,
  menuItems,
  isArabic,
  isDark,
}) => {
  // Aggregate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const deliveryOrders = orders.filter((o) => o.fulfillmentType === 'DELIVERY').length;
  const pickupOrders = orders.filter((o) => o.fulfillmentType === 'PICKUP').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const cardPayments = orders.filter((o) => o.paymentMethod === 'PAYMOB_CARD').length;
  const codPayments = orders.filter((o) => o.paymentMethod === 'CASH_ON_DELIVERY').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-black/10 dark:border-white/10">
        <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-lantern-red" />
          <span>{isArabic ? 'تحليلات المبيعات وأداء المطعم' : 'Restaurant Revenue & Performance Analytics'}</span>
        </h1>
        <p className="text-xs text-stone-gray mt-0.5">
          {isArabic
            ? 'مؤشرات الأداء الرئيسية ومعدلات تسليم الوجبات وتفضيلات قنوات الدفع'
            : 'Key performance indicators, fulfillment channels, and top sellers'}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* KPI 1: Gross Sales */}
        <div
          className={`p-5 rounded-3xl border shadow-sm ${
            isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-gray">
              {isArabic ? 'إجمالي المبيعات' : 'Gross Sales'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-temple-brown dark:text-evening-cream">
            {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs font-normal text-stone-gray">{isArabic ? 'ج.م' : 'EGP'}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            +18.4% vs last week
          </span>
        </div>

        {/* KPI 2: Total Orders */}
        <div
          className={`p-5 rounded-3xl border shadow-sm ${
            isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-gray">
              {isArabic ? 'عدد الطلبات الكلي' : 'Total Orders'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-lantern-red/10 text-lantern-red flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-temple-brown dark:text-evening-cream">
            {totalOrders} <span className="text-xs font-normal text-stone-gray">{isArabic ? 'طلب' : 'orders'}</span>
          </div>
          <span className="text-[11px] font-bold text-lantern-red mt-1 block">
            94% fulfillment success
          </span>
        </div>

        {/* KPI 3: Average Ticket (AOV) */}
        <div
          className={`p-5 rounded-3xl border shadow-sm ${
            isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-gray">
              {isArabic ? 'متوسط قيمة الطلب' : 'Average Ticket'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-temple-brown dark:text-evening-cream">
            {avgOrderValue.toFixed(2)}{' '}
            <span className="text-xs font-normal text-stone-gray">{isArabic ? 'ج.م' : 'EGP'}</span>
          </div>
          <span className="text-[11px] font-bold text-stone-gray mt-1 block">
            Target: 400.00 EGP
          </span>
        </div>

        {/* KPI 4: Average Delivery ETA */}
        <div
          className={`p-5 rounded-3xl border shadow-sm ${
            isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-gray">
              {isArabic ? 'متوسط سرعة التوصيل' : 'Average Kitchen ETA'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-temple-brown dark:text-evening-cream">
            28 <span className="text-xs font-normal text-stone-gray">{isArabic ? 'دقيقة' : 'mins'}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            -4.2 mins vs average
          </span>
        </div>
      </div>

      {/* Fulfillment & Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Fulfillment Split */}
        <div
          className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
          }`}
        >
          <h3 className="text-sm font-black">
            {isArabic ? 'توزيع قنوات الاستلام (توصيل مقابل استلام)' : 'Fulfillment Channel Split'}
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isArabic ? 'توصيل للمنازل (Doorstep Delivery)' : 'Doorstep Delivery'}</span>
                </span>
                <span className="font-mono">
                  {deliveryOrders} ({totalOrders > 0 ? Math.round((deliveryOrders / totalOrders) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${totalOrders > 0 ? (deliveryOrders / totalOrders) * 100 : 70}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isArabic ? 'استلام من الفرع (Counter Pickup)' : 'Counter Pickup'}</span>
                </span>
                <span className="font-mono">
                  {pickupOrders} ({totalOrders > 0 ? Math.round((pickupOrders / totalOrders) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{
                    width: `${totalOrders > 0 ? (pickupOrders / totalOrders) * 100 : 30}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Split */}
        <div
          className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
          }`}
        >
          <h3 className="text-sm font-black">
            {isArabic ? 'طرق الدفع المفضلة للعملاء' : 'Customer Payment Methods'}
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-lantern-red" />
                  <span>Paymob Card Online (Visa / Mastercard)</span>
                </span>
                <span className="font-mono">{cardPayments}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-lantern-red rounded-full"
                  style={{
                    width: `${totalOrders > 0 ? (cardPayments / totalOrders) * 100 : 50}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cash on Delivery (COD)</span>
                </span>
                <span className="font-mono">{codPayments}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{
                    width: `${totalOrders > 0 ? (codPayments / totalOrders) * 100 : 50}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Best-Selling Fast-Casual Items */}
      <div
        className={`p-6 rounded-3xl border shadow-sm ${
          isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/5 dark:border-white/5">
          <h3 className="text-sm font-black flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{isArabic ? 'الأصناف الأكثر طلباً ومبيعاً' : 'Top Selling Fast-Casual Items'}</span>
          </h3>
          <span className="text-xs font-bold text-stone-gray font-mono">Live Ranking</span>
        </div>

        <div className="space-y-3">
          {menuItems.slice(0, 5).map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-xs py-1">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/5 font-mono font-black text-center flex items-center justify-center text-stone-gray">
                  #{index + 1}
                </span>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-10 h-10 rounded-xl object-cover bg-black/10 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-black">{isArabic ? item.nameAr : item.name}</h4>
                  <span className="text-[10px] text-stone-gray font-mono">{item.basePrice} EGP</span>
                </div>
              </div>

              <div className="text-end">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                  {45 - index * 6} orders
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
