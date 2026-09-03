import Decimal from 'decimal.js';
import { CartItem, CouponDiscount, OrderPricingSummary } from '../types';

// Set standard precision for financial operations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface CalculateOrderPricingParams {
  items: CartItem[];
  deliveryFee?: number;
  fulfillmentType?: 'DELIVERY' | 'PICKUP';
  coupon?: CouponDiscount | null;
  taxRate?: number; // 0.14 for 14% Egyptian VAT
}

/**
 * Shared Fast-Casual Restaurant Order Pricing Engine
 * Computes exact monetary figures without floating-point inaccuracies.
 */
export function calculateOrderPricing({
  items = [],
  deliveryFee = 0,
  fulfillmentType = 'DELIVERY',
  coupon = null,
  taxRate = 0.14,
}: CalculateOrderPricingParams): OrderPricingSummary {
  // 1. Calculate Items Subtotal
  let subtotal = new Decimal(0);

  for (const item of items) {
    const unitPrice = new Decimal(item.unitPrice || item.basePrice || 0);
    const qty = new Decimal(Math.max(1, item.quantity || 1));
    const itemTotal = unitPrice.mul(qty);
    subtotal = subtotal.add(itemTotal);
  }

  // 2. Delivery Fee (0 for Pickup)
  const actualDeliveryFee = fulfillmentType === 'PICKUP' ? new Decimal(0) : new Decimal(deliveryFee || 0);

  // 3. Coupon Discount Calculation
  let discountAmount = new Decimal(0);
  if (coupon && subtotal.gte(coupon.minOrderAmount || 0)) {
    const percent = new Decimal(coupon.discountPercentage || 0).div(100);
    let calculatedDiscount = subtotal.mul(percent);

    if (coupon.maxDiscount && coupon.maxDiscount > 0) {
      const maxDisc = new Decimal(coupon.maxDiscount);
      if (calculatedDiscount.gt(maxDisc)) {
        calculatedDiscount = maxDisc;
      }
    }
    discountAmount = calculatedDiscount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }

  // 4. Subtotal after discount
  const subtotalAfterDiscount = Decimal.max(0, subtotal.sub(discountAmount));

  // 5. Tax (14% VAT applied on subtotal after discount)
  const tax = subtotalAfterDiscount.mul(new Decimal(taxRate)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  // 6. Total Amount
  const totalAmount = subtotalAfterDiscount.add(actualDeliveryFee).add(tax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    subtotal: subtotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    deliveryFee: actualDeliveryFee.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    taxAmount: tax.toNumber(),
    discountAmount: discountAmount.toNumber(),
    appliedCouponCode: coupon ? coupon.code : undefined,
    totalAmount: totalAmount.toNumber(),
  };
}

// Backward compatibility helper for legacy test suites or components
export function calculateBookingPricing(params: any): any {
  const items = params.items || [];
  let subtotal = new Decimal(0);
  const itemsBreakdown: any[] = [];

  for (const item of items) {
    const up = new Decimal(item.unitPrice || 0);
    const q = new Decimal(item.quantity || 1);
    const tot = up.mul(q);
    subtotal = subtotal.add(tot);
    itemsBreakdown.push({
      id: item.id,
      name: item.name,
      unitPrice: up.toFixed(2),
      quantity: q.toNumber(),
      total: tot.toFixed(2),
    });
  }

  const del = new Decimal(params.deliveryFee || 0);
  const total = subtotal.add(del);

  return {
    foodSubtotal: subtotal.toFixed(2),
    serviceFee: '0.00',
    deliveryFee: del.toFixed(2),
    grossSubtotal: total.toFixed(2),
    discountPercentage: '0.00',
    discountAmount: '0.00',
    totalAmount: total.toFixed(2),
    depositPercentage: '100',
    depositRequired: total.toFixed(2),
    remainingBalance: '0.00',
    itemsBreakdown,
  };
}

export default calculateOrderPricing;
