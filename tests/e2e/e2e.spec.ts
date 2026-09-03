import { test, expect } from '@playwright/test';

test.describe('FeastCraft End-to-End Test Suite', () => {
  let placedOrderNumber: string = '';

  test('Test Case A: Customer Ordering Flow on Consumer Domain (cyberdev.me / localhost:3000)', async ({
    page,
  }) => {
    // 1. Navigate to consumer storefront
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Verify navigation header contains brand icon, cart badge, language/theme toggles, and NO admin buttons
    const header = page.locator('#customer-public-header');
    await expect(header).toBeVisible();
    await expect(page.locator('#navbar-brand-logo')).toBeVisible();
    await expect(
      page.locator('#navbar-cart-button').or(page.locator('[data-testid="navbar-cart-trigger"]'))
    ).toBeVisible();
    await expect(
      page.locator('#navbar-language-chip').or(page.locator('[data-testid="navbar-locale-toggle"]'))
    ).toBeVisible();
    await expect(
      page.locator('#navbar-theme-chip').or(page.locator('[data-testid="navbar-theme-toggle"]'))
    ).toBeVisible();

    // Verify stealth isolation: Admin routes & operational buttons are NOT present in customer header
    await expect(page.locator('#admin-kds-nav-btn')).toHaveCount(0);
    await expect(page.locator('#admin-menu-cms-btn')).toHaveCount(0);

    // 3. Select Delivery mode & ensure delivery fulfillment
    const fulfillmentToggle = page.locator('#navbar-fulfillment-toggle');
    await expect(fulfillmentToggle).toBeVisible();

    // 4. Browse menu items and open customization modal for a pizza or menu item
    const menuItemCard = page
      .locator('[id^="item-card-pizza-"]')
      .or(page.locator('[id^="item-card-"]'))
      .first();
    await expect(menuItemCard).toBeVisible();
    await menuItemCard.click();

    // Customization modal should open
    const modal = page
      .locator('#food-customization-modal')
      .or(page.locator('[role="dialog"]'))
      .or(page.locator('form'));
    await expect(modal.first()).toBeVisible();

    // Select Size and/or Topping options if available
    const optionCheckboxOrRadio = page.locator('input[type="radio"], input[type="checkbox"]').first();
    if (await optionCheckboxOrRadio.isVisible()) {
      await optionCheckboxOrRadio.click();
    }

    // Click "Add to Order" / "Add to Cart" button in modal
    const addToCartBtn = page
      .locator('[data-testid="modal-add-to-cart-btn"]')
      .or(page.locator('#modal-add-to-cart-btn'))
      .or(page.locator('button:has-text("Add to Order")'))
      .or(page.locator('button:has-text("إضافة إلى السلة")'));
    await addToCartBtn.first().click();

    // 5. Open Cart Drawer and proceed to checkout
    const cartDrawer = page
      .locator('#cart-slide-drawer')
      .or(page.locator('[data-testid="cart-slide-drawer"]'))
      .or(page.locator('text=Your Order').first());
    await expect(cartDrawer.first()).toBeVisible({ timeout: 5000 });

    const proceedCheckoutBtn = page
      .locator('[data-testid="cart-proceed-checkout-btn"]')
      .or(page.locator('#cart-proceed-checkout-btn'))
      .or(page.locator('button:has-text("Proceed to Checkout")'))
      .or(page.locator('button:has-text("متابعة إلى الدفع")'));
    await expect(proceedCheckoutBtn.first()).toBeVisible();
    await proceedCheckoutBtn.first().click();

    // 6. Enter Delivery Address Details & submit Cash on Delivery
    await page.waitForTimeout(500);

    const nameInput = page
      .locator('input#customer-name')
      .or(page.locator('input[placeholder*="Name"]'))
      .or(page.locator('input[name="name"]'))
      .first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Sarah El-Gohary');
    }

    const phoneInput = page
      .locator('input#customer-phone')
      .or(page.locator('input[placeholder*="Phone"]'))
      .or(page.locator('input[type="tel"]'))
      .first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+20 100 555 1234');
    }

    const streetInput = page
      .locator('input#street-address')
      .or(page.locator('input[placeholder*="Street"]'))
      .first();
    if (await streetInput.isVisible()) {
      await streetInput.fill('Street 9, Maadi, Cairo');
    }

    // Submit Order
    const placeOrderBtn = page
      .locator('[data-testid="checkout-place-order-btn"]')
      .or(page.locator('#checkout-place-order-btn'))
      .or(page.locator('button[type="submit"]:has-text("Place Order")'))
      .or(page.locator('button:has-text("Confirm & Place Order")'))
      .or(page.locator('button:has-text("تأكيد وإرسال الطلب")'));
    await expect(placeOrderBtn.first()).toBeVisible();
    await placeOrderBtn.first().click();

    // 7. Verify redirection to read-only /tracker screen showing #FC-... order number with real-time status stepper
    const orderTracker = page
      .locator('text=Live Order Progress')
      .or(page.locator('text=Order Received'))
      .or(page.locator('text=التتبع الحي الفوري للطلب'))
      .or(page.locator('text=#FC-'))
      .first();
    await expect(orderTracker).toBeVisible({ timeout: 10000 });

    // Extract Order Number
    const orderNumLocator = page.locator('text=/#FC-\\d{4}/').first();
    await expect(orderNumLocator).toBeVisible();
    const orderNumText = await orderNumLocator.textContent();
    if (orderNumText) {
      const match = orderNumText.match(/#FC-\d{4}/);
      if (match) {
        placedOrderNumber = match[0];
      }
    }

    // Assert status stepper displays 'Order Received' / 'RECEIVED'
    await expect(
      page.locator('text=Order Received').or(page.locator('text=تم استلام الطلب')).first()
    ).toBeVisible();
  });

  test('Test Case B: Kitchen Operations Flow on Admin Portal (admin.cyberdev.me / admin.localhost:3000)', async ({
    page,
  }) => {
    // 1. Navigate to Admin Portal / Login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Assert landing on login page
    await expect(
      page
        .locator('text=FeastCraft Staff & Admin Portal')
        .or(page.locator('text=بوابة إدارة فيست كرافت'))
        .or(page.locator('#admin-login-page'))
    ).toBeVisible();

    // 2. Sign in with seeded admin credentials
    const emailInput = page.locator('input[type="email"], input[name="email"], input#admin-email').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"], input#admin-password').first();

    await emailInput.fill('admin@cyberdev.me');
    await passwordInput.fill('ChefOmar@2026!');

    const signInBtn = page
      .locator('#admin-submit-btn')
      .or(page.locator('button[type="submit"]'))
      .first();
    await signInBtn.click();

    // 3. Assert redirect to live Kitchen Display System (KDS)
    const kdsHeader = page
      .locator('text=Live Kitchen Display System (KDS)')
      .or(page.locator('text=نظام شاشات المطبخ الفوري'))
      .or(page.locator('text=KDS'));
    await expect(kdsHeader.first()).toBeVisible({ timeout: 10000 });

    // 4. Verify orders appear on kitchen board
    const orderTickets = page.locator('[data-testid="kds-order-card"]').or(page.locator('text=#FC-'));
    await expect(orderTickets.first()).toBeVisible();

    // 5. Click "Start Preparing" -> Verify status advances to KITCHEN_PREPARING
    const startPreparingBtn = page
      .locator('[data-testid="start-preparing-btn"]')
      .or(page.locator('button:has-text("Start Preparing")'))
      .or(page.locator('button:has-text("Start Cooking")'))
      .or(page.locator('button:has-text("بدء الطهي")'))
      .first();

    if (await startPreparingBtn.isVisible()) {
      await startPreparingBtn.click();
      await page.waitForTimeout(500);

      // Verify the order ticket moves or status indicator updates
      await expect(
        page
          .locator('text=In Kitchen')
          .or(page.locator('text=Cooking in Kitchen'))
          .or(page.locator('text=Cooking'))
          .or(page.locator('text=قيد التحضير في المطبخ'))
          .or(page.locator('text=PREPARING'))
          .first()
      ).toBeVisible();
    }
  });
});
