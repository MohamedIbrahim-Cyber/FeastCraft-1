import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { CartItem, CouponDiscount, DeliveryZone, FulfillmentType, MenuItem } from '../../types';
import { calculateOrderPricing } from '../../lib/mathEngine';

interface CartSlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart?: () => void;
  onProceedToCheckout: () => void;
  fulfillmentType: FulfillmentType;
  deliveryFee?: number;
  selectedZone?: DeliveryZone | null;
  onOpenZoneModal?: () => void;
  appliedCoupon: CouponDiscount | null;
  onApplyCoupon: (coupon: CouponDiscount | null) => void;
  availableCoupons?: CouponDiscount[];
  upsellMenuItems?: MenuItem[];
  onQuickAddItem?: (item: MenuItem) => void;
  isArabic: boolean;
  isDark: boolean;
}

export const CartSlideDrawer: React.FC<CartSlideDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart = () => {},
  onProceedToCheckout,
  fulfillmentType,
  deliveryFee,
  selectedZone = null,
  onOpenZoneModal = () => {},
  appliedCoupon,
  onApplyCoupon,
  availableCoupons = [],
  upsellMenuItems = [],
  onQuickAddItem = (_item?: MenuItem) => {},
  isArabic,
  isDark,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute pricing using precision mathEngine
  const computedDeliveryFee =
    deliveryFee !== undefined
      ? deliveryFee
      : selectedZone?.deliveryFee || 35;

  const pricing = calculateOrderPricing({
    items: cartItems,
    deliveryFee: computedDeliveryFee,
    fulfillmentType,
    coupon: appliedCoupon,
    taxRate: 0.14,
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const codeToSearch = couponInput.trim().toUpperCase();
    if (!codeToSearch) {
      setCouponError(isArabic ? 'يرجى إدخال كود الخصم' : 'Please enter a promo code');
      return;
    }

    const couponsList = availableCoupons || [];
    const found = couponsList.find((c) => c.code.toUpperCase() === codeToSearch);
    if (!found) {
      setCouponError(isArabic ? 'كود الخصم غير صالح أو منتهي الصلاحية' : 'Invalid promo code');
      return;
    }

    if (pricing.subtotal < (found.minOrderAmount || 0)) {
      setCouponError(
        isArabic
          ? `الحد الأدنى للطلب لتفعيل هذا الكود هو ${found.minOrderAmount} ج.م`
          : `Minimum order for this promo code is ${found.minOrderAmount} EGP`
      );
      return;
    }

    onApplyCoupon(found);
    setCouponSuccess(
      isArabic
        ? `تم تطبيق خصم ${found.discountPercentage}% بنجاح!`
        : `Applied ${found.discountPercentage}% discount successfully!`
    );
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop Click */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-in Drawer Container */}
      <div
        id="cart-slide-drawer"
        data-testid="cart-slide-drawer"
        className={`w-full max-w-md sm:max-w-lg h-full flex flex-col shadow-2xl transition-transform duration-300 border-s ${
          isDark
            ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
            : 'bg-[#FCF7F3] border-[#E5D2C3] text-temple-brown'
        }`}
      >
        {/* Drawer Header */}
        <div
          className={`p-4 sm:p-5 pt-safe border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-dark-border bg-dark-surface' : 'border-[#E8D4C5] bg-[#FAF3EC]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-lantern-red/10 text-lantern-red flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">{isArabic ? 'سلة طلبك' : 'Your Feast Order'}</h2>
              <p className="text-xs text-stone-gray">
                {cartItems.length}{' '}
                {cartItems.length === 1
                  ? isArabic
                    ? 'صنف محدد'
                    : 'item added'
                  : isArabic
                  ? 'أصناف محددة'
                  : 'items added'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="p-2 rounded-xl text-stone-gray hover:text-red-600 transition-colors"
                title={isArabic ? 'تفريغ السلة' : 'Clear Cart'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-stone-gray hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Fulfillment & Zone Quick Banner */}
        <div
          onClick={onOpenZoneModal}
          className={`px-4 py-2.5 border-b cursor-pointer flex items-center justify-between text-xs font-semibold transition-colors ${
            isDark
              ? 'bg-dark-surface/60 border-dark-border hover:bg-dark-surface'
              : 'bg-white border-[#E8D4C5] hover:bg-[#F7EFE9]'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-lg bg-lantern-red/10 text-lantern-red flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="font-black text-lantern-red">
                {fulfillmentType === 'DELIVERY'
                  ? isArabic
                    ? 'توصيل سريع: '
                    : 'Fast Delivery: '
                  : isArabic
                  ? 'استلام من الفرع: '
                  : 'Pickup Branch: '}
              </span>
              <span className="text-stone-gray">
                {fulfillmentType === 'DELIVERY'
                  ? selectedZone
                    ? isArabic
                      ? selectedZone.zoneNameAr
                      : selectedZone.zoneName
                    : isArabic
                    ? 'اختر منطقة التوصيل'
                    : 'Select delivery zone'
                  : isArabic
                  ? 'فرع وسط البلد (١٢ شارع قصر النيل)'
                  : 'Downtown Branch (12 Kasr El Nil St)'}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-black text-lantern-red underline shrink-0">
            {isArabic ? 'تغيير' : 'Change'}
          </span>
        </div>

        {/* Items List / Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-lantern-red/10 text-lantern-red flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-10 h-10 opacity-70" />
              </div>
              <div>
                <h3 className="text-base font-black mb-1">
                  {isArabic ? 'سلة طلبك فارغة حالياً' : 'Your cart is empty'}
                </h3>
                <p className="text-xs text-stone-gray max-w-xs leading-relaxed">
                  {isArabic
                    ? 'اختر من البيتزا الكرافت اللذيذة أو ساندوتشات السماش برجر لبدء طلبك!'
                    : 'Explore our wood-fired artisanal pizzas, smash burgers, and crispy wings to start your order!'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-lantern-red text-white text-xs font-black shadow-md hover:bg-[#8B3426] transition-colors"
              >
                {isArabic ? 'تصفح القائمة الآن' : 'Browse Feast Menu'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((cartItem) => (
                <div
                  key={cartItem.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isDark
                      ? 'bg-dark-surface border-dark-border'
                      : 'bg-white border-[#EADAD0]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Item Image */}
                    <img
                      src={cartItem.imageUrl}
                      alt={isArabic ? cartItem.nameAr : cartItem.name}
                      className="w-16 h-16 rounded-xl object-cover bg-black/10 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-black truncate">
                          {isArabic ? cartItem.nameAr : cartItem.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(cartItem.id)}
                          className="text-stone-gray hover:text-red-500 transition-colors p-0.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Options Chips */}
                      {cartItem.selectedOptions && cartItem.selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 my-1.5">
                          {cartItem.selectedOptions.map((opt, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-gray/10 text-stone-gray"
                            >
                              {isArabic ? opt.optionNameAr : opt.optionName}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Special Notes */}
                      {cartItem.specialInstructions && (
                        <p className="text-[10px] italic text-stone-gray truncate my-0.5">
                          "{cartItem.specialInstructions}"
                        </p>
                      )}

                      {/* Quantity Stepper & Price Row */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-1.5 rounded-xl p-0.5 bg-black/5 dark:bg-white/5 border border-stone-gray/20">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity - 1)}
                            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-stone-gray" />
                          </button>
                          <span className="w-6 text-center text-xs font-black font-mono">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity + 1)}
                            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-stone-gray" />
                          </button>
                        </div>

                        <div className="text-end">
                          <span className="text-sm font-black font-mono text-lantern-red">
                            {cartItem.totalPrice.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{' '}
                            <span className="text-[11px] font-normal text-stone-gray">
                              {isArabic ? 'ج.م' : 'EGP'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upsell Addons Carousel (Quick Add) */}
          {cartItems.length > 0 && upsellMenuItems.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-wider">
                  {isArabic ? 'يكمل وجبتك (إضافات ومشروبات سريعة)' : 'Frequently Added Together'}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {upsellMenuItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all ${
                      isDark
                        ? 'bg-dark-surface border-dark-border'
                        : 'bg-white border-[#EADAD0]'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={isArabic ? item.nameAr : item.name}
                      className="w-11 h-11 rounded-lg object-cover bg-black/10 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[11px] font-black truncate">
                        {isArabic ? item.nameAr : item.name}
                      </h5>
                      <span className="text-[11px] font-mono font-bold text-lantern-red block">
                        +{item.basePrice} {isArabic ? 'ج.م' : 'EGP'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuickAddItem(item)}
                        className="mt-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-lantern-red/10 hover:bg-lantern-red hover:text-white text-lantern-red transition-colors flex items-center gap-0.5"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>{isArabic ? 'أضف' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promo Code Box */}
          {cartItems.length > 0 && (
            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#EADAD0]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-lantern-red" />
                  <span className="text-xs font-black">
                    {isArabic ? 'كوبون الخصم' : 'Promo Voucher'}
                  </span>
                </div>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[10px] font-bold text-red-500 hover:underline"
                  >
                    {isArabic ? 'إلغاء الكوبون' : 'Remove'}
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {appliedCoupon.code} (-{appliedCoupon.discountPercentage}%)
                    </span>
                  </div>
                  <span className="font-mono">
                    -{pricing.discountAmount} {isArabic ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={isArabic ? 'أدخل الكود (FEAST20)' : 'Enter code (e.g. FEAST20)'}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors focus:outline-none focus:border-lantern-red ${
                      isDark
                        ? 'bg-dark-surface-elevated border-dark-border text-evening-cream placeholder-stone-gray/60'
                        : 'bg-[#FAF4EF] border-[#DEC7B7] text-temple-brown placeholder-stone-gray/60'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-black bg-temple-brown hover:bg-black text-evening-cream transition-colors"
                  >
                    {isArabic ? 'تطبيق' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] font-bold text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}
              {couponSuccess && (
                <p className="text-[11px] font-bold text-emerald-500 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{couponSuccess}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer with Financial Summary */}
        {cartItems.length > 0 && (
          <div
            className={`p-4 sm:p-5 pb-safe border-t space-y-3 ${
              isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#FAF3EC] border-[#E8D4C5]'
            }`}
          >
            {/* Breakdown lines */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-gray font-semibold">
                <span>{isArabic ? 'مجموع الأصناف' : 'Subtotal'}</span>
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

              <div className="pt-2 border-t border-black/10 dark:border-white/10 flex justify-between items-baseline font-black text-base sm:text-lg">
                <span className="text-temple-brown dark:text-evening-cream">
                  {isArabic ? 'الإجمالي النهائي' : 'Grand Total'}
                </span>
                <div className="text-lantern-red font-mono flex items-baseline gap-1">
                  <span>{pricing.totalAmount.toFixed(2)}</span>
                  <span className="text-xs font-normal text-stone-gray">
                    {isArabic ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              id="cart-proceed-checkout-btn"
              data-testid="cart-proceed-checkout-btn"
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-lantern-red hover:bg-[#8B3426] text-white shadow-lg shadow-lantern-red/25 active:scale-98 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{isArabic ? 'متابعة إلى الدفع' : 'Proceed to Checkout'}</span>
                {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </div>
              <span className="font-mono text-base">
                {pricing.totalAmount.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
