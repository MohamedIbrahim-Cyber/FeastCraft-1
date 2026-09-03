import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import { calculateOrderPricing } from '../../src/lib/mathEngine';
import { CartItem, CouponDiscount } from '../../src/types';
import { verifyPassword, hashPassword } from '../../src/lib/auth';

describe('Unit & Logic Tests - Order Calculations & Financial Math', () => {
  it('1. Calculates item option modifiers accurately (Base 120 + Large 40 + Extra Cheese 20 = 180 EGP)', () => {
    // Construct cart item with base price 120 and two option modifiers (+40 and +20)
    const basePizzaPrice = 120;
    const selectedOptions = [
      {
        groupId: 'opt-size',
        groupName: 'Size',
        groupNameAr: 'الحجم',
        optionId: 'sz-large',
        optionName: 'Large 13"',
        optionNameAr: 'كبير',
        priceDelta: 40,
      },
      {
        groupId: 'opt-cheese',
        groupName: 'Topping',
        groupNameAr: 'إضافات',
        optionId: 'top-extra-cheese',
        optionName: 'Extra Buffalo Mozzarella',
        optionNameAr: 'جبنة إضافية',
        priceDelta: 20,
      },
    ];

    const unitPrice =
      basePizzaPrice + selectedOptions.reduce((acc, opt) => acc + opt.priceDelta, 0);

    expect(unitPrice).toBe(180);

    const customizedPizzaItem: CartItem = {
      id: 'cart-item-custom-pizza',
      menuItemId: 'pizza-margherita',
      name: 'Artisan Margherita Pizza',
      nameAr: 'بيتزا مارجريتا',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      basePrice: basePizzaPrice,
      selectedOptions,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice * 1,
    };

    const result = calculateOrderPricing({
      items: [customizedPizzaItem],
      deliveryFee: 0,
      fulfillmentType: 'PICKUP',
      coupon: null,
      taxRate: 0.14,
    });

    expect(result.subtotal).toBe(180);
    expect(result.taxAmount).toBe(25.2); // 180 * 0.14 = 25.20
    expect(result.deliveryFee).toBe(0);
    expect(result.totalAmount).toBe(205.2); // 180 + 25.20 = 205.20
  });

  it('2. Accurately adds delivery fee and verifies total consistency across multiple items and quantities', () => {
    const item1: CartItem = {
      id: 'item-1',
      menuItemId: 'pizza-pepperoni',
      name: 'Hot Honey Pepperoni Pizza',
      nameAr: 'بيتزا بيبيروني بالعسل الحار',
      imageUrl: '',
      basePrice: 195,
      selectedOptions: [],
      quantity: 2,
      unitPrice: 195,
      totalPrice: 390,
    };

    const item2: CartItem = {
      id: 'item-2',
      menuItemId: 'drink-cola',
      name: 'Craft Kola',
      nameAr: 'كولا كرافت',
      imageUrl: '',
      basePrice: 35,
      selectedOptions: [],
      quantity: 3,
      unitPrice: 35,
      totalPrice: 105,
    };

    // Subtotal = (195 * 2) + (35 * 3) = 390 + 105 = 495 EGP
    // Delivery Fee = 30 EGP
    // Tax = 495 * 0.14 = 69.30 EGP
    // Total = 495 + 30 + 69.30 = 594.30 EGP
    const result = calculateOrderPricing({
      items: [item1, item2],
      deliveryFee: 30,
      fulfillmentType: 'DELIVERY',
      coupon: null,
      taxRate: 0.14,
    });

    expect(result.subtotal).toBe(495);
    expect(result.deliveryFee).toBe(30);
    expect(result.taxAmount).toBe(69.3);
    expect(result.totalAmount).toBe(594.3);
  });

  it('3. Validates monetary precision without floating-point drift (e.g., 0.1 + 0.2 precision test)', () => {
    // Create items with fractional pricing to simulate potential IEEE-754 drift
    const oddItem1: CartItem = {
      id: 'odd-1',
      menuItemId: 'dip-sauce',
      name: 'Garlic Aioli Dip',
      nameAr: 'ثومية أيولي',
      imageUrl: '',
      basePrice: 19.99,
      selectedOptions: [],
      quantity: 3,
      unitPrice: 19.99,
      totalPrice: 59.97,
    };

    const oddItem2: CartItem = {
      id: 'odd-2',
      menuItemId: 'artisan-cookie',
      name: 'Tahini Chocolate Chunk Cookie',
      nameAr: 'كوكيز شوكولاتة بالطحينة',
      imageUrl: '',
      basePrice: 42.55,
      selectedOptions: [],
      quantity: 2,
      unitPrice: 42.55,
      totalPrice: 85.1,
    };

    // Subtotal = 59.97 + 85.10 = 145.07
    // Tax = 145.07 * 0.14 = 20.3098 -> rounds to 20.31
    // Delivery Fee = 25.50
    // Total = 145.07 + 20.31 + 25.50 = 190.88
    const result = calculateOrderPricing({
      items: [oddItem1, oddItem2],
      deliveryFee: 25.5,
      fulfillmentType: 'DELIVERY',
      taxRate: 0.14,
    });

    expect(result.subtotal).toBe(145.07);
    expect(result.taxAmount).toBe(20.31);
    expect(result.deliveryFee).toBe(25.5);
    expect(result.totalAmount).toBe(190.88);
  });

  it('4. Applies discount coupons with cap and recalculates net tax on discounted subtotal', () => {
    const item: CartItem = {
      id: 'item-festive',
      menuItemId: 'platter-ribs',
      name: 'Smoked Short Rib Platter',
      nameAr: 'طبق ريش بقري مدخنة',
      imageUrl: '',
      basePrice: 500,
      selectedOptions: [],
      quantity: 2,
      unitPrice: 500,
      totalPrice: 1000,
    };

    const coupon: CouponDiscount = {
      code: 'FEAST25',
      discountPercentage: 25, // 25% of 1000 = 250, capped at 150 EGP
      maxDiscount: 150,
      minOrderAmount: 300,
    };

    // Subtotal = 1000
    // Discount = 150 (max cap enforced)
    // Discounted subtotal = 850
    // Tax = 850 * 0.14 = 119.00
    // Delivery Fee = 40
    // Total = 850 + 40 + 119 = 1009.00
    const result = calculateOrderPricing({
      items: [item],
      deliveryFee: 40,
      fulfillmentType: 'DELIVERY',
      coupon,
      taxRate: 0.14,
    });

    expect(result.subtotal).toBe(1000);
    expect(result.discountAmount).toBe(150);
    expect(result.taxAmount).toBe(119);
    expect(result.deliveryFee).toBe(40);
    expect(result.totalAmount).toBe(1009);
    expect(result.appliedCouponCode).toBe('FEAST25');
  });

  it('5. Verifies bcryptjs password hashing and password matching during authentication checks', async () => {
    const rawPassword = 'ChefOmar@2026!';
    const hashedPassword = await hashPassword(rawPassword);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword.startsWith('$2')).toBe(true);

    // Matching password verification
    const isValid = await verifyPassword(rawPassword, hashedPassword);
    expect(isValid).toBe(true);

    // Non-matching password verification
    const isInvalid = await verifyPassword('WrongPassword123!', hashedPassword);
    expect(isInvalid).toBe(false);

    // Check with synchronous bcrypt method as well
    const syncValid = bcrypt.compareSync(rawPassword, hashedPassword);
    expect(syncValid).toBe(true);
  });
});
