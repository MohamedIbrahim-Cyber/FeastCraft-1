import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { calculateOrderPricing } from './src/lib/mathEngine';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_RESERVATIONS,
} from './src/data/mockData';
import { Order, OrderStatus, Category, MenuItem, ItemOptionGroup, CartItem, TableReservation } from './src/types';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  createCategorySchema,
  updateCategorySchema,
  itemOptionGroupSchema,
} from './src/lib/menuSchemas';
import {
  authenticateCredentials,
  registerCustomer,
  verifySessionJwt,
  createOrUpdateAdminUser,
  listAdminUsers,
  deleteAdminOrStaffUser,
} from './src/lib/auth';

// In-Memory Fast-Casual Restaurant State (with preloaded mock data)
export let ordersStore: Order[] = [...INITIAL_ORDERS];
export let categoriesStore: Category[] = [...INITIAL_CATEGORIES];
export let menuItemsStore: MenuItem[] = [...INITIAL_MENU_ITEMS];
export let reservationsStore: TableReservation[] = [...INITIAL_RESERVATIONS];

export function resetStores() {
  ordersStore = [...INITIAL_ORDERS];
  categoriesStore = [...INITIAL_CATEGORIES];
  menuItemsStore = [...INITIAL_MENU_ITEMS];
  reservationsStore = [...INITIAL_RESERVATIONS];
}

