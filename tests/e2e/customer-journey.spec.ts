import { test, expect } from '@playwright/test';

test.describe('End-to-End Customer Booking & Customization Journey', () => {
  test('Complete 5-step banquet customization, spending tier calculation, Paymob checkout, and invoice generation', async ({ page }) => {
    // 1. Navigate to /customize
    await page.goto('/customize');
    await page.waitForLoadState('networkidle');

    // Verify initial layout and title
    await expect(page).toHaveTitle(/FeastCraft/i);

    // 2. Step 1: Venue Selection
    // Select The Grand Palace Ballroom
    const palaceBallroom = page.locator('[data-testid="venue-card-palace-ballroom"]');
    if (await palaceBallroom.isVisible()) {
      await palaceBallroom.click();
    } else {
      // Fallback to Nile Terrace if already selected
      await page.locator('[data-testid="venue-card-nile-terrace"]').click();
    }

    // Advance to Step 2
    await page.locator('[data-testid="next-step-btn"]').first().click();

    // 3. Step 2: Course Selection (Starters & Mains)
    // Filter and pick dishes
    const starterItem = page.locator('[data-testid="dish-card-starter-1"]');
    if (await starterItem.isVisible()) {
      await starterItem.click();
    }

    const mainItem = page.locator('[data-testid="dish-card-main-1"]');
    if (await mainItem.isVisible()) {
      await mainItem.click();
    }

    // Advance to Step 3
    await page.locator('[data-testid="next-step-btn"]').first().click();

    // 4. Step 3: Drinks & Artisanal Stations
    // Advance to Step 4
    await page.locator('[data-testid="next-step-btn"]').first().click();

    // 5. Step 4: Guest Volume & Spending Tier Unlocks
    await expect(page.locator('[data-testid="tier-progress-banner"]')).toBeVisible();

    // Increment guests to trigger tier progress
    const increment50Btn = page.locator('[data-testid="btn-increment-guests-50"]');
    if (await increment50Btn.isVisible()) {
      await increment50Btn.click();
      await increment50Btn.click();
    }

    // Verify updated guest count and tier badge
    const guestDisplay = page.locator('[data-testid="guest-count-display"]');
    await expect(guestDisplay).toBeVisible();
    const guestCountText = await guestDisplay.textContent();
    expect(Number(guestCountText?.trim())).toBeGreaterThan(100);

    const tierBadge = page.locator('[data-testid="tier-badge"]');
    await expect(tierBadge).toBeVisible();

    // Advance to Step 5
    await page.locator('[data-testid="next-step-btn"]').first().click();

    // 6. Step 5: Slot Reservation & Paymob Payment Gateway
    // Verify 15-min countdown timer is mounted
    await expect(page.locator('text=15:00').or(page.locator('text=14:59')).or(page.locator('text=14:58'))).toBeVisible();

    // Open Paymob 3D-Secure modal
    const paymobOpenBtn = page.locator('[data-testid="paymob-open-modal-btn"]');
    await expect(paymobOpenBtn).toBeVisible();
    await paymobOpenBtn.click();

    // Verify modal elements
    await expect(page.locator('text=Paymob 3D-Secure Portal')).toBeVisible();
    await expect(page.locator('[data-testid="paymob-card-number-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="paymob-expiry-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="paymob-cvv-input"]')).toBeVisible();

    // Submit payment
    const submitPaymentBtn = page.locator('[data-testid="paymob-submit-payment-btn"]');
    await expect(submitPaymentBtn).toBeVisible();
    await submitPaymentBtn.click();

    // 7. Confirmation & Invoice Receipt
    // Wait for payment processing animation and transition
    const confirmationView = page.locator('[data-testid="confirmation-receipt-view"]');
    await expect(confirmationView).toBeVisible({ timeout: 10000 });

    // Verify Invoice Preview Card
    const invoiceCard = page.locator('[data-testid="invoice-preview-card"]');
    await expect(invoiceCard).toBeVisible();

    // Verify booking reference display
    const bookingRef = page.locator('[data-testid="booking-reference-display"]');
    await expect(bookingRef).toBeVisible();
    const refText = await bookingRef.textContent();
    expect(refText).toMatch(/FC-2026/);

    // Verify PDF download button
    const pdfBtn = page.locator('[data-testid="pdf-download-btn"]');
    await expect(pdfBtn).toBeVisible();

    // Verify WhatsApp trigger button
    const whatsappBtn = page.locator('[data-testid="whatsapp-confirm-btn"]');
    await expect(whatsappBtn).toBeVisible();

    // Check URL contains /success/
    expect(page.url()).toContain('/success/');
  });

  test('Direct deep link to /success/:id renders confirmed banquet invoice preview', async ({ page }) => {
    await page.goto('/success/FC-2026-9954');
    await page.waitForLoadState('networkidle');

    // Verify confirmation view rendered
    await expect(page.locator('[data-testid="confirmation-receipt-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="invoice-preview-card"]')).toBeVisible();
    await expect(page.locator('text=FC-2026-9954').first()).toBeVisible();
  });
});
