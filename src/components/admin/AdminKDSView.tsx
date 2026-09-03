import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Clock,
  Bike,
  Store,
  CheckCircle2,
  ChefHat,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  RefreshCw,
  Printer,
  ChevronRight,
  Sun,
  ShieldAlert,
} from 'lucide-react';
import { Order, OrderStatus, FulfillmentType } from '../../types';
import {
  enableKitchenKeepAwake,
  disableKitchenKeepAwake,
  playKitchenChimeAudio,
} from '../../lib/nativeBridge';

interface AdminKDSViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  isArabic: boolean;
  isDark: boolean;
}

export const AdminKDSView: React.FC<AdminKDSViewProps> = ({
  orders,
  onUpdateOrderStatus,
  isArabic,
  isDark,
}) => {
  const [audioChimeEnabled, setAudioChimeEnabled] = useState(true);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'ALL' | 'DELIVERY' | 'PICKUP'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeepAwakeActive, setIsKeepAwakeActive] = useState(true);
  const prevOrdersCountRef = useRef(orders.length);

  // 1. Kitchen Screen Keep-Awake:
  // Prevents kitchen Android tablets from locking or turning screen off during active service
  useEffect(() => {
    if (isKeepAwakeActive) {
      enableKitchenKeepAwake();
    } else {
      disableKitchenKeepAwake();
    }
    return () => {
      disableKitchenKeepAwake();
    };
  }, [isKeepAwakeActive]);

  // 2. Play audio chime alert when new orders arrive
  useEffect(() => {
    if (orders.length > prevOrdersCountRef.current) {
      if (audioChimeEnabled) {
        playKitchenChimeAudio();
      }
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders.length, audioChimeEnabled]);

  // Play audio chime test
  const playChime = () => {
    if (!audioChimeEnabled) return;
    playKitchenChimeAudio();
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (fulfillmentFilter !== 'ALL' && order.fulfillmentType !== fulfillmentFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(query);
      const matchName = order.customerName.toLowerCase().includes(query);
      const matchPhone = order.customerPhone.includes(query);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  // Pipeline columns
  const pendingOrders = filteredOrders.filter((o) => o.status === 'RECEIVED');
  const kitchenOrders = filteredOrders.filter((o) => o.status === 'KITCHEN_PREPARING');
  const dispatchOrders = filteredOrders.filter(
    (o) => o.status === 'OUT_FOR_DELIVERY' || o.status === 'READY_FOR_PICKUP'
  );
  const completedOrders = filteredOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn">
      {/* KDS Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-lantern-red" />
              <span>{isArabic ? 'نظام شاشات المطبخ الفوري (Live KDS)' : 'Live Kitchen Display System (KDS)'}</span>
            </h1>
          </div>
          <p className="text-xs text-stone-gray mt-0.5">
            {isArabic
              ? 'متابعة وتجهيز الطلبات الحية في الوقت الفعلي مع تنبيهات صوتية'
              : 'Real-time kitchen order ticketing, line status, and courier dispatch'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !audioChimeEnabled;
              setAudioChimeEnabled(next);
              if (next) playChime();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
              audioChimeEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-black/5 dark:bg-white/5 border-stone-gray/30 text-stone-gray'
            }`}
            title="Toggle incoming order audio notification chime"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {audioChimeEnabled
                ? isArabic
                  ? 'جرس التنبيه: مفعّل'
                  : 'Audio Alert: ON'
                : isArabic
                ? 'جرس التنبيه: صامت'
                : 'Audio Alert: OFF'}
            </span>
          </button>

          {/* Kitchen Tablet Screen Keep-Awake Toggle */}
          <button
            type="button"
            onClick={() => setIsKeepAwakeActive(!isKeepAwakeActive)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
              isKeepAwakeActive
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-black/5 dark:bg-white/5 border-stone-gray/30 text-stone-gray'
            }`}
            title="Toggle Android tablet screen keep-awake"
          >
            <Sun className={`w-4 h-4 ${isKeepAwakeActive ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">
              {isKeepAwakeActive
                ? isArabic
                  ? 'إبقاء الشاشة مضاءة'
                  : 'Screen Keep-Awake: ON'
                : isArabic
                ? 'إيقاف إبقاء الشاشة'
                : 'Screen Keep-Awake: OFF'}
            </span>
          </button>

          {/* Fulfillment Mode Filter */}
          <div className="flex items-center rounded-xl p-1 bg-black/5 dark:bg-white/5 border border-stone-gray/20">
            <button
              type="button"
              onClick={() => setFulfillmentFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                fulfillmentFilter === 'ALL'
                  ? 'bg-lantern-red text-white shadow-xs'
                  : 'text-stone-gray hover:text-black dark:hover:text-white'
              }`}
            >
              {isArabic ? 'الكل' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentFilter('DELIVERY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                fulfillmentFilter === 'DELIVERY'
                  ? 'bg-lantern-red text-white shadow-xs'
                  : 'text-stone-gray hover:text-black dark:hover:text-white'
              }`}
            >
              🛵 {isArabic ? 'توصيل' : 'Delivery'}
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentFilter('PICKUP')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                fulfillmentFilter === 'PICKUP'
                  ? 'bg-lantern-red text-white shadow-xs'
                  : 'text-stone-gray hover:text-black dark:hover:text-white'
              }`}
            >
              🛍️ {isArabic ? 'استلام' : 'Pickup'}
            </button>
          </div>
        </div>
      </div>

      {/* 4-Lane KDS Kanban Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* LANE 1: NEW PENDING ORDERS */}
        <div className="flex flex-col rounded-3xl border overflow-hidden bg-black/5 dark:bg-white/5 border-stone-gray/20">
          <div className="p-3.5 border-b bg-amber-500/10 border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {isArabic ? 'طلبات جديدة واردة' : 'New Pending Orders'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white font-mono">
              {pendingOrders.length}
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[72vh]">
            {pendingOrders.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center text-xs text-stone-gray">
                <CheckCircle2 className="w-6 h-6 mb-1 opacity-50" />
                <span>{isArabic ? 'لا توجد طلبات معلقة' : 'No pending orders'}</span>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div
                  key={order.id}
                  data-testid="kds-order-card"
                  data-order-number={order.orderNumber}
                  className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-all ${
                    isDark
                      ? 'bg-dark-surface-elevated border-dark-border'
                      : 'bg-white border-[#EADAD0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-lantern-red font-mono" data-testid="kds-order-number">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        order.fulfillmentType === 'DELIVERY'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {order.fulfillmentType === 'DELIVERY' ? <Bike className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                      <span>{order.fulfillmentType}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black">{order.customerName}</h4>
                    <p className="text-[11px] text-stone-gray font-mono">{order.customerPhone}</p>
                    <p className="text-[11px] text-stone-gray truncate mt-0.5">{order.deliveryAddress}</p>
                  </div>

                  {/* Items Chit */}
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[11px]">
                        <div>
                          <span className="font-bold">
                            {item.quantity}x {item.name}
                          </span>
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <p className="text-[10px] text-stone-gray">
                              {item.selectedOptions.map((o) => o.optionName).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Advance to Kitchen Button */}
                  <button
                    type="button"
                    data-testid="start-preparing-btn"
                    onClick={() => {
                      playChime();
                      onUpdateOrderStatus(order.id, 'KITCHEN_PREPARING');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'قبول وبدء الطهي 👨‍🍳' : 'Start Preparing'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LANE 2: IN KITCHEN (PREPARING) */}
        <div className="flex flex-col rounded-3xl border overflow-hidden bg-black/5 dark:bg-white/5 border-stone-gray/20">
          <div className="p-3.5 border-b bg-orange-500/10 border-orange-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-orange-700 dark:text-orange-400">
                {isArabic ? 'قيد التحضير في المطبخ' : 'Cooking in Kitchen'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-orange-500 text-white font-mono">
              {kitchenOrders.length}
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[72vh]">
            {kitchenOrders.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center text-xs text-stone-gray">
                <span>{isArabic ? 'لا توجد أطباق قيد الطهي' : 'No items cooking'}</span>
              </div>
            ) : (
              kitchenOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-all ${
                    isDark
                      ? 'bg-dark-surface-elevated border-dark-border'
                      : 'bg-white border-[#EADAD0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-lantern-red font-mono">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{order.estimatedMinutes || 20}m ETA</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black">{order.customerName}</h4>
                    <p className="text-[11px] text-stone-gray">{order.fulfillmentType === 'DELIVERY' ? 'Doorstep Delivery' : 'Pickup'}</p>
                  </div>

                  {/* Items Chit */}
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[11px]">
                        <div>
                          <span className="font-bold">
                            {item.quantity}x {item.name}
                          </span>
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <p className="text-[10px] text-stone-gray">
                              {item.selectedOptions.map((o) => o.optionName).join(', ')}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-[10px] italic text-amber-600 font-bold">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Advance to Dispatch / Ready */}
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      onUpdateOrderStatus(
                        order.id,
                        order.fulfillmentType === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'READY_FOR_PICKUP'
                      );
                    }}
                    className="w-full py-2.5 px-3 rounded-xl font-black text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {order.fulfillmentType === 'DELIVERY' ? <Bike className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                    <span>
                      {order.fulfillmentType === 'DELIVERY'
                        ? isArabic
                          ? 'تسليم للسائق (Dispatch) 🛵'
                          : 'Dispatch to Courier 🛵'
                        : isArabic
                        ? 'جاهز على الكاونتر (Ready) 🛍️'
                        : 'Ready for Counter Pickup 🛍️'}
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LANE 3: OUT FOR DELIVERY / READY FOR PICKUP */}
        <div className="flex flex-col rounded-3xl border overflow-hidden bg-black/5 dark:bg-white/5 border-stone-gray/20">
          <div className="p-3.5 border-b bg-blue-500/10 border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                {isArabic ? 'في الطريق / جاهز للاستلام' : 'On Route / Ready'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white font-mono">
              {dispatchOrders.length}
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[72vh]">
            {dispatchOrders.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center text-xs text-stone-gray">
                <span>{isArabic ? 'لا توجد طلبات بالطريق' : 'No active couriers'}</span>
              </div>
            ) : (
              dispatchOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-all ${
                    isDark
                      ? 'bg-dark-surface-elevated border-dark-border'
                      : 'bg-white border-[#EADAD0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-lantern-red font-mono">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {order.status === 'OUT_FOR_DELIVERY' ? '🛵 With Courier' : '🛍️ Counter Ready'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black">{order.customerName}</h4>
                    <p className="text-[11px] text-stone-gray font-mono">{order.customerPhone}</p>
                    <p className="text-[11px] text-stone-gray truncate mt-0.5">{order.deliveryAddress}</p>
                  </div>

                  {/* Advance to Completed */}
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      onUpdateOrderStatus(order.id, 'DELIVERED');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تأكيد التسليم بنجاح ✅' : 'Confirm Delivered / Completed'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LANE 4: COMPLETED / ARCHIVED */}
        <div className="flex flex-col rounded-3xl border overflow-hidden bg-black/5 dark:bg-white/5 border-stone-gray/20">
          <div className="p-3.5 border-b bg-emerald-500/10 border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {isArabic ? 'تم التسليم بنجاح' : 'Delivered & Closed'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white font-mono">
              {completedOrders.length}
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[72vh]">
            {completedOrders.slice(0, 10).map((order) => (
              <div
                key={order.id}
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  isDark
                    ? 'bg-dark-surface/60 border-dark-border text-evening-cream/70'
                    : 'bg-[#FAF4EF] border-[#EADAD0] text-temple-brown/70'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="font-mono">{order.orderNumber}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                    {order.totalAmount.toFixed(2)} EGP
                  </span>
                </div>
                <p className="truncate font-semibold">{order.customerName}</p>
                <span className="text-[10px] text-stone-gray block">
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
