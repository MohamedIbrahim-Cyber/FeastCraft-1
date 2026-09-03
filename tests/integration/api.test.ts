import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createApp, resetStores, ordersStore, menuItemsStore } from '../../server';
import { signSessionJwt } from '../../src/lib/auth';
import type { Server } from 'http';

describe('Integration & API Route Tests', () => {
  let app: ReturnType<typeof createApp>;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    resetStores();
    app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  describe('1. Order Placement & Price Integrity (POST /api/orders)', () => {
    it('allows guest to place an order, creates order with RECEIVED status and #FC- identifier', async () => {
      const orderPayload = {
        fulfillmentType: 'DELIVERY',
        deliveryZoneId: 'zone-new-cairo',
        customerName: 'Youssef El-Sayed',
        customerPhone: '+20 100 123 4567',
        customerEmail: 'youssef@example.com',
        deliveryAddress: 'Building 14, Street 90, New Cairo',
        paymentMethod: 'CASH_ON_DELIVERY',
        items: [
          {
            menuItemId: 'pizza-pepperoni-honey',
            name: 'Spicy Pepperoni & Hot Honey Pizza',
            basePrice: 195,
            quantity: 1,
            selectedOptions: [],
          },
        ],
      };

      const res = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.order).toBeDefined();
      expect(data.order.orderNumber).toMatch(/^#FC-\d{4}$/);
      expect(data.order.status).toBe('RECEIVED');
      expect(data.order.customerName).toBe('Youssef El-Sayed');
      expect(data.order.subtotal).toBe(195);
      expect(data.order.deliveryFee).toBe(35); // New Cairo zone fee
    });

    it('recalculates prices server-side and rejects/overwrites client-manipulated price tampering', async () => {
      // Attacker attempts to send Pepperoni pizza (195 EGP) with fake unitPrice of 5 EGP and manipulated delta
      const tamperedPayload = {
        fulfillmentType: 'DELIVERY',
        deliveryZoneId: 'zone-zamalek',
        customerName: 'Tamper Tester',
        customerPhone: '+20 100 999 8888',
        deliveryAddress: 'Zamalek, Cairo',
        paymentMethod: 'CASH_ON_DELIVERY',
        items: [
          {
            menuItemId: 'pizza-pepperoni-honey', // Base price in DB is 195 EGP
            name: 'Spicy Pepperoni & Hot Honey Pizza',
            basePrice: 5, // FAKE tampered price!
            unitPrice: 5, // FAKE tampered price!
            totalPrice: 5, // FAKE tampered price!
            quantity: 1,
            selectedOptions: [
              {
                optionId: 'size-l', // DB option delta is +55 EGP
                optionName: 'Large 13" (8 Slices) (+55 EGP)',
                priceDelta: 1, // FAKE tampered delta!
              },
            ],
          },
        ],
      };

      const res = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tamperedPayload),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Server must have authoritative price: 195 (base) + 55 (Large option) = 250 EGP subtotal
      expect(data.order.subtotal).toBe(250);
      // Delivery fee for Zamalek = 25 EGP
      expect(data.order.deliveryFee).toBe(25);
      // Tax = 250 * 0.14 = 35.00 EGP
      expect(data.order.taxAmount).toBe(35);
      // Total = 250 + 25 + 35 = 310.00 EGP
      expect(data.order.totalAmount).toBe(310);
    });
  });

  describe('2. Order Status Mutations & RBAC (PATCH /api/orders/[id]/status)', () => {
    it('blocks unauthenticated requests with 401 Unauthorized', async () => {
      const targetOrder = ordersStore[0];
      const res = await fetch(`${baseUrl}/api/orders/${targetOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'KITCHEN_PREPARING' }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('strictly forbids customer role from mutating order status with 403 Forbidden', async () => {
      const targetOrder = ordersStore[0];
      const customerToken = signSessionJwt({
        id: 'usr-customer-1',
        sub: 'usr-customer-1',
        name: 'Karim Customer',
        email: 'karim@cyberdev.me',
        role: 'CUSTOMER',
      });

      const res = await fetch(`${baseUrl}/api/orders/${targetOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ status: 'KITCHEN_PREPARING' }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Forbidden');
    });

    it('allows active ADMIN or STAFF session to advance order status to KITCHEN_PREPARING', async () => {
      const targetOrder = ordersStore[0];
      const adminToken = signSessionJwt({
        id: 'usr-admin-1',
        sub: 'usr-admin-1',
        name: 'Chef Omar',
        email: 'admin@cyberdev.me',
        role: 'ADMIN',
      });

      const res = await fetch(`${baseUrl}/api/orders/${targetOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'KITCHEN_PREPARING' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.order.status).toBe('KITCHEN_PREPARING');
      expect(data.order.acceptedAt).toBeDefined();
    });
  });

  describe('3. Menu Management Endpoints (Admin 86 / Availability & Price)', () => {
    it('toggles item availability (86 Sold-out toggle) instantly for staff', async () => {
      const targetItem = menuItemsStore[0];
      const initialAvailability = targetItem.isAvailable;

      const adminToken = signSessionJwt({
        id: 'usr-admin-1',
        name: 'Chef Omar',
        email: 'admin@cyberdev.me',
        role: 'ADMIN',
      });

      const res = await fetch(`${baseUrl}/api/admin/menu/${targetItem.id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.item.isAvailable).toBe(!initialAvailability);

      // Verify item record in store was updated
      const updatedInStore = menuItemsStore.find((m) => m.id === targetItem.id);
      expect(updatedInStore?.isAvailable).toBe(!initialAvailability);
    });

    it('updates item base price when requested by staff', async () => {
      const targetItem = menuItemsStore[0];
      const newPrice = 245;

      const adminToken = signSessionJwt({
        id: 'usr-admin-1',
        name: 'Chef Omar',
        email: 'admin@cyberdev.me',
        role: 'ADMIN',
      });

      const res = await fetch(`${baseUrl}/api/admin/menu/${targetItem.id}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ price: newPrice }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.item.basePrice).toBe(newPrice);
    });
  });
});
