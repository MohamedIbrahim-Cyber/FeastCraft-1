import React, { useState } from 'react';
import {
  Bike,
  Navigation,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Banknote,
  CreditCard,
  Building,
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface AdminDeliveryViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  isArabic: boolean;
  isDark: boolean;
  currentUser?: { name?: string; email?: string; role?: string } | null;
}

export const AdminDeliveryView: React.FC<AdminDeliveryViewProps> = ({
  orders,
  onUpdateOrderStatus,
  isArabic,
  isDark,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ACTIVE' | 'READY' | 'EN_ROUTE' | 'DELIVERED'>('ACTIVE');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');

  // Filter only DELIVERY orders
  const deliveryOrders = orders.filter((o) => o.fulfillmentType === 'DELIVERY');

  const filteredOrders = deliveryOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesTab = true;
    if (filterTab === 'ACTIVE') {
      matchesTab = order.status === 'READY_FOR_PICKUP' || order.status === 'OUT_FOR_DELIVERY';
    } else if (filterTab === 'READY') {
      matchesTab = order.status === 'READY_FOR_PICKUP';
    } else if (filterTab === 'EN_ROUTE') {
      matchesTab = order.status === 'OUT_FOR_DELIVERY';
    } else if (filterTab === 'DELIVERED') {
      matchesTab = order.status === 'DELIVERED' || order.status === 'COMPLETED';
    }

    const matchesZone = zoneFilter === 'ALL' || (order.deliveryAddress && order.deliveryAddress.includes(zoneFilter));
    return matchesSearch && matchesTab && matchesZone;
  });

  // Delivery Stats
  const readyCount = deliveryOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
  const enRouteCount = deliveryOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  const deliveredTodayCount = deliveryOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
  const cashToCollect = deliveryOrders
    .filter((o) => o.status === 'OUT_FOR_DELIVERY' && o.paymentMethod === 'CASH_ON_DELIVERY')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight">
                {isArabic ? 'إدارة التوصيل وخطوط السير' : 'Delivery Dispatch & Couriers'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                {isArabic ? 'محطة السائقين' : 'Courier Station'}
              </span>
            </div>
            <p className="text-xs text-stone-gray">
              {isArabic
                ? 'متابعة الطلبات الجاهزة، توجيه السائقين، والاتصال المباشر بالعملاء'
                : 'Manage dispatched drivers, active routes, customer calls, and COD cash collection'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5">
            <Navigation className="w-4 h-4" />
            <span>{isArabic ? 'تتبع GPS مباشر' : 'Live Dispatching'}</span>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <div className="text-xs font-bold text-stone-gray">{isArabic ? 'جاهز للاستلام بالمطبخ' : 'Ready at Kitchen'}</div>
          <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">{readyCount}</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <div className="text-xs font-bold text-stone-gray">{isArabic ? 'في الطريق للعميل' : 'Out for Delivery'}</div>
          <div className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400">{enRouteCount}</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <div className="text-xs font-bold text-stone-gray">{isArabic ? 'تم توصيلها اليوم' : 'Delivered Today'}</div>
          <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{deliveredTodayCount}</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <div className="text-xs font-bold text-stone-gray">{isArabic ? 'كاش مطلوب تحصيله' : 'COD in Transit'}</div>
          <div className="text-2xl font-black mt-1 font-mono text-lantern-red">{cashToCollect.toFixed(0)} <span className="text-xs font-normal">EGP</span></div>
        </div>
      </div>

      {/* 3. Search & Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'بحث بالطلب (#FC)، اسم العميل، العنوان، أو الهاتف...' : 'Search by order #, customer, address, or phone...'}
            className={`w-full ps-10 pe-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? 'bg-dark-surface border-dark-border text-evening-cream placeholder:text-stone-600'
                : 'bg-white border-[#EADBD0] text-temple-brown placeholder:text-stone-400'
            }`}
          />
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'ACTIVE', labelEn: 'Active Deliveries', labelAr: 'النشطة حالياً' },
            { id: 'READY', labelEn: 'Ready for Courier', labelAr: 'بالمطبخ جاهزة' },
            { id: 'EN_ROUTE', labelEn: 'On Road', labelAr: 'في الطريق' },
            { id: 'DELIVERED', labelEn: 'Completed', labelAr: 'المكتملة' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-dark-surface text-stone-400 hover:text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isArabic ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Orders Grid for Delivery Drivers */}
      {filteredOrders.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <Bike className="w-12 h-12 mx-auto text-stone-gray/40 mb-3" />
          <h3 className="font-bold text-sm">{isArabic ? 'لا توجد طلبات توصيل في هذا القسم' : 'No delivery orders in this queue'}</h3>
          <p className="text-xs text-stone-gray mt-1">
            {isArabic ? 'عندما تصبح طلبات المطبخ جاهزة ستظهر هنا فوراً للسائقين' : 'Orders packed by kitchen will automatically appear here for drivers.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isCOD = order.paymentMethod === 'CASH_ON_DELIVERY';
            const isEnRoute = order.status === 'OUT_FOR_DELIVERY';
            const isReady = order.status === 'READY_FOR_PICKUP';

            return (
              <div
                key={order.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isDark
                    ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
                    : 'bg-white border-[#EADBD0] text-temple-brown'
                }`}
              >
                {/* Top Bar */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                        {order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        {isArabic ? 'توصيل منزلي' : 'Home Delivery'}
                      </span>
                    </div>
                    <h3 className="font-black text-base mt-1">{order.customerName}</h3>
                  </div>

                  {/* Status Indicator */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isReady
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : isEnRoute
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 animate-pulse'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isReady
                      ? isArabic ? 'جاهز للاستلام' : 'Ready for Pickup'
                      : isEnRoute
                      ? isArabic ? 'خرج للتوصيل' : 'Out for Delivery'
                      : isArabic ? 'تم التسليم' : 'Delivered'}
                  </span>
                </div>

                {/* Delivery Address & Customer Call Card */}
                <div className="py-3 space-y-2 text-xs border-b border-black/5 dark:border-white/5">
                  <div className="flex items-start gap-2 text-stone-gray">
                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-black dark:text-white leading-relaxed">
                      {order.deliveryAddress || (isArabic ? 'العنوان غير محدد' : 'No address specified')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-stone-gray">
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-mono font-bold text-black dark:text-white">{order.customerPhone}</span>
                    </div>

                    {/* Quick Call Button for Driver */}
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{isArabic ? 'اتصال بالعميل' : 'Call Customer'}</span>
                    </a>
                  </div>
                </div>

                {/* Payment & Items Preview */}
                <div className="py-2.5 flex items-center justify-between text-xs border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    {isCOD ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                        <Banknote className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'تحصيل كاش عند الباب' : 'COD (Cash to Collect)'}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'مدفوع إلكترونياً' : 'Paid Online'}</span>
                      </span>
                    )}
                  </div>

                  <div className="font-mono font-black text-sm">
                    {order.totalAmount.toFixed(2)} EGP
                  </div>
                </div>

                {/* Driver Action Buttons */}
                <div className="mt-3 flex items-center justify-end gap-2">
                  {isReady && (
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Bike className="w-4 h-4" />
                      <span>{isArabic ? 'استلام الطلب والانطلاق للعميل' : 'Pick Up & Start Delivery'}</span>
                    </button>
                  )}

                  {isEnRoute && (
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.id, 'DELIVERED')}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {isCOD
                          ? isArabic ? 'تأكيد التسليم واستلام الكاش' : 'Delivered & Cash Collected'
                          : isArabic ? 'تأكيد تسليم الطلب للعميل' : 'Confirm Order Delivered'}
                      </span>
                    </button>
                  )}

                  {order.status === 'DELIVERED' && (
                    <div className="text-emerald-600 text-xs font-bold flex items-center gap-1 py-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isArabic ? 'تم التوصيل بنجاح' : 'Completed & Closed'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