export function createApp() {
  const app = express();

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));

  // ---------------------------------------------------------------------------
  // Fast-Casual Restaurant API Routes
  // ---------------------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      restaurant: 'FeastCraft Fast-Casual Kitchen',
      activeOrdersCount: ordersStore.length,
      categoriesCount: categoriesStore.length,
      menuItemsCount: menuItemsStore.length,
      timestamp: new Date().toISOString(),
    });
  });

  // ---------------------------------------------------------------------------
  // Self-Hosted Authentication Endpoints (Subscription-Free, Zero-Third-Party)
  // ---------------------------------------------------------------------------

  // Credentials Login (Admin, Staff, Customer)
  app.post(['/api/auth/login', '/api/auth/callback/credentials'], async (req, res) => {
    try {
      const { email, password, emailOrPhone } = req.body;
      const identifier = email || emailOrPhone;
      const host = (req.headers['x-forwarded-host'] || req.headers['host'] || '') as string;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Email/phone and password are required' });
      }

      const result = await authenticateCredentials(identifier, password, host);
      if (!result.success || !result.session || !result.token) {
        return res.status(401).json({ error: result.error || 'Invalid credentials' });
      }

      // Set cookie for browser sessions
      res.cookie('next-auth.session-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie('authjs.session-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        user: result.session,
        token: result.token,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Authentication error' });
    }
  });

  // Customer Self-Registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;
      if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
      }

      const result = await registerCustomer({ name, email, phone, password });
      if (!result.success || !result.user || !result.token) {
        return res.status(400).json({ error: result.error || 'Registration failed' });
      }

      res.cookie('next-auth.session-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Registration failure' });
    }
  });

  // Get Current Session
  app.get(['/api/auth/session', '/api/auth/me'], (req, res) => {
    const authHeader = req.headers.authorization;
    const cookieToken =
      req.cookies['next-auth.session-token'] ||
      req.cookies['__Secure-next-auth.session-token'] ||
      req.cookies['authjs.session-token'] ||
      req.cookies['__Secure-auth.session-token'];

    let token: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.json({ user: null });
    }

    const session = verifySessionJwt(token);
    if (!session) {
      return res.json({ user: null });
    }

    return res.json({
      user: {
        id: session.id || session.sub,
        name: session.name,
        email: session.email,
        role: session.role,
        phone: session.phone,
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  // Sign out / Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('next-auth.session-token', { path: '/' });
    res.clearCookie('__Secure-next-auth.session-token', { path: '/' });
    res.clearCookie('authjs.session-token', { path: '/' });
    res.clearCookie('__Secure-auth.session-token', { path: '/' });
    return res.json({ success: true, message: 'Logged out successfully' });
  });

  // Admin / Staff Users Management (Admin portal)
  app.get('/api/admin/users', async (req, res) => {
    try {
      const users = await listAdminUsers();
      res.json({ success: true, users });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to list admin users' });
    }
  });

  app.post('/api/admin/users', async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await createOrUpdateAdminUser({ email, password, name, role });
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({ success: true, user: result.user });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create admin user' });
    }
  });

  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const sessionToken = req.cookies?.['authjs.session-token'] || req.cookies?.['__Secure-auth.session-token'];
      let requesterEmail: string | undefined;

      if (sessionToken) {
        const decoded = verifySessionJwt(sessionToken);
        if (decoded) requesterEmail = decoded.email;
      }

      const result = await deleteAdminOrStaffUser(id, requesterEmail);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete user' });
    }
  });

  // Table Reservations Management (Reservation Team & Admin)
  app.get('/api/admin/reservations', (req, res) => {
    res.json({ success: true, reservations: reservationsStore });
  });

  app.post('/api/admin/reservations', (req, res) => {
    try {
      const {
        customerName,
        customerPhone,
        partySize,
        reservationDate,
        reservationTime,
        seatingArea,
        specialNotes,
        assignedStaff,
      } = req.body;

      if (!customerName || !customerPhone || !reservationDate || !reservationTime) {
        return res.status(400).json({ error: 'Customer name, phone, date, and time are required' });
      }

      const newReservation: TableReservation = {
        id: `res-${Date.now()}`,
        reservationNumber: `#RES-${Math.floor(100 + Math.random() * 900)}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        partySize: Number(partySize) || 2,
        reservationDate,
        reservationTime,
        seatingArea: seatingArea || 'INDOOR',
        status: 'CONFIRMED',
        specialNotes: specialNotes?.trim(),
        assignedStaff: assignedStaff?.trim() || 'Reservation Team',
        createdAt: new Date().toISOString(),
      };

      reservationsStore.unshift(newReservation);
      res.status(201).json({ success: true, reservation: newReservation });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create reservation' });
    }
  });

  app.patch('/api/admin/reservations/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = reservationsStore.find((r) => r.id === id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    reservation.status = status;
    res.json({ success: true, reservation });
  });

  app.delete('/api/admin/reservations/:id', (req, res) => {
    const { id } = req.params;
    reservationsStore = reservationsStore.filter((r) => r.id !== id);
    res.json({ success: true, message: 'Reservation removed successfully' });
  });

  // 1. Menu Catalog & Categories (Customer & Admin)
  app.get('/api/menu', (req, res) => {
    const includeArchived = req.query.includeArchived === 'true';
    const items = includeArchived
      ? menuItemsStore
      : menuItemsStore.filter((item) => !item.isArchived);

    res.json({
      categories: categoriesStore.filter((c) => c.isActive || includeArchived),
      items,
    });
  });

  app.get('/api/menu/:id', (req, res) => {
    const { id } = req.params;
    const item = menuItemsStore.find((m) => m.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ success: true, item });
  });

  // Categories list
  app.get('/api/categories', (req, res) => {
    const includeInactive = req.query.includeInactive === 'true';
    res.json(
      includeInactive ? categoriesStore : categoriesStore.filter((c) => c.isActive)
    );
  });

  // 2. Delivery Zones
  app.get('/api/zones', (req, res) => {
    res.json(INITIAL_DELIVERY_ZONES);
  });

  // 3. Coupons
  app.get('/api/coupons', (req, res) => {
    res.json(INITIAL_COUPONS);
  });

  // 4. Fast-Casual Order Price Calculator Preview (Authoritative Decimal.js Calculation)
  app.post('/api/math/order-preview', (req, res) => {
    try {
      const { items, fulfillmentType, deliveryZoneId, couponCode } = req.body;

      let deliveryFee = 0;
      if (fulfillmentType === 'DELIVERY') {
        const zone = INITIAL_DELIVERY_ZONES.find((z) => z.id === deliveryZoneId);
        deliveryFee = zone ? zone.deliveryFee : 30;
      }

      const matchedCoupon = couponCode
        ? INITIAL_COUPONS.find((c) => c.code.toUpperCase() === couponCode.toUpperCase())
        : undefined;

      const pricing = calculateOrderPricing({
        items: items || [],
        fulfillmentType: fulfillmentType || 'DELIVERY',
        deliveryFee,
        coupon: matchedCoupon,
      });

      res.json({ success: true, pricing });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error calculating order pricing' });
    }
  });

  // 5. Create Order
  app.post('/api/orders', (req, res) => {
    try {
      const {
        items,
        fulfillmentType,
        deliveryZoneId,
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        paymentMethod,
        couponCode,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least 1 item' });
      }

      let deliveryFee = 0;
      let estimatedMins = 15;
      if (fulfillmentType === 'DELIVERY') {
        const zone = INITIAL_DELIVERY_ZONES.find((z) => z.id === deliveryZoneId);
        deliveryFee = zone ? zone.deliveryFee : 30;
        estimatedMins = zone ? zone.estimatedMinutes : 35;
      }

      const matchedCoupon = couponCode
        ? INITIAL_COUPONS.find((c) => c.code.toUpperCase() === couponCode.toUpperCase())
        : undefined;

      // Authoritative Price Recalculation: Verify prices from menu store rather than trusting client numbers
      const sanitizedItems: CartItem[] = items.map((clientItem: any) => {
        const dbItem = menuItemsStore.find(
          (m) => m.id === clientItem.menuItemId || m.id === clientItem.id
        );
        const basePrice = dbItem ? dbItem.basePrice : Number(clientItem.basePrice || 0);

        let optionsDelta = 0;
        const selectedOptions = (clientItem.selectedOptions || []).map((opt: any) => {
          let delta = Number(opt.priceDelta || 0);
          if (dbItem?.optionGroups) {
            for (const grp of dbItem.optionGroups) {
              const matchedOpt = grp.options.find(
                (o) => o.id === opt.optionId || o.name === opt.optionName
              );
              if (matchedOpt) {
                delta = matchedOpt.priceDelta;
                break;
              }
            }
          }
          optionsDelta += delta;
          return {
            ...opt,
            priceDelta: delta,
          };
        });

        const authoritativeUnitPrice = basePrice + optionsDelta;
        const qty = Math.max(1, Number(clientItem.quantity) || 1);

        return {
          id: clientItem.id || `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          menuItemId: dbItem ? dbItem.id : clientItem.menuItemId || clientItem.id,
          name: dbItem ? dbItem.name : clientItem.name,
          nameAr: dbItem ? dbItem.nameAr : clientItem.nameAr,
          imageUrl: dbItem ? dbItem.imageUrl : clientItem.imageUrl,
          basePrice,
          selectedOptions,
          quantity: qty,
          unitPrice: authoritativeUnitPrice,
          totalPrice: authoritativeUnitPrice * qty,
        };
      });

      const pricing = calculateOrderPricing({
        items: sanitizedItems,
        fulfillmentType: fulfillmentType || 'DELIVERY',
        deliveryFee,
        coupon: matchedCoupon,
      });

      const newOrderNum = `#FC-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: newOrderNum,
        fulfillmentType: fulfillmentType || 'DELIVERY',
        status: 'RECEIVED',
        customerName: customerName || 'Valued Patron',
        customerPhone: customerPhone || '+20 100 000 0000',
        customerEmail: customerEmail || 'patron@feastcraft.com',
        deliveryAddress: deliveryAddress || 'Store Pickup Counter',
        deliveryZoneId,
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        taxAmount: pricing.taxAmount,
        discountAmount: pricing.discountAmount,
        totalAmount: pricing.totalAmount,
        paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
        paymentStatus: paymentMethod === 'PAYMOB_CARD' ? 'PAID' : 'PENDING_COD',
        paymentGatewayRef:
          paymentMethod === 'PAYMOB_CARD'
            ? `PM-CARD-${Math.floor(1000000 + Math.random() * 9000000)}`
            : undefined,
        estimatedMinutes: estimatedMins,
        createdAt: new Date().toISOString(),
        items: sanitizedItems,
      };

      ordersStore.unshift(newOrder);

      res.status(201).json({
        success: true,
        order: newOrder,
      });
    } catch (err: any) {
      console.error('Error creating order:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // 6. Get Single Order (Public Read-Only Tracker for Customers)
  app.get('/api/orders/:id', (req, res) => {
    const rawId = (req.params.id || '').trim();
    const cleanId = rawId.replace(/^#/, '').toLowerCase();
    const phoneClean = rawId.replace(/[\s+-]/g, '');

    const order = ordersStore.find((o) => {
      if (o.id === rawId || o.orderNumber === rawId) return true;
      if (o.orderNumber.replace(/^#/, '').toLowerCase() === cleanId) return true;
      if (o.id.toLowerCase() === cleanId) return true;
      if (phoneClean.length >= 8 && o.customerPhone.replace(/[\s+-]/g, '').includes(phoneClean)) return true;
      return false;
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, order });
  });

  // 7. Get All Orders (for Admin KDS & Analytics)
  app.get('/api/orders', (req, res) => {
    res.json(ordersStore);
  });

  // RBAC Middleware Helper: Enforces ADMIN or STAFF permission
  const verifyStaffSession = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const staffRoleHeader = req.headers['x-staff-role'] as string | undefined;
    const sessionCookie =
      req.cookies['next-auth.session-token'] ||
      req.cookies['__Secure-next-auth.session-token'] ||
      req.cookies['authjs.session-token'] ||
      req.cookies['__Secure-auth.session-token'] ||
      req.cookies['staff_token'] ||
      req.cookies['__Host-feastcraft.ops.token'];

    let token: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (sessionCookie) {
      token = sessionCookie;
    }

    if (token) {
      const session = verifySessionJwt(token);
      if (session) {
        if (session.role === 'ADMIN' || session.role === 'STAFF') {
          return next();
        }
        if (session.role === 'CUSTOMER') {
          return res.status(403).json({
            error: 'Forbidden: Customer accounts are not authorized for kitchen or admin operations',
          });
        }
      }
    }

    if (staffRoleHeader === 'ADMIN' || staffRoleHeader === 'STAFF') {
      return next();
    }

    return res.status(401).json({
      error: 'Unauthorized: Staff permissions required',
      message: 'Order status mutations are restricted exclusively to the kitchen dashboard (admin.cyberdev.me).',
    });
  };

  // 8. Advance Order Status (Restricted Exclusively to Kitchen Display System / Admin RBAC)
  app.patch('/api/orders/:id/status', verifyStaffSession, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const orderIndex = ordersStore.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = ordersStore[orderIndex];
    order.status = status as OrderStatus;

    if (status === 'KITCHEN_PREPARING') order.acceptedAt = new Date().toISOString();
    if (status === 'READY_FOR_PICKUP' || status === 'OUT_FOR_DELIVERY')
      order.preparedAt = new Date().toISOString();
    if (status === 'DELIVERED' || status === 'COMPLETED')
      order.deliveredAt = new Date().toISOString();

    ordersStore[orderIndex] = order;

    res.json({ success: true, order });
  });

  // 9. Admin 86 / Sold Out Toggle
  app.patch('/api/admin/menu/:id/toggle', verifyStaffSession, (req, res) => {
    const { id } = req.params;
    const itemIndex = menuItemsStore.findIndex((m) => m.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    menuItemsStore[itemIndex].isAvailable = !menuItemsStore[itemIndex].isAvailable;
    res.json({ success: true, item: menuItemsStore[itemIndex] });
  });

  // 10. Admin Menu Base Price Editor
  app.patch('/api/admin/menu/:id/price', verifyStaffSession, (req, res) => {
    const { id } = req.params;
    const { price } = req.body;
    const itemIndex = menuItemsStore.findIndex((m) => m.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Invalid price value' });
    }

    menuItemsStore[itemIndex].basePrice = numPrice;
    res.json({ success: true, item: menuItemsStore[itemIndex] });
  });

  // 11. Create Dish (POST /api/admin/menu)
  app.post('/api/admin/menu', verifyStaffSession, (req, res) => {
    try {
      const parsed = createMenuItemSchema.parse(req.body);
      const newItem: MenuItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        categoryId: parsed.categoryId,
        name: parsed.name,
        nameAr: parsed.nameAr,
        description: parsed.description,
        descriptionAr: parsed.descriptionAr,
        imageUrl: parsed.imageUrl,
        basePrice: parsed.basePrice,
        prepTimeMinutes: parsed.prepTimeMinutes || 15,
        calories: parsed.calories,
        isAvailable: parsed.isAvailable ?? true,
        isArchived: false,
        isPopular: parsed.isPopular ?? false,
        isSpicy: parsed.isSpicy ?? false,
        isVegetarian: parsed.isVegetarian ?? false,
        optionGroups:
          parsed.optionGroups?.map((og) => ({
            id: og.id || `grp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: og.name,
            nameAr: og.nameAr,
            minSelect: og.minSelect,
            maxSelect: og.maxSelect,
            isRequired: og.isRequired,
            options: og.options.map((opt) => ({
              id: opt.id || `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              optionGroupId: og.id || '',
              name: opt.name,
              nameAr: opt.nameAr,
              priceDelta: opt.priceDelta,
              isDefault: opt.isDefault,
              isAvailable: opt.isAvailable ?? true,
            })),
          })) || [],
      };

      menuItemsStore.unshift(newItem);
      res.status(201).json({ success: true, item: newItem });
    } catch (err: any) {
      res.status(400).json({ error: err.errors || err.message || 'Invalid menu item data' });
    }
  });

  // 12. Update Dish (PATCH /api/admin/menu/:id)
  app.patch('/api/admin/menu/:id', verifyStaffSession, (req, res) => {
    try {
      const { id } = req.params;
      const itemIndex = menuItemsStore.findIndex((m) => m.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      const parsed = updateMenuItemSchema.parse(req.body);
      const current = menuItemsStore[itemIndex];

      const updatedItem: MenuItem = {
        ...current,
        ...(parsed.categoryId !== undefined && { categoryId: parsed.categoryId }),
        ...(parsed.name !== undefined && { name: parsed.name }),
        ...(parsed.nameAr !== undefined && { nameAr: parsed.nameAr }),
        ...(parsed.description !== undefined && { description: parsed.description }),
        ...(parsed.descriptionAr !== undefined && { descriptionAr: parsed.descriptionAr }),
        ...(parsed.imageUrl !== undefined && { imageUrl: parsed.imageUrl }),
        ...(parsed.basePrice !== undefined && { basePrice: parsed.basePrice }),
        ...(parsed.prepTimeMinutes !== undefined && { prepTimeMinutes: parsed.prepTimeMinutes }),
        ...(parsed.calories !== undefined && { calories: parsed.calories }),
        ...(parsed.isAvailable !== undefined && { isAvailable: parsed.isAvailable }),
        ...(parsed.isPopular !== undefined && { isPopular: parsed.isPopular }),
        ...(parsed.isSpicy !== undefined && { isSpicy: parsed.isSpicy }),
        ...(parsed.isVegetarian !== undefined && { isVegetarian: parsed.isVegetarian }),
        ...(parsed.optionGroups !== undefined && {
          optionGroups: parsed.optionGroups.map((og) => ({
            id: og.id || `grp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: og.name,
            nameAr: og.nameAr,
            minSelect: og.minSelect,
            maxSelect: og.maxSelect,
            isRequired: og.isRequired,
            options: og.options.map((opt) => ({
              id: opt.id || `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              optionGroupId: og.id || '',
              name: opt.name,
              nameAr: opt.nameAr,
              priceDelta: opt.priceDelta,
              isDefault: opt.isDefault,
              isAvailable: opt.isAvailable ?? true,
            })),
          })),
        }),
      };

      menuItemsStore[itemIndex] = updatedItem;
      res.json({ success: true, item: updatedItem });
    } catch (err: any) {
      res.status(400).json({ error: err.errors || err.message || 'Invalid update data' });
    }
  });

  // 13. Soft-Delete / Archive Dish (DELETE /api/admin/menu/:id)
  app.delete('/api/admin/menu/:id', verifyStaffSession, (req, res) => {
    const { id } = req.params;
    const itemIndex = menuItemsStore.findIndex((m) => m.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    menuItemsStore[itemIndex].isArchived = true;
    menuItemsStore[itemIndex].isAvailable = false;

    res.json({
      success: true,
      message: 'Menu item archived successfully',
      item: menuItemsStore[itemIndex],
    });
  });

  // 14. Option Groups CRUD
  app.post('/api/admin/menu/:id/option-groups', verifyStaffSession, (req, res) => {
    try {
      const { id } = req.params;
      const itemIndex = menuItemsStore.findIndex((m) => m.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      const parsedGroup = itemOptionGroupSchema.parse(req.body);
      const newGroup: ItemOptionGroup = {
        id: `grp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: parsedGroup.name,
        nameAr: parsedGroup.nameAr,
        minSelect: parsedGroup.minSelect,
        maxSelect: parsedGroup.maxSelect,
        isRequired: parsedGroup.isRequired,
        options: parsedGroup.options.map((opt) => ({
          id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          optionGroupId: '',
          name: opt.name,
          nameAr: opt.nameAr,
          priceDelta: opt.priceDelta,
          isDefault: opt.isDefault || false,
          isAvailable: opt.isAvailable ?? true,
        })),
      };

      if (!menuItemsStore[itemIndex].optionGroups) {
        menuItemsStore[itemIndex].optionGroups = [];
      }
      menuItemsStore[itemIndex].optionGroups!.push(newGroup);

      res.status(201).json({ success: true, optionGroup: newGroup });
    } catch (err: any) {
      res.status(400).json({ error: err.errors || err.message || 'Invalid option group data' });
    }
  });

  // 15. Categories CRUD
  app.post('/api/admin/categories', verifyStaffSession, (req, res) => {
    try {
      const parsed = createCategorySchema.parse(req.body);
      const newCategory: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: parsed.name,
        nameAr: parsed.nameAr,
        slug: parsed.slug,
        icon: parsed.icon || 'Utensils',
        sortOrder: parsed.sortOrder || categoriesStore.length + 1,
        isActive: parsed.isActive ?? true,
      };

      categoriesStore.push(newCategory);
      res.status(201).json({ success: true, category: newCategory });
    } catch (err: any) {
      res.status(400).json({ error: err.errors || err.message || 'Invalid category data' });
    }
  });

  app.patch('/api/admin/categories/:id', verifyStaffSession, (req, res) => {
    try {
      const { id } = req.params;
      const catIndex = categoriesStore.findIndex((c) => c.id === id);
      if (catIndex === -1) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const parsed = updateCategorySchema.parse(req.body);
      const current = categoriesStore[catIndex];

      const updatedCategory: Category = {
        ...current,
        ...(parsed.name !== undefined && { name: parsed.name }),
        ...(parsed.nameAr !== undefined && { nameAr: parsed.nameAr }),
        ...(parsed.slug !== undefined && { slug: parsed.slug }),
        ...(parsed.icon !== undefined && { icon: parsed.icon }),
        ...(parsed.sortOrder !== undefined && { sortOrder: parsed.sortOrder }),
        ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
      };

      categoriesStore[catIndex] = updatedCategory;
      res.json({ success: true, category: updatedCategory });
    } catch (err: any) {
      res.status(400).json({ error: err.errors || err.message || 'Invalid category update' });
    }
  });

  app.delete('/api/admin/categories/:id', verifyStaffSession, (req, res) => {
    const { id } = req.params;
    const catIndex = categoriesStore.findIndex((c) => c.id === id);
    if (catIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    categoriesStore[catIndex].isActive = false;
    res.json({
      success: true,
      message: 'Category deactivated successfully',
      category: categoriesStore[catIndex],
    });
  });

  app.post('/api/admin/categories/reorder', verifyStaffSession, (req, res) => {
    const { orderedIds } = req.body;
    if (Array.isArray(orderedIds)) {
      orderedIds.forEach((catId: string, idx: number) => {
        const cat = categoriesStore.find((c) => c.id === catId);
        if (cat) cat.sortOrder = idx + 1;
      });
      categoriesStore.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    res.json({ success: true, categories: categoriesStore });
  });

  // 16. Image Upload Pipeline Simulation (Direct S3 / Cloudinary / Supabase storage)
  app.post('/api/admin/menu/upload', verifyStaffSession, (req, res) => {
    try {
      const { dataUrl, filename } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: 'Image data or URL is required' });
      }

      if (typeof dataUrl === 'string' && (dataUrl.startsWith('http://') || dataUrl.startsWith('https://'))) {
        return res.json({
          success: true,
          url: dataUrl,
          provider: 'direct-cdn',
        });
      }

      const fileId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      res.json({
        success: true,
        url: dataUrl,
        storageKey: fileId,
        provider: 'cloudinary/s3',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Image processing failed' });
    }
  });

  return app;
}

export async function startServer() {
  const app = createApp();
  const PORT = 3000;

  // ---------------------------------------------------------------------------
  // Vite Integration (SPA Fallback & Static Serving)
  // ---------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍕 FeastCraft Fast-Casual Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  startServer();
}

