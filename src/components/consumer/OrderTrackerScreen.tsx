import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Bike,
  ChefHat,
  PackageCheck,
  Phone,
  MapPin,
  FileDown,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderTrackerScreenProps {
  order: Order;
  onBackToMenu: () => void;
  isArabic: boolean;
  isDark: boolean;
}

export const OrderTrackerScreen: React.FC<OrderTrackerScreenProps> = ({
  order,
  onBackToMenu,
  isArabic,
  isDark,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [minutesRemaining, setMinutesRemaining] = useState(order.estimatedMinutes || 30);

  // Sync with prop changes
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Read-only Real-Time Polling Effect (queries database/backend every 8s)
  useEffect(() => {
    if (!order?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.order) {
            setCurrentOrder(data.order);
          }
        }
      } catch (err) {
        // Silently handle network polling error
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [order?.id]);

  // Status index helper
  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'RECEIVED':
        return 0;
      case 'KITCHEN_PREPARING':
        return 1;
      case 'OUT_FOR_DELIVERY':
      case 'READY_FOR_PICKUP':
        return 2;
      case 'DELIVERED':
      case 'COMPLETED':
        return 3;
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStatusStepIndex(currentOrder.status);

  const steps = [
    {
      titleEn: 'Order Received',
      titleAr: 'تم استلام الطلب',
      descEn: 'Sent to kitchen display',
      descAr: 'تم التمرير لشاشات المطبخ',
      icon: Clock,
    },
    {
      titleEn: 'In Kitchen (Cooking)',
      titleAr: 'قيد التحضير في المطبخ',
      descEn: 'Chef Omar baking your food',
      descAr: 'شيف عمر يجهز البيتزا والبرجر',
      icon: ChefHat,
    },
    {
      titleEn: order.fulfillmentType === 'DELIVERY' ? 'Out for Delivery' : 'Ready for Pickup',
      titleAr: order.fulfillmentType === 'DELIVERY' ? 'خرج للتوصيل' : 'جاهز للاستلام',
      descEn: order.fulfillmentType === 'DELIVERY' ? 'Courier on the road' : 'Waiting at counter',
      descAr: order.fulfillmentType === 'DELIVERY' ? 'السائق متوجه لعنوانك' : 'الطلب بانتظارك بالفرع',
      icon: order.fulfillmentType === 'DELIVERY' ? Bike : PackageCheck,
    },
    {
      titleEn: order.fulfillmentType === 'DELIVERY' ? 'Delivered' : 'Picked Up',
      titleAr: order.fulfillmentType === 'DELIVERY' ? 'تم التوصيل' : 'تم الاستلام',
      descEn: 'Enjoy your FeastCraft!',
      descAr: 'بالهناء والشفاء!',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fadeIn">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBackToMenu}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
            isDark
              ? 'border-dark-border bg-dark-surface hover:bg-white/10 text-evening-cream'
              : 'border-[#DEC7B7] bg-white hover:bg-[#F4EBE3] text-temple-brown'
          }`}
        >
          {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isArabic ? 'العودة للمطعم' : 'Back to Restaurant Menu'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-lantern-red/10 text-lantern-red border border-lantern-red/20 font-mono">
            {order.orderNumber}
          </span>
        </div>
      </div>

      {/* Main Status Hero Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-lg relative overflow-hidden mb-6 ${
          isDark
            ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
            : 'bg-white border-[#EADAD0] text-temple-brown'
        }`}
      >
        {/* Background Subtle Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-lantern-red/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lantern-red flex items-center gap-1.5 mb-1">
              <Clock className="w-4 h-4" />
              {isArabic ? 'التتبع الحي الفوري للطلب' : 'Live Order Progress'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              {currentStep === 3
                ? isArabic
                  ? 'تم تسليم طلبك بالهناء والشفاء! 🎉'
                  : 'Order Delivered! Enjoy your Feast! 🎉'
                : currentStep === 2
                ? order.fulfillmentType === 'DELIVERY'
                  ? isArabic
                    ? 'الطلب في الطريق إليك الآن 🛵'
                    : 'Your food is on the way! 🛵'
                  : isArabic
                  ? 'طلبك جاهز للاستلام من الفرع 🛍️'
                  : 'Your order is ready for pickup! 🛍️'
                : currentStep === 1
                ? isArabic
                  ? 'شيف عمر يجهز وجبتك في المطبخ 👨‍🍳'
                  : 'Chef Omar is cooking your order 👨‍🍳'
                : isArabic
                ? 'تم تأكيد طلبك بنجاح ✅'
                : 'Order Confirmed & Received ✅'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-gray mt-1">
              {isArabic
                ? `طلب رقم ${order.orderNumber} • ${
                    order.fulfillmentType === 'DELIVERY' ? 'توصيل للمنزل' : 'استلام من الفرع'
                  }`
                : `Order ${order.orderNumber} • ${
                    order.fulfillmentType === 'DELIVERY' ? 'Doorstep Delivery' : 'Store Pickup'
                  }`}
            </p>
          </div>

          {currentStep < 3 && (
            <div className="p-4 rounded-2xl bg-lantern-red/10 border border-lantern-red/20 text-center shrink-0">
              <span className="text-[11px] font-bold text-stone-gray block">
                {isArabic ? 'الوقت التقديري المتبقي' : 'Estimated Arrival'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-lantern-red font-mono">
                ~{order.status === 'OUT_FOR_DELIVERY' ? 12 : order.status === 'READY_FOR_PICKUP' ? 0 : 25}{' '}
                <span className="text-xs font-normal">{isArabic ? 'دقيقة' : 'mins'}</span>
              </div>
            </div>
          )}
        </div>

        {/* 4-Step Progress Stepper */}
        <div className="relative my-8">
          {/* Progress Bar Line */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-stone-gray/20 -z-0 rounded-full" />
          <div
            className="absolute top-5 left-8 h-1 bg-lantern-red -z-0 rounded-full transition-all duration-700"
            style={{
              width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 85}%`,
            }}
          />

          <div className="grid grid-cols-4 gap-2 relative z-10">
            {steps.map((step, idx) => {
              const isPassed = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const Icon = step.icon;

              return (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isPassed
                        ? 'bg-lantern-red text-white shadow-md scale-105'
                        : isDark
                        ? 'bg-dark-surface border border-dark-border text-stone-gray'
                        : 'bg-white border border-[#DEC7B7] text-stone-gray'
                    } ${isCurrent ? 'ring-2 ring-lantern-red/40' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4
                    className={`text-xs font-black mt-2.5 leading-tight ${
                      isPassed ? 'text-temple-brown dark:text-evening-cream' : 'text-stone-gray'
                    }`}
                  >
                    {isArabic ? step.titleAr : step.titleEn}
                  </h4>
                  <p className="text-[10px] text-stone-gray hidden sm:block mt-0.5">
                    {isArabic ? step.descAr : step.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Driver Card & Destination Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Driver Card (if Delivery) */}
        {currentOrder.fulfillmentType === 'DELIVERY' ? (
          <div
            className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between ${
              isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-lantern-red/10 text-lantern-red flex items-center justify-center font-black text-lg">
                🛵
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-gray block">
                  {isArabic ? 'مندوب التوصيل' : 'FeastCraft Courier'}
                </span>
                <h4 className="text-sm font-black">Ahmed El-Sayed</h4>
                <p className="text-xs text-stone-gray">Honda Delivery Moto • 4.9 ★</p>
              </div>
            </div>

            <a
              href={`tel:+201000000000`}
              className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold transition-colors flex items-center gap-1.5 text-xs"
            >
              <Phone className="w-4 h-4" />
              <span>{isArabic ? 'اتصال' : 'Call'}</span>
            </a>
          </div>
        ) : (
          <div
            className={`p-5 rounded-3xl border shadow-sm flex items-center gap-3 ${
              isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-lantern-red/10 text-lantern-red flex items-center justify-center font-black text-lg">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-gray block">
                {isArabic ? 'فرع الاستلام' : 'Pickup Branch'}
              </span>
              <h4 className="text-sm font-black">
                {isArabic ? 'فرع وسط البلد' : 'Downtown Cairo Branch'}
              </h4>
              <p className="text-xs text-stone-gray">
                {isArabic ? '١٢ شارع قصر النيل، التحرير' : '12 Kasr El Nil St, Tahrir'}
              </p>
            </div>
          </div>
        )}

        {/* Destination / Address Card */}
        <div
          className={`p-5 rounded-3xl border shadow-sm flex items-center gap-3 ${
            isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-lantern-red/10 text-lantern-red flex items-center justify-center font-black text-lg shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-gray block">
              {currentOrder.fulfillmentType === 'DELIVERY'
                ? isArabic
                  ? 'وجهة التوصيل'
                  : 'Delivery Destination'
                : isArabic
                ? 'اسم المستلم'
                : 'Customer Contact'}
            </span>
            <h4 className="text-xs font-black truncate">{currentOrder.deliveryAddress}</h4>
            <p className="text-xs text-stone-gray font-mono mt-0.5">
              {currentOrder.customerName} • {currentOrder.customerPhone}
            </p>
          </div>
        </div>
      </div>

      {/* Order Itemized Receipt Snapshot */}
      <div
        className={`p-6 rounded-3xl border shadow-sm ${
          isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/5 dark:border-white/5">
          <div>
            <h3 className="text-base font-black">{isArabic ? 'تفاصيل الفاتورة والطلب' : 'Order Receipt'}</h3>
            <p className="text-xs text-stone-gray">
              {new Date(currentOrder.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              • {currentOrder.paymentMethod === 'PAYMOB_CARD' ? 'Paymob Card (Paid)' : 'Cash on Delivery'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 rounded-xl border border-stone-gray/30 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileDown className="w-4 h-4 text-lantern-red" />
            <span className="hidden sm:inline">{isArabic ? 'طباعة الإيصال' : 'Print Receipt'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {currentOrder.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1">
              <div>
                <span className="font-bold">
                  {item.quantity}x {isArabic ? item.nameAr : item.name}
                </span>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <p className="text-[10px] text-stone-gray">
                    {item.selectedOptions.map((o) => (isArabic ? o.optionNameAr : o.optionName)).join(', ')}
                  </p>
                )}
              </div>
              <span className="font-mono font-black text-lantern-red">
                {item.totalPrice.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 space-y-1.5 text-xs">
          <div className="flex justify-between text-stone-gray font-semibold">
            <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
            <span className="font-mono">{currentOrder.subtotal.toFixed(2)} EGP</span>
          </div>

          {currentOrder.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>{isArabic ? 'الخصم المطبق' : 'Discount'}</span>
              <span className="font-mono">-{currentOrder.discountAmount.toFixed(2)} EGP</span>
            </div>
          )}

          <div className="flex justify-between text-stone-gray font-semibold">
            <span>{isArabic ? 'التوصيل' : 'Delivery'}</span>
            <span className="font-mono">{currentOrder.deliveryFee.toFixed(2)} EGP</span>
          </div>

          <div className="flex justify-between text-stone-gray font-semibold">
            <span>{isArabic ? 'ضريبة القيمة المضافة (١٤٪)' : 'VAT (14%)'}</span>
            <span className="font-mono">{currentOrder.taxAmount.toFixed(2)} EGP</span>
          </div>

          <div className="pt-2 border-t border-black/10 dark:border-white/10 flex justify-between items-baseline font-black text-base">
            <span>{isArabic ? 'الإجمالي' : 'Total Paid'}</span>
            <span className="text-lantern-red font-mono text-lg">
              {currentOrder.totalAmount.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
