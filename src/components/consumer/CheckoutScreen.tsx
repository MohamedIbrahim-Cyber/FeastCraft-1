import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  MapPin,
  Clock,
  Phone,
  User,
  Mail,
  Building,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  CartItem,
  CouponDiscount,
  DeliveryZone,
  FulfillmentType,
  Order,
  PaymentMethod,
} from '../../types';
import { calculateOrderPricing } from '../../lib/mathEngine';

interface CheckoutScreenProps {
  cartItems: CartItem[];
  fulfillmentType: FulfillmentType;
  selectedZone: DeliveryZone | null;
  availableZones?: DeliveryZone[];
  addressDetails?: any;
  onUpdateAddressDetails?: (details: any) => void;
  customerInfo?: any;
  onUpdateCustomerInfo?: (info: any) => void;
  appliedCoupon?: CouponDiscount | null;
  onApplyCoupon?: (coupon: CouponDiscount | null) => void;
  availableCoupons?: CouponDiscount[];
  onBackToMenu: () => void;
  onPlaceOrder?: (
    paymentMethod: PaymentMethod,
    pricingBreakdown: {
      subtotal: number;
      deliveryFee: number;
      taxAmount: number;
      discountAmount: number;
      totalAmount: number;
    }
  ) => void;
  onPlaceOrderSuccess?: (createdOrder: Order) => void;
  onOpenZoneModal?: () => void;
  isArabic: boolean;
  isDark: boolean;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  cartItems,
  fulfillmentType,
  selectedZone,
  availableZones = [],
  addressDetails,
  onUpdateAddressDetails,
  customerInfo,
  onUpdateCustomerInfo,
  appliedCoupon = null,
  onApplyCoupon,
  availableCoupons = [],
  onBackToMenu,
  onPlaceOrder,
  onPlaceOrderSuccess,
  onOpenZoneModal,
  isArabic,
  isDark,
}) => {
  const safeZones = availableZones || [];
  // Form States
  const [customerName, setCustomerName] = useState(customerInfo?.name || 'Karim Mansour');
  const [customerPhone, setCustomerPhone] = useState(customerInfo?.phone || '+20 100 293 8472');
  const [customerEmail, setCustomerEmail] = useState(customerInfo?.email || 'karim@mansour.com');
  const [currentZoneId, setCurrentZoneId] = useState(
    selectedZone?.id || (safeZones.length > 0 ? safeZones[0].id : '')
  );
  const [streetAddress, setStreetAddress] = useState(
    addressDetails?.street || 'Villa 14, Street 18, 5th Settlement'
  );
  const [building, setBuilding] = useState(addressDetails?.building || 'Villa 14');
  const [floor, setFloor] = useState(addressDetails?.floor || 'Ground');
  const [apartment, setApartment] = useState(addressDetails?.apartment || 'Private Entrance');
  const [deliveryNotes, setDeliveryNotes] = useState(
    addressDetails?.deliveryNotes || 'Please ring doorbell twice upon arrival'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Zone
  const activeZone =
    safeZones.find((z) => z.id === currentZoneId) ||
    selectedZone ||
    (safeZones.length > 0 ? safeZones[0] : null);

  // Pricing calculation
  const pricing = calculateOrderPricing({
    items: cartItems,
    deliveryFee: activeZone?.deliveryFee || 35,
    fulfillmentType,
    coupon: appliedCoupon,
    taxRate: 0.14,
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!customerName.trim()) {
      setErrorMessage(isArabic ? 'يرجى إدخال اسم العميل' : 'Please enter customer name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 9) {
      setErrorMessage(isArabic ? 'يرجى إدخال رقم هاتف صحيح للتواصل' : 'Please enter a valid phone number');
      return;
    }
    if (fulfillmentType === 'DELIVERY' && !streetAddress.trim()) {
      setErrorMessage(isArabic ? 'يرجى إدخال عنوان التوصيل' : 'Please enter delivery street address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate randomized order reference
      const randomOrderNum = Math.floor(1000 + Math.random() * 9000);
      const orderId = `ord-${randomOrderNum}`;
      const orderNumber = `#FC-${randomOrderNum}`;

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        fulfillmentType,
        status: 'RECEIVED',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        deliveryZoneId: fulfillmentType === 'DELIVERY' ? activeZone?.id : undefined,
        deliveryZoneName: fulfillmentType === 'DELIVERY' ? activeZone?.zoneName : undefined,
        deliveryZoneNameAr: fulfillmentType === 'DELIVERY' ? activeZone?.zoneNameAr : undefined,
        deliveryAddress:
          fulfillmentType === 'DELIVERY'
            ? `${streetAddress.trim()}${building ? `, Bldg ${building}` : ''}${
                floor ? `, Fl ${floor}` : ''
              }${apartment ? `, Apt ${apartment}` : ''}`
            : 'FeastCraft Flagship - Downtown Cairo (12 Kasr El Nil St)',
        building: fulfillmentType === 'DELIVERY' ? building.trim() : undefined,
        floor: fulfillmentType === 'DELIVERY' ? floor.trim() : undefined,
        apartment: fulfillmentType === 'DELIVERY' ? apartment.trim() : undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        taxAmount: pricing.taxAmount,
        discountAmount: pricing.discountAmount,
        appliedCouponCode: pricing.appliedCouponCode,
        totalAmount: pricing.totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'PAYMOB_CARD' ? 'PAID' : 'UNPAID',
        paymentGatewayRef:
          paymentMethod === 'PAYMOB_CARD'
            ? `PM-${Date.now().toString().slice(-7)}`
            : undefined,
        estimatedMinutes:
          fulfillmentType === 'DELIVERY' ? activeZone?.estimatedMinutes || 35 : 15,
        createdAt: new Date().toISOString(),
        items: cartItems,
      };

      // Slight simulation delay for smooth UX
      setTimeout(() => {
        setIsSubmitting(false);
        if (onPlaceOrderSuccess) {
          onPlaceOrderSuccess(newOrder);
        } else if (onPlaceOrder) {
          onPlaceOrder(paymentMethod, {
            subtotal: pricing.subtotal,
            deliveryFee: pricing.deliveryFee,
            taxAmount: pricing.taxAmount,
            discountAmount: pricing.discountAmount,
            totalAmount: pricing.totalAmount,
          });
        }
      }, 700);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn">
      {/* Back to Menu Header */}
      <div className="mb-6 flex items-center justify-between">
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
          <span>{isArabic ? 'العودة إلى قائمة الطعام' : 'Back to Menu'}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>{isArabic ? 'دفع آمن ومعتمد' : 'Encrypted & Secure'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Checkout Form (8 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Customer Contact Information */}
            <div
              className={`p-5 sm:p-6 rounded-3xl border shadow-sm ${
                isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
                <div className="w-8 h-8 rounded-xl bg-lantern-red/10 text-lantern-red flex items-center justify-center font-black text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black">
                    {isArabic ? 'بيانات التواصل والعميل' : 'Customer & Contact Information'}
                  </h3>
                  <p className="text-xs text-stone-gray">
                    {isArabic ? 'نستخدم هذه البيانات لتحديثات حالة الطلب' : 'Used for SMS / Call updates'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-stone-gray block mb-1">
                    {isArabic ? 'الاسم بالكامل *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-gray absolute top-3 left-3" />
                    <input
                      id="customer-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Karim Mansour"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors focus:outline-none focus:border-lantern-red ${
                        isDark
                          ? 'bg-dark-surface border-dark-border text-evening-cream'
                          : 'bg-[#FAF4EF] border-[#DEC7B7] text-temple-brown'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-gray block mb-1">
                    {isArabic ? 'رقم الهاتف المحمول *' : 'Mobile Phone Number *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-gray absolute top-3 left-3" />
                    <input
                      id="customer-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+20 100 293 8472"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors focus:outline-none focus:border-lantern-red font-mono ${
                        isDark
                          ? 'bg-dark-surface border-dark-border text-evening-cream'
                          : 'bg-[#FAF4EF] border-[#DEC7B7] text-temple-brown'
                      }`}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-gray block mb-1">
                    {isArabic ? 'البريد الإلكتروني للإيصال (اختياري)' : 'Email for Receipt (Optional)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-gray absolute top-3 left-3" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="karim@mansour.com"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors focus:outline-none focus:border-lantern-red ${
                        isDark
                          ? 'bg-dark-surface border-dark-border text-evening-cream'
                          : 'bg-[#FAF4EF] border-[#DEC7B7] text-temple-brown'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Delivery Address / Pickup Branch */}
            <div
              className={`p-5 sm:p-6 rounded-3xl border shadow-sm ${
                isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
                <div className="w-8 h-8 rounded-xl bg-lantern-red/10 text-lantern-red flex items-center justify-center font-black text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black">
                    {fulfillmentType === 'DELIVERY'
                      ? isArabic
                        ? 'عنوان التوصيل السريع'
                        : 'Delivery Address'
                      : isArabic
                      ? 'موقع فرع الاستلام'
                      : 'Pickup Location'}
                  </h3>
                  <p className="text-xs text-stone-gray">
                    {fulfillmentType === 'DELIVERY'
                      ? isArabic
                        ? 'سيلتزم السائق بتوصيل الطلب ساخناً وطازجاً'
                        : 'Your courier will deliver hot & fresh to your door'
                      : isArabic
                      ? 'سيكون طلبك جاهزاً في الوقت المحدد'
                      : 'Your order will be packed and ready on time'}
                  </p>
                </div>
              </div>

              {fulfillmentType === 'DELIVERY' ? (
                <div className="space-y-3.5">
                  {/* Zone Selector */}
                  <div>
                    <label className="text-xs font-bold text-stone-gray block mb-1">
                      {isArabic ? 'منطقة التوصيل بالقاهرة *' : 'Cairo Delivery Zone *'}
                    </label>
                    <select
                      value={currentZoneId}
                      onChange={(e) => setCurrentZoneId(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors focus:outline-none focus:border-lantern-red ${
                        isDark
                          ? 'bg-dark-surface border-dark-border text-evening-cream'
                          : 'bg-[#FAF4EF] border-[#DEC7B7] text-temple-brown'
                      }`}
                    >
                      {safeZones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {isArabic ? z.zoneNameAr : z.zoneName} — {z.deliveryFee} EGP ({z.estimatedMinutes || 35} mins)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Street */}
                  <div>
                    <label className="text-xs font-bold text-stone-gray block mb-1">
                      {isArabic ? 'اسم الشارع والحي *' : 'Street Address & Neighborhood *'}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-gray absolute top-3 left-3" />
                      <input
                        id="street-address"
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="Villa 14, Street 18, 5th Settlement"
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors focus:outline-none focus:border-lantern-red ${
                          isDark
                            ? 'bg-dark-surface border-dark-border text-evening-cream'
                            : 'bg-[#FAF4EF] border-[#DEC7B7] text-temple-brown'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Building / Floor / Apt */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-stone-gray block mb-1">
                        {isArabic ? 'المبنى / الفيلا' : 'Building / Villa'}
                      </label>
                      <input
                        type="text"
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        placeholder="Villa 14"
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors focus:outline-none focus:border-lantern-red ${
                          isDark
                            ? 'bg-dark-surface border-dark-border text-evening-cream'
                            : 'bg-[#FAF4EF] border-[#DEC7B7] text-temple-brown'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-gray block mb-1">
                        {isArabic ? 'الطابق' : 'Floor'}
                      </label>
                      <input
                        type="text"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        placeholder="Ground"
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors focus:outline-none focus:border-lantern-red ${
                          isDark
                            ? 'bg-dark-surface border-dark-border text-evening-cream'
                            : 'bg-[#FAF4EF] border-[#DEC7B7] text-temple-brown'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-gray block mb-1">
                        {isArabic ? 'رقم الشقة' : 'Apartment'}
                      </label>
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Apt 2"
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors focus:outline-none focus:border-lantern-red ${
                          isDark
                            ? 'bg-dark-surface border-dark-border text-evening-cream'
                            : 'bg-[#FAF4EF] border-[#DEC7B7] text-temple-brown'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Courier Notes */}
                  <div>
                    <label className="text-xs font-bold text-stone-gray block mb-1">
                      {isArabic ? 'ملاحظات للسائق / الطيار (اختياري)' : 'Delivery Notes for Driver (Optional)'}
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-stone-gray absolute top-3 left-3" />
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder={
                          isArabic
                            ? 'مثال: رن الجرس مرتين، اترك الطلب مع الأمن...'
                            : 'e.g. Ring bell twice, leave with security...'
                        }
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors focus:outline-none focus:border-lantern-red ${
                          isDark
                            ? 'bg-dark-surface border-dark-border text-evening-cream'
                            : 'bg-[#FAF4EF] border-[#DEC7B7] text-temple-brown'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-stone-gray/20 flex items-start gap-3">
                  <Building className="w-5 h-5 text-lantern-red shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black">
                      {isArabic
                        ? 'فرع فيست كرافت وسط البلد'
                        : 'FeastCraft Flagship - Downtown Cairo'}
                    </h4>
                    <p className="text-xs text-stone-gray mt-0.5">
                      {isArabic
                        ? '١٢ شارع قصر النيل، ميدان التحرير، القاهرة'
                        : '12 Kasr El Nil Street, Tahrir Sq., Cairo'}
                    </p>
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {isArabic
                        ? 'وقت التجهيز المتوقع: ١٥ دقيقة'
                        : 'Estimated ready time: 15 mins'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Payment Method */}
            <div
              className={`p-5 sm:p-6 rounded-3xl border shadow-sm ${
                isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
                <div className="w-8 h-8 rounded-xl bg-lantern-red/10 text-lantern-red flex items-center justify-center font-black text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black">
                    {isArabic ? 'طريقة الدفع الفوري' : 'Payment Method'}
                  </h3>
                  <p className="text-xs text-stone-gray">
                    {isArabic
                      ? 'اختر الدفع عند الاستلام أو ببطاقة الفيزا / ماستركارد عبر بايموب'
                      : 'Pay upon delivery or securely via Paymob Card / InstaPay'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Cash On Delivery */}
                <div
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-lantern-red bg-lantern-red/10 shadow-xs'
                      : isDark
                      ? 'border-dark-border bg-dark-surface hover:border-lantern-red/40'
                      : 'border-[#E7D6C9] bg-[#FAF4EF] hover:bg-[#F2E5DB]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'CASH_ON_DELIVERY'
                          ? 'bg-lantern-red border-lantern-red text-white'
                          : 'border-stone-gray/40'
                      }`}
                    >
                      {paymentMethod === 'CASH_ON_DELIVERY' && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black">
                      {isArabic ? 'نقداً عند الاستلام' : 'Cash on Delivery (COD)'}
                    </h4>
                    <p className="text-[10px] text-stone-gray mt-0.5">
                      {isArabic ? 'الدفع كاش مع مندوب التوصيل' : 'Pay cash to the courier'}
                    </p>
                  </div>
                </div>

                {/* Online Card (Paymob) */}
                <div
                  onClick={() => setPaymentMethod('PAYMOB_CARD')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                    paymentMethod === 'PAYMOB_CARD'
                      ? 'border-lantern-red bg-lantern-red/10 shadow-xs'
                      : isDark
                      ? 'border-dark-border bg-dark-surface hover:border-lantern-red/40'
                      : 'border-[#E7D6C9] bg-[#FAF4EF] hover:bg-[#F2E5DB]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className="w-5 h-5 text-lantern-red" />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'PAYMOB_CARD'
                          ? 'bg-lantern-red border-lantern-red text-white'
                          : 'border-stone-gray/40'
                      }`}
                    >
                      {paymentMethod === 'PAYMOB_CARD' && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black">
                      {isArabic ? 'بطاقة بنكية (Paymob)' : 'Card Online (Paymob)'}
                    </h4>
                    <p className="text-[10px] text-stone-gray mt-0.5">
                      Visa, Mastercard, Meeza
                    </p>
                  </div>
                </div>

                {/* InstaPay / Mobile Wallet */}
                <div
                  onClick={() => setPaymentMethod('INSTAPAY_WALLET')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                    paymentMethod === 'INSTAPAY_WALLET'
                      ? 'border-lantern-red bg-lantern-red/10 shadow-xs'
                      : isDark
                      ? 'border-dark-border bg-dark-surface hover:border-lantern-red/40'
                      : 'border-[#E7D6C9] bg-[#FAF4EF] hover:bg-[#F2E5DB]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Smartphone className="w-5 h-5 text-cyan-600" />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'INSTAPAY_WALLET'
                          ? 'bg-lantern-red border-lantern-red text-white'
                          : 'border-stone-gray/40'
                      }`}
                    >
                      {paymentMethod === 'INSTAPAY_WALLET' && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black">
                      {isArabic ? 'إنستاباي / محفظة' : 'InstaPay / Mobile Wallet'}
                    </h4>
                    <p className="text-[10px] text-stone-gray mt-0.5">
                      Vodafone Cash, InstaPay IPN
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              id="checkout-place-order-btn"
              data-testid="checkout-place-order-btn"
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full py-4 px-6 rounded-2xl font-black text-base bg-lantern-red hover:bg-[#8B3426] text-white shadow-xl shadow-lantern-red/25 active:scale-98 transition-all flex items-center justify-between disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span>
                  {isSubmitting
                    ? isArabic
                      ? 'جارٍ إرسال الطلب للمطبخ...'
                      : 'Sending Order to Kitchen...'
                    : isArabic
                    ? 'تأكيد وإرسال الطلب'
                    : 'Confirm & Place Order'}
                </span>
              </div>
              <span className="font-mono text-lg">
                {pricing.totalAmount.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-5 sm:p-6 rounded-3xl border shadow-sm sticky top-24 ${
              isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
            }`}
          >
            <h3 className="text-base font-black mb-4 pb-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <span>{isArabic ? 'ملخص الطلب' : 'Order Summary'}</span>
              <span className="text-xs font-bold text-stone-gray font-mono">
                {cartItems.length} {isArabic ? 'أصناف' : 'items'}
              </span>
            </h3>

            {/* Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={isArabic ? item.nameAr : item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-black/10 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate">
                      <h4 className="font-black truncate">
                        {item.quantity}x {isArabic ? item.nameAr : item.name}
                      </h4>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-[10px] text-stone-gray truncate">
                          {item.selectedOptions.map((o) => (isArabic ? o.optionNameAr : o.optionName)).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="font-mono font-black text-lantern-red shrink-0">
                    {item.totalPrice.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-stone-gray font-semibold">
                <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-mono text-temple-brown dark:text-evening-cream">
                  {pricing.subtotal.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}
                </span>
              </div>

              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>
                    {isArabic ? 'خصم الكوبون' : 'Promo Discount'} ({pricing.appliedCouponCode})
                  </span>
                  <span className="font-mono">
                    -{pricing.discountAmount.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-stone-gray font-semibold">
                <span>
                  {fulfillmentType === 'DELIVERY'
                    ? isArabic
                      ? 'رسوم التوصيل'
                      : 'Delivery Fee'
                    : isArabic
                    ? 'استلام من الفرع'
                    : 'Store Pickup'}
                </span>
                <span className="font-mono text-temple-brown dark:text-evening-cream">
                  {fulfillmentType === 'PICKUP' ? (
                    <span className="text-emerald-600 font-bold">{isArabic ? 'مجاني' : 'FREE'}</span>
                  ) : (
                    `${pricing.deliveryFee.toFixed(2)} ${isArabic ? 'ج.م' : 'EGP'}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-stone-gray font-semibold">
                <span>{isArabic ? 'ضريبة القيمة المضافة (١٤٪)' : 'VAT (14%)'}</span>
                <span className="font-mono text-temple-brown dark:text-evening-cream">
                  {pricing.taxAmount.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}
                </span>
              </div>

              <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-between items-baseline font-black text-lg">
                <span className="text-temple-brown dark:text-evening-cream">
                  {isArabic ? 'الإجمالي المطلوب' : 'Total Amount'}
                </span>
                <div className="text-lantern-red font-mono flex items-baseline gap-1">
                  <span>{pricing.totalAmount.toFixed(2)}</span>
                  <span className="text-xs font-normal text-stone-gray">
                    {isArabic ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Estimated Delivery Note */}
            <div className="mt-4 p-3 rounded-2xl bg-lantern-red/10 border border-lantern-red/20 text-xs font-bold text-lantern-red flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                {fulfillmentType === 'DELIVERY'
                  ? isArabic
                    ? `وقت التوصيل المتوقع: ${activeZone?.estimatedMinutes || 35} دقيقة`
                    : `Estimated Delivery: ${activeZone?.estimatedMinutes || 35} mins`
                  : isArabic
                  ? 'جاهز للاستلام خلال: ١٥ دقيقة'
                  : 'Ready for pickup in 15 mins'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
