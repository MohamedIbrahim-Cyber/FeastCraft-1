import React, { useState } from 'react';
import {
  Search,
  Clock,
  Bike,
  ChefHat,
  PackageCheck,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentOrders: Order[];
  onSelectOrder: (order: Order) => void;
  isArabic: boolean;
  isDark: boolean;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  recentOrders,
  onSelectOrder,
  isArabic,
  isDark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      // First check in recent local orders
      const cleanQuery = query.replace(/^#/, '').toLowerCase();
      const localMatch = recentOrders.find(
        (o) =>
          o.orderNumber.replace(/^#/, '').toLowerCase() === cleanQuery ||
          o.id.toLowerCase() === cleanQuery ||
          o.customerPhone.replace(/[\s+-]/g, '') === cleanQuery.replace(/[\s+-]/g, '')
      );

      if (localMatch) {
        setSearchResult(localMatch);
        setIsSearching(false);
        return;
      }

      // Query the backend server
      const res = await fetch(`/api/orders/${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.order) {
          setSearchResult(data.order);
        } else {
          setSearchError(
            isArabic
              ? 'لم يتم العثور على طلب بهذا الرقم. تأكد من إدخال رقم الطلب بشكل صحيح.'
              : 'No order found with this reference. Please verify your order number.'
          );
        }
      } else {
        setSearchError(
          isArabic
            ? 'لم يتم العثور على طلب بهذا الرقم. تأكد من إدخال رقم الطلب بشكل صحيح.'
            : 'No order found with this reference. Please verify your order number.'
        );
      }
    } catch {
      setSearchError(
        isArabic
          ? 'تعذر الاتصال بالخادم للبحث عن الطلب. حاول مجدداً.'
          : 'Failed to connect to server. Please try again.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'RECEIVED':
        return {
          labelEn: 'Received',
          labelAr: 'تم الاستلام',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          icon: Clock,
        };
      case 'KITCHEN_PREPARING':
        return {
          labelEn: 'In Kitchen (Cooking)',
          labelAr: 'قيد التحضير',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          icon: ChefHat,
        };
      case 'OUT_FOR_DELIVERY':
        return {
          labelEn: 'Out for Delivery',
          labelAr: 'خرج للتوصيل',
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          icon: Bike,
        };
      case 'READY_FOR_PICKUP':
        return {
          labelEn: 'Ready for Pickup',
          labelAr: 'جاهز للاستلام',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          icon: PackageCheck,
        };
      case 'DELIVERED':
      case 'COMPLETED':
        return {
          labelEn: 'Delivered',
          labelAr: 'تم التوصيل',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          icon: CheckCircle2,
        };
      case 'CANCELLED':
        return {
          labelEn: 'Cancelled',
          labelAr: 'ملغي',
          color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          icon: AlertCircle,
        };
      default:
        return {
          labelEn: 'Received',
          labelAr: 'تم الاستلام',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          icon: Clock,
        };
    }
  };

  return (
    <div
      id="order-status-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="order-status-modal-content"
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          isDark
            ? 'bg-dark-surface border-dark-border text-evening-cream'
            : 'bg-[#FCF8F5] border-[#EADBD0] text-temple-brown'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-lantern-red/10 text-lantern-red flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight">
                {isArabic ? 'تتبع حالة الطلب' : 'Track Order Status'}
              </h2>
              <p className="text-xs text-stone-gray mt-0.5">
                {isArabic
                  ? 'تابع طلبك لحظة بلحظة من الفرن حتى باب بيتك'
                  : 'Check live status from wood-fire oven to your doorstep'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-gray hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Order Search Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-bold text-stone-gray block">
              {isArabic ? 'البحث برقم الطلب أو الهاتف:' : 'Look up by Order # or Phone:'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-gray absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (searchError) setSearchError(null);
                  }}
                  placeholder={isArabic ? 'مثال: #FC-1042 أو رقم هاتفك' : 'e.g., #FC-1042 or phone number'}
                  className={`w-full ps-10 pe-4 py-2.5 rounded-2xl text-xs font-semibold border outline-hidden transition-all ${
                    isDark
                      ? 'bg-dark-surface-elevated border-dark-border focus:border-lantern-red text-evening-cream'
                      : 'bg-white border-[#E0CEBF] focus:border-lantern-red text-temple-brown shadow-2xs'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={!searchQuery.trim() || isSearching}
                className="px-4 py-2.5 rounded-2xl bg-lantern-red hover:bg-[#8B3426] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 flex-shrink-0"
              >
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isArabic ? 'بحث' : 'Search'}</span>
                    {isArabic ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </>
                )}
              </button>
            </div>

            {searchError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </form>

          {/* Search Result Card (if found) */}
          {searchResult && (
            <div className="space-y-2 animate-fadeIn">
              <span className="text-xs font-bold text-lantern-red uppercase tracking-wider block">
                {isArabic ? 'نتيجة البحث:' : 'Search Result:'}
              </span>
              <div
                onClick={() => {
                  onSelectOrder(searchResult);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] flex items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-dark-surface-elevated border-dark-border hover:border-lantern-red/60'
                    : 'bg-white border-[#E2D4C9] hover:border-lantern-red/50 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-lantern-red/10 text-lantern-red flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-lantern-red">
                        {searchResult.orderNumber}
                      </span>
                      <span className="text-[10px] text-stone-gray">
                        {new Date(searchResult.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs font-bold truncate mt-0.5">
                      {searchResult.items.map((i) => `${i.quantity}x ${isArabic ? i.nameAr : i.name}`).join(', ')}
                    </p>
                    <p className="text-[11px] text-stone-gray mt-0.5">
                      {searchResult.fulfillmentType === 'DELIVERY'
                        ? isArabic
                          ? '🛵 توصيل للمنزل'
                          : '🛵 Doorstep Delivery'
                        : isArabic
                        ? '🛍️ استلام من الفرع'
                        : '🛍️ Store Pickup'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {(() => {
                    const badge = getStatusBadge(searchResult.status);
                    const Icon = badge.icon;
                    return (
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${badge.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{isArabic ? badge.labelAr : badge.labelEn}</span>
                      </span>
                    );
                  })()}
                  <span className="text-xs font-mono font-black text-lantern-red">
                    {searchResult.totalAmount.toFixed(0)} {isArabic ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-gray">
                {isArabic ? 'الطلبات الحالية والسابقة:' : 'Recent & Active Orders:'}
              </span>
              <span className="text-[11px] text-stone-gray font-mono">
                {recentOrders.length} {isArabic ? 'طلب' : 'orders'}
              </span>
            </div>

            {recentOrders.length === 0 ? (
              <div
                className={`py-10 px-4 text-center rounded-2xl border ${
                  isDark ? 'border-dark-border bg-dark-surface-elevated/40' : 'border-[#EAE0D7] bg-white/60'
                }`}
              >
                <ShoppingBag className="w-8 h-8 mx-auto text-stone-gray/50 mb-2" />
                <p className="text-xs font-bold text-stone-gray">
                  {isArabic ? 'لا توجد طلبات سابقة مسجلة حالياً' : 'No recent orders yet'}
                </p>
                <p className="text-[11px] text-stone-gray/80 mt-1">
                  {isArabic
                    ? 'عند تأكيد أي طلب ستتمكن من متابعة مراحله هنا مباشرة'
                    : 'When you place an order, its real-time status will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pe-1">
                {recentOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  const Icon = badge.icon;
                  const isActive =
                    ord.status === 'RECEIVED' ||
                    ord.status === 'KITCHEN_PREPARING' ||
                    ord.status === 'OUT_FOR_DELIVERY' ||
                    ord.status === 'READY_FOR_PICKUP';

                  return (
                    <div
                      key={ord.id}
                      onClick={() => {
                        onSelectOrder(ord);
                        onClose();
                      }}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? isDark
                            ? 'bg-dark-surface-elevated border-lantern-red/40 hover:border-lantern-red ring-1 ring-lantern-red/20'
                            : 'bg-white border-lantern-red/30 hover:border-lantern-red shadow-xs ring-1 ring-lantern-red/10'
                          : isDark
                          ? 'bg-dark-surface-elevated/60 border-dark-border hover:border-stone-gray/50'
                          : 'bg-white/80 border-[#E8DDD3] hover:border-stone-gray/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-lantern-red/10 text-lantern-red'
                              : 'bg-black/5 dark:bg-white/5 text-stone-gray'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-lantern-red">
                              {ord.orderNumber}
                            </span>
                            <span className="text-[10px] text-stone-gray">
                              {new Date(ord.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active" />
                            )}
                          </div>
                          <p className="text-xs font-semibold truncate mt-0.5">
                            {ord.items.map((i) => `${i.quantity}x ${isArabic ? i.nameAr : i.name}`).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}
                        >
                          <span>{isArabic ? badge.labelAr : badge.labelEn}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-temple-brown dark:text-evening-cream">
                          {ord.totalAmount.toFixed(0)} {isArabic ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-stone-gray bg-black/2 dark:bg-white/2">
          <span>{isArabic ? 'خدمة العملاء: ١٩٠٠٠' : 'Customer Support: 19000'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-gray/30 hover:bg-black/5 dark:hover:bg-white/10 font-bold transition-colors cursor-pointer"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
