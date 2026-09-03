import { describe, it, expect } from 'vitest';
import { calculateOrderPricing } from '../../src/lib/mathEngine';
import { CartItem, CouponDiscount } from '../../src/types';

describe('Fast-Casual Math Engine - calculateOrderPricing', () => {
  const sampleItems: CartItem[] = [
    {
      id: 'cart-item-1',
      menuItemId: 'pizza-truffle',
      name: 'Truffle Funghi Craft Pizza',
      nameAr: 'بيتزا ترافل فونجي',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      basePrice: 220,
      selectedOptions: [
        {
          groupId: 'opt-size',
          groupName: 'Size',
          groupNameAr: 'الحجم',
          optionId: 'sz-l',
          optionName: 'Large 13"',
          optionNameAr: 'كبير',
          priceDelta: 60,
        },
      ],
      quantity: 2,
      unitPrice: 280, // 220 + 60
      totalPrice: 560, // 280 * 2
    },
    {
      id: 'cart-item-2',
      menuItemId: 'side-wings',
      name: 'Smokey Chipotle BBQ Wings',
      nameAr: 'أجنحة دجاج مدخنة',
      imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f',
      basePrice: 140,
      selectedOptions: [],
      quantity: 1,
      unitPrice: 140,
      totalPrice: 140,
    },
  ];

  it('1. Computes exact subtotal, 14% VAT, and delivery fee correctly', () => {
    // Subtotal = 560 + 140 = 700 EGP
    // Delivery Fee = 35 EGP
    // Discount = 0
    // Tax = 700 * 0.14 = 98 EGP
    // Total = 700 + 35 + 98 = 833 EGP
    const result = calculateOrderPricing({
      items: sampleItems,
      deliveryFee: 35,
      fulfillmentType: 'DELIVERY',
      coupon: null,
    });

    expect(result.subtotal).toBe(700);
    expect(result.deliveryFee).toBe(35);
    expect(result.discountAmount).toBe(0);
    expect(result.taxAmount).toBe(98);
    expect(result.totalAmount).toBe(833);
  });

  it('2. Waives delivery fee (0 EGP) when fulfillmentType is PICKUP', () => {
    const result = calculateOrderPricing({
      items: sampleItems,
      deliveryFee: 40, // Even if passed, must be 0 for PICKUP
      fulfillmentType: 'PICKUP',
      coupon: null,
    });

    expect(result.subtotal).toBe(700);
    expect(result.deliveryFee).toBe(0);
    expect(result.taxAmount).toBe(98);
    expect(result.totalAmount).toBe(798); // 700 + 0 + 98
  });

  it('3. Accurately applies percentage coupon with max discount cap', () => {
    const cappedCoupon: CouponDiscount = {
      code: 'FEAST20',
      discountPercentage: 20, // 20% of 700 = 140, but capped at 100
      maxDiscount: 100,
      minOrderAmount: 200,
    };

    const result = calculateOrderPricing({
      items: sampleItems,
      deliveryFee: 30,
      fulfillmentType: 'DELIVERY',
      coupon: cappedCoupon,
    });

    // Subtotal: 700
    // Discount: 100 (capped)
    // Subtotal after discount: 600
    // Tax: 600 * 0.14 = 84
    // Delivery: 30
    // Total: 600 + 30 + 84 = 714
    expect(result.subtotal).toBe(700);
    expect(result.discountAmount).toBe(100);
    expect(result.taxAmount).toBe(84);
    expect(result.deliveryFee).toBe(30);
    expect(result.totalAmount).toBe(714);
  });

  it('4. Ignores coupon when subtotal is below minimum order amount', () => {
    const highMinCoupon: CouponDiscount = {
      code: 'BIGSPEND',
      discountPercentage: 30,
      minOrderAmount: 1000, // min 1000, but order is 700
    };

    const result = calculateOrderPricing({
      items: sampleItems,
      deliveryFee: 30,
      fulfillmentType: 'DELIVERY',
      coupon: highMinCoupon,
    });

    expect(result.discountAmount).toBe(0);
    expect(result.totalAmount).toBe(828); // 700 + 30 + (700 * 0.14 = 98)
  });

  it('5. Handles empty cart gracefully without NaN or negative numbers', () => {
    const result = calculateOrderPricing({
      items: [],
      deliveryFee: 30,
      fulfillmentType: 'DELIVERY',
    });

    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.deliveryFee).toBe(30);
    expect(result.totalAmount).toBe(30);
  });
});
