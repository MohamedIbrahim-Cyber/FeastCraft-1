import React, { useState, useEffect } from 'react';
import {
  ThemeMode,
  Locale,
  Direction,
  ScreenId,
  MenuItem,
  Category,
  DeliveryZone,
  CartItem,
  FulfillmentType,
  DeliveryAddressDetails,
  CustomerInfo,
  PaymentMethod,
  Order,
  OrderStatus,
  CouponDiscount,
} from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { MenuOrderingScreen } from './components/consumer/MenuOrderingScreen';
import { FoodCustomizationModal } from './components/consumer/FoodCustomizationModal';
import { CartSlideDrawer } from './components/consumer/CartSlideDrawer';
import { AddressZoneModal } from './components/consumer/AddressZoneModal';
import { CheckoutScreen } from './components/consumer/CheckoutScreen';
import { OrderTrackerScreen } from './components/consumer/OrderTrackerScreen';
import { AdminKDSView } from './components/admin/AdminKDSView';
import { AdminMenuCMS } from './components/admin/AdminMenuCMS';
import { AdminAnalyticsView } from './components/admin/AdminAnalyticsView';
import { AdminUsersView } from './components/admin/AdminUsersView';
import { AdminReservationsView } from './components/admin/AdminReservationsView';
import { AdminDeliveryView } from './components/admin/AdminDeliveryView';
import { AdminCashierPOSView } from './components/admin/AdminCashierPOSView';
import AdminLoginPage from './components/admin/AdminLoginPage';
import AuthModal from './components/consumer/AuthModal';
import { ScreenDesignSystem } from './components/screens/ScreenDesignSystem';
import { OrderStatusModal } from './components/consumer/OrderStatusModal';
import {
  updateNativeStatusBar,
  hideNativeSplashScreen,
  registerHardwareBackButton,
  setupPushNotifications,
} from './lib/nativeBridge';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [locale, setLocale] = useState<Locale>('en');
  const [currentScreen, setCurrentScreen] = useState<ScreenId | 'admin-login'>('menu-ordering');

  // Application Data States
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(INITIAL_DELIVERY_ZONES);
  const [coupons, setCoupons] = useState<CouponDiscount[]>(INITIAL_COUPONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Self-Hosted User Auth State
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string | null;
    email: string | null;
    role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
    phone?: string | null;
  } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Fulfillment & Customer States
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('DELIVERY');
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(INITIAL_DELIVERY_ZONES[0]);
  const [addressDetails, setAddressDetails] = useState<DeliveryAddressDetails>({
    street: '',
    building: '',
    floor: '',
    apartment: '',
    nearestLandmark: '',
    deliveryNotes: '',
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
  });

  // Cart & Modals State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [appliedCoupon, setAppliedCoupon] = useState<CouponDiscount | null>(null);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);

  // Active Live Order (for tracking screen)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // In-flight active order indicator (cooking, received, or on the road)
  const inFlightOrder = orders.find(
    (o) =>
      o.status === 'RECEIVED' ||
      o.status === 'KITCHEN_PREPARING' ||
      o.status === 'OUT_FOR_DELIVERY' ||
      o.status === 'READY_FOR_PICKUP'
  );

  const isDark = theme === 'dark';
  const isArabic = locale === 'ar';
  const direction: Direction = isArabic ? 'rtl' : 'ltr';

  // Native Mobile Bridge: Status Bar, Splash Screen & Push Notifications
  useEffect(() => {
    // 1. Sync Native Status Bar with current theme mode
    updateNativeStatusBar(isDark);
  }, [isDark]);

  useEffect(() => {
    // 2. Dismiss Splash Screen once the app finishes mounting
    hideNativeSplashScreen();

    // 3. Register device token for Push Notifications
    setupPushNotifications(
      (token) => {
        console.log('[FeastCraft Native] Push Token Registered:', token);
      },
      (notification) => {
        console.log('[FeastCraft Native] Push Notification Received:', notification);
      }
    );
  }, []);

  // 4. Android Hardware Back Button:
  // Dismiss open modal sheets (Food Customizer, Cart Drawer, Zone Modal, Auth Modal)
  // before navigating backward or exiting the app.
  useEffect(() => {
    const unregister = registerHardwareBackButton(() => {
      if (customizingItem) {
        setCustomizingItem(null);
        return true;
      }
      if (isCartDrawerOpen) {
        setIsCartDrawerOpen(false);
        return true;
      }
      if (isZoneModalOpen) {
        setIsZoneModalOpen(false);
        return true;
      }
      if (isOrderStatusModalOpen) {
        setIsOrderStatusModalOpen(false);
        return true;
      }
      if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
        return true;
      }
      if (currentScreen === 'checkout' || currentScreen === 'order-tracker') {
        window.history.pushState({}, '', '/');
        setCurrentScreen('menu-ordering');
        return true;
      }
      return false;
    });

    return () => unregister();
  }, [
    customizingItem,
    isCartDrawerOpen,
    isZoneModalOpen,
    isOrderStatusModalOpen,
    isAuthModalOpen,
    currentScreen,
  ]);

  // Handle URL Routing
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      if (path.startsWith('/tracker') || path.startsWith('/track')) {
        setCurrentScreen('order-tracker');
      } else if (path.startsWith('/checkout')) {
        setCurrentScreen('checkout');
      } else if (path.startsWith('/admin/login') || path === '/admin' || path === '/admin/') {
        setCurrentScreen('admin-login');
      } else if (path.startsWith('/kds') || path.startsWith('/admin/kds')) {
        setCurrentScreen('admin-kds');
      } else if (path.startsWith('/admin/menu')) {
        setCurrentScreen('admin-menu-cms');
      } else if (path.startsWith('/admin/stats') || path.startsWith('/admin/analytics')) {
        setCurrentScreen('admin-analytics');
      } else if (path.startsWith('/admin/users') || path.startsWith('/admin/staff')) {
        setCurrentScreen('admin-users');
      } else if (path.startsWith('/menu') || path === '/') {
        setCurrentScreen('menu-ordering');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      // Check if identical item + selected options exists
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.menuItemId === item.menuItemId &&
          JSON.stringify(ci.selectedOptions) === JSON.stringify(item.selectedOptions)
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const old = updated[existingIdx];
        const newQty = old.quantity + item.quantity;
        updated[existingIdx] = {
          ...old,
          quantity: newQty,
          totalPrice: old.unitPrice * newQty,
        };
        return updated;
      }
      return [...prev, item];
    });

    setIsCartDrawerOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
    } else {
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === cartItemId
            ? { ...i, quantity: newQty, totalPrice: i.unitPrice * newQty }
            : i
        )
      );
    }
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order Placement
  const handlePlaceOrder = (
    paymentMethod: PaymentMethod,
    pricingBreakdown: { subtotal: number; deliveryFee: number; taxAmount: number; discountAmount: number; totalAmount: number }
  ) => {
    const newOrderNum = `#FC-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullAddressString =
      fulfillmentType === 'DELIVERY'
        ? `${addressDetails.street}, ${addressDetails.building}, ${addressDetails.floor}, ${addressDetails.apartment} (${selectedZone?.zoneName})`
        : 'Downtown Cairo Branch (12 Kasr El Nil St, Tahrir)';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNum,
      fulfillmentType,
      status: 'RECEIVED',
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      deliveryAddress: fullAddressString,
      deliveryZoneId: selectedZone?.id,
      subtotal: pricingBreakdown.subtotal,
      deliveryFee: pricingBreakdown.deliveryFee,
      taxAmount: pricingBreakdown.taxAmount,
      discountAmount: pricingBreakdown.discountAmount,
      totalAmount: pricingBreakdown.totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'PAYMOB_CARD' ? 'PAID' : 'PENDING_COD',
      paymentGatewayRef:
        paymentMethod === 'PAYMOB_CARD' ? `PM-CARD-${Math.floor(1000000 + Math.random() * 9000000)}` : undefined,
      estimatedMinutes: fulfillmentType === 'DELIVERY' ? selectedZone?.estimatedMinutes || 35 : 15,
      createdAt: new Date().toISOString(),
      items: [...cartItems],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    setCartItems([]);
    setIsCartDrawerOpen(false);
    setCurrentScreen('order-tracker');
  };

  // Order Status Progression (Kitchen Staff / KDS Operations)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI Update
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status: newStatus };
          if (newStatus === 'KITCHEN_PREPARING') updated.acceptedAt = new Date().toISOString();
          if (newStatus === 'READY_FOR_PICKUP' || newStatus === 'OUT_FOR_DELIVERY')
            updated.preparedAt = new Date().toISOString();
          if (newStatus === 'DELIVERED' || newStatus === 'COMPLETED')
            updated.deliveredAt = new Date().toISOString();
          return updated;
        }
        return o;
      })
    );

    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'HEAD_CHEF',
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Handled silently
    }
  };

  // Initial Sync from Backend API
  useEffect(() => {
    const fetchMenuAndCategories = async () => {
      try {
        const res = await fetch('/api/menu?includeArchived=true');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
          if (data.items && Array.isArray(data.items)) {
            setMenuItems(data.items);
          }
        }
      } catch {
        // Fallback to local initialized state
      }
    };

    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            if (data.user.name) {
              setCustomerInfo((prev) => ({
                ...prev,
                name: data.user.name || prev.name,
                email: data.user.email || prev.email,
                phone: data.user.phone || prev.phone,
              }));
            }
          }
        }
      } catch {
        // Handled silently
      }
    };

    fetchMenuAndCategories();
    fetchSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    }
    setCurrentUser(null);
    if (
      currentScreen === 'admin-kds' ||
      currentScreen === 'admin-menu-cms' ||
      currentScreen === 'admin-analytics' ||
      currentScreen === 'admin-users'
    ) {
      setCurrentScreen('admin-login');
    }
  };

  // Admin CMS CRUD Handlers with API Sync & Optimistic Updates
  const handleToggleItemAvailability = async (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );

    try {
      await fetch(`/api/admin/menu/${itemId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'ADMIN',
        },
      });
    } catch {
      // Handled gracefully
    }
  };

  const handleUpdateItemPrice = async (itemId: string, newPrice: number) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, basePrice: newPrice } : item
      )
    );

    try {
      await fetch(`/api/admin/menu/${itemId}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'ADMIN',
        },
        body: JSON.stringify({ price: newPrice }),
      });
    } catch {
      // Handled gracefully
    }
  };

  const handleCreateMenuItem = async (newItem: MenuItem) => {
    setMenuItems((prev) => [newItem, ...prev]);

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'ADMIN',
        },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setMenuItems((prev) =>
            prev.map((it) => (it.id === newItem.id ? data.item : it))
          );
        }
      }
    } catch {
      // Keep optimistic
    }
  };

  const handleUpdateMenuItem = async (itemId: string, updatedFields: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...updatedFields } : item
      )
    );

    try {
      const res = await fetch(`/api/admin/menu/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'ADMIN',
        },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setMenuItems((prev) =>
            prev.map((it) => (it.id === itemId ? data.item : it))
          );
        }
      }
    } catch {
      // Keep optimistic
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    // Soft delete / archive
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isArchived: true, isAvailable: false } : item
      )
    );

    try {
      await fetch(`/api/admin/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'x-staff-role': 'ADMIN',
        },
      });
    } catch {
      // Keep optimistic
    }
  };

  const handleCreateCategory = async (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'ADMIN',
        },
        body: JSON.stringify(newCat),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.category) {
          setCategories((prev) =>
            prev.map((c) => (c.id === newCat.id ? data.category : c))
          );
        }
      }
    } catch {
      // Keep optimistic
    }
  };

  const handleUpdateCategory = async (catId: string, updatedFields: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === catId ? { ...cat, ...updatedFields } : cat))
    );

    try {
      await fetch(`/api/admin/categories/${catId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'ADMIN',
        },
        body: JSON.stringify(updatedFields),
      });
    } catch {
      // Keep optimistic
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, isActive: false } : c))
    );

    try {
      await fetch(`/api/admin/categories/${catId}`, {
        method: 'DELETE',
        headers: {
          'x-staff-role': 'ADMIN',
        },
      });
    } catch {
      // Keep optimistic
    }
  };

  // Computed Cart metrics
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Render Screen Content Helper
  const renderScreenContent = (screenOverride?: ScreenId, isArabicOverride?: boolean) => {
    const activeScreen = screenOverride || currentScreen;
    const arabicActive = isArabicOverride !== undefined ? isArabicOverride : isArabic;

    switch (activeScreen) {
      case 'menu-ordering':
        return (
          <MenuOrderingScreen
            categories={categories}
            menuItems={menuItems}
            onSelectItemForCustomization={(item) => setCustomizingItem(item)}
            cartItems={cartItems}
            onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
            fulfillmentType={fulfillmentType}
            selectedZone={selectedZone}
            onOpenZoneModal={() => setIsZoneModalOpen(true)}
            activeOrder={inFlightOrder || null}
            onTrackOrder={(ord) => {
              setActiveOrder(ord);
              setCurrentScreen('order-tracker');
            }}
            onOpenOrderStatusModal={() => setIsOrderStatusModalOpen(true)}
            isRestaurantOpen={isRestaurantOpen}
            isArabic={arabicActive}
            isDark={isDark}
          />
        );

      case 'checkout':
        return (
          <CheckoutScreen
            cartItems={cartItems}
            fulfillmentType={fulfillmentType}
            selectedZone={selectedZone}
            availableZones={deliveryZones}
            addressDetails={addressDetails}
            onUpdateAddressDetails={setAddressDetails}
            customerInfo={customerInfo}
            onUpdateCustomerInfo={setCustomerInfo}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={setAppliedCoupon}
            availableCoupons={coupons}
            onPlaceOrder={handlePlaceOrder}
            onPlaceOrderSuccess={(createdOrder) => {
              setOrders((prev) => [createdOrder, ...prev]);
              setActiveOrder(createdOrder);
              setCartItems([]);
              setIsCartDrawerOpen(false);
              setCurrentScreen('order-tracker');
            }}
            onBackToMenu={() => setCurrentScreen('menu-ordering')}
            onOpenZoneModal={() => setIsZoneModalOpen(true)}
            isArabic={arabicActive}
            isDark={isDark}
          />
        );

      case 'order-tracker':
        return activeOrder ? (
          <OrderTrackerScreen
            order={activeOrder}
            onBackToMenu={() => setCurrentScreen('menu-ordering')}
            isArabic={arabicActive}
            isDark={isDark}
          />
        ) : (
          <div className="text-center py-20">
            <h3 className="text-lg font-bold">No active order to track</h3>
            <button
              onClick={() => setCurrentScreen('menu-ordering')}
              className="mt-4 px-6 py-2.5 rounded-xl bg-lantern-red text-white text-xs font-bold"
            >
              Back to Menu
            </button>
          </div>
        );

      case 'admin-login':
        return (
          <AdminLoginPage
            onSuccess={(user) => {
              setCurrentUser(user);
              setCurrentScreen('admin-kds');
            }}
            isArabic={arabicActive}
          />
        );

      case 'admin-kds':
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'STAFF')) {
          return (
            <AdminLoginPage
              onSuccess={(user) => {
                setCurrentUser(user);
              }}
              isArabic={arabicActive}
            />
          );
        }
        return (
          <AdminKDSView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            isArabic={arabicActive}
            isDark={isDark}
          />
        );

      case 'admin-menu-cms':
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'STAFF')) {
          return (
            <AdminLoginPage
              onSuccess={(user) => {
                setCurrentUser(user);
              }}
              isArabic={arabicActive}
            />
          );
        }
        return (
          <AdminMenuCMS
            menuItems={menuItems}
            categories={categories}
            onToggleItemAvailability={handleToggleItemAvailability}
            onUpdateItemPrice={handleUpdateItemPrice}
            onCreateMenuItem={handleCreateMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            isArabic={arabicActive}
            isDark={isDark}
          />
        );

      case 'admin-analytics':
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'STAFF')) {
          return (
            <AdminLoginPage
              onSuccess={(user) => {
                setCurrentUser(user);
              }}
              isArabic={arabicActive}
            />
          );
        }
        return (
          <AdminAnalyticsView
            orders={orders}
            menuItems={menuItems}
            isArabic={arabicActive}
            isDark={isDark}
          />
        );

      case 'admin-users':
        if (!currentUser || currentUser.role !== 'ADMIN') {
          return (
            <AdminLoginPage
              onSuccess={(user) => {
                setCurrentUser(user);
              }}
              isArabic={arabicActive}
            />
          );
        }
        return (
          <div className="p-4 sm:p-8">
            <AdminUsersView
              currentUser={currentUser}
              isArabic={arabicActive}
              isDark={isDark}
            />
          </div>
        );

      case 'admin-cashier':
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'STAFF' && currentUser.role !== 'CASHIER')) {
          return (
            <AdminLoginPage
              onSuccess={(user) => {
                setCurrentUser(user);
              }}
              isArabic={arabicActive}
            />
          );
        }
        return (
          <AdminCashierPOSView
            orders={orders}
            menuItems={menuItems}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddNewOrder={(newOrder) => {
              setOrders((prev) => [newOrder, ...prev]);
            }}
            isArabic={arabicActive}
            isDark={isDark}
            currentUser={currentUser}
          />
        );

      case 'admin-delivery':
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'STAFF' && currentUser.role !== 'DELIVERY')) {
          return (
            <AdminLoginPage
              onSuccess={(user) => {
                setCurrentUser(user);
              }}
              isArabic={arabicActive}
            />
          );
        }
        return (
          <AdminDeliveryView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            isArabic={arabicActive}
            isDark={isDark}
            currentUser={currentUser}
          />
        );

      case 'admin-reservations':
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'STAFF' && currentUser.role !== 'RESERVATION')) {
          return (
            <AdminLoginPage
              onSuccess={(user) => {
                setCurrentUser(user);
              }}
              isArabic={arabicActive}
            />
          );
        }
        return (
          <AdminReservationsView
            isArabic={arabicActive}
            isDark={isDark}
            currentUser={currentUser}
          />
        );

      case 'design-system':
      default:
        return <ScreenDesignSystem isDark={isDark} isArabic={arabicActive} />;
    }
  };

  return (
    <div
      dir={direction}
      className={`min-h-screen transition-colors duration-300 ${
        isArabic ? 'font-arabic' : 'font-sans'
      } ${
        isDark ? 'bg-[#3D281E] text-evening-cream' : 'bg-[#F9F1EB] text-temple-brown'
      }`}
    >
      {/* Top Customer Floating Navigation Bar */}
      <Navbar
        onLogoClick={() => setCurrentScreen('menu-ordering')}
        onMenuClick={() => {
          if (currentScreen !== 'menu-ordering') {
            setCurrentScreen('menu-ordering');
            setTimeout(() => {
              document.getElementById('menu-catalog-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            document.getElementById('menu-catalog-section')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onDealsClick={() => {
          if (currentScreen !== 'menu-ordering') {
            setCurrentScreen('menu-ordering');
            setTimeout(() => {
              document.getElementById('section-cat-deals')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            document.getElementById('section-cat-deals')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOurCrustClick={() => {
          if (currentScreen !== 'menu-ordering') {
            setCurrentScreen('menu-ordering');
            setTimeout(() => {
              document.getElementById('our-crust-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            document.getElementById('our-crust-section')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onSearchClick={() => {
          if (currentScreen !== 'menu-ordering') {
            setCurrentScreen('menu-ordering');
            setTimeout(() => {
              document.getElementById('menu-search-input')?.focus();
            }, 100);
          } else {
            document.getElementById('menu-search-input')?.focus();
          }
        }}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        locale={locale}
        onToggleLocale={() => setLocale(locale === 'en' ? 'ar' : 'en')}
        cartItemCount={totalCartCount}
        cartTotalAmount={totalCartAmount}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
        fulfillmentType={fulfillmentType}
        selectedZone={selectedZone}
        onOpenZoneModal={() => setIsZoneModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenOrderStatus={() => setIsOrderStatusModalOpen(true)}
        hasActiveOrder={!!inFlightOrder}
        activeOrderNumber={inFlightOrder?.orderNumber}
        isOverlay={currentScreen === 'menu-ordering'}
        isAdminView={
          currentScreen === 'admin-kds' ||
          currentScreen === 'admin-menu-cms' ||
          currentScreen === 'admin-analytics' ||
          currentScreen === 'admin-users' ||
          currentScreen === 'admin-cashier' ||
          currentScreen === 'admin-delivery' ||
          currentScreen === 'admin-reservations'
        }
        currentAdminScreen={currentScreen}
        onNavigateAdmin={(targetScreen) => {
          if (targetScreen === 'menu-ordering') {
            window.history.pushState({}, '', '/');
            setCurrentScreen('menu-ordering');
          } else if (targetScreen === 'admin-kds') {
            window.history.pushState({}, '', '/admin/kds');
            setCurrentScreen('admin-kds');
          } else if (targetScreen === 'admin-menu-cms') {
            window.history.pushState({}, '', '/admin/menu');
            setCurrentScreen('admin-menu-cms');
          } else if (targetScreen === 'admin-users') {
            window.history.pushState({}, '', '/admin/users');
            setCurrentScreen('admin-users');
          } else if (targetScreen === 'admin-analytics') {
            window.history.pushState({}, '', '/admin/analytics');
            setCurrentScreen('admin-analytics');
          } else if (targetScreen === 'admin-cashier') {
            window.history.pushState({}, '', '/admin/cashier');
            setCurrentScreen('admin-cashier');
          } else if (targetScreen === 'admin-delivery') {
            window.history.pushState({}, '', '/admin/delivery');
            setCurrentScreen('admin-delivery');
          } else if (targetScreen === 'admin-reservations') {
            window.history.pushState({}, '', '/admin/reservations');
            setCurrentScreen('admin-reservations');
          }
        }}
      />

      {/* Main Content Viewport */}
      {currentScreen === 'menu-ordering' ? (
        <main className="w-full">
          {renderScreenContent()}
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8 sm:pb-12">
          <div
            className={`w-full rounded-3xl transition-all shadow-lg border overflow-hidden ${
              isDark
                ? 'bg-dark-surface border-dark-border'
                : 'bg-white border-[#EADBD0]'
            }`}
          >
            {renderScreenContent()}
          </div>
        </main>
      )}

      {/* OVERLAY MODALS */}
      {/* 1. Food Customization Modal */}
      <FoodCustomizationModal
        item={customizingItem}
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={handleAddToCart}
        isArabic={isArabic}
        isDark={isDark}
      />

      {/* 2. Slide-out Cart Drawer */}
      <CartSlideDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartDrawerOpen(false);
          setCurrentScreen('checkout');
        }}
        deliveryFee={selectedZone?.deliveryFee || 30}
        fulfillmentType={fulfillmentType}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
        availableCoupons={coupons}
        isArabic={isArabic}
        isDark={isDark}
      />

      {/* 3. Address & Delivery Zone Selector Modal */}
      <AddressZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        zones={deliveryZones}
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
        fulfillmentType={fulfillmentType}
        onSelectFulfillmentType={setFulfillmentType}
        addressDetails={addressDetails}
        onUpdateAddressDetails={setAddressDetails}
        isArabic={isArabic}
        isDark={isDark}
      />

      {/* 4. Customer Sign-In / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.name) {
            setCustomerInfo((prev) => ({
              ...prev,
              name: user.name || prev.name,
              email: user.email || prev.email,
              phone: user.phone || prev.phone,
            }));
          }
        }}
        onContinueAsGuest={() => setIsAuthModalOpen(false)}
        isArabic={isArabic}
      />

      {/* 5. Order Status Lookup & Tracking Modal */}
      <OrderStatusModal
        isOpen={isOrderStatusModalOpen}
        onClose={() => setIsOrderStatusModalOpen(false)}
        recentOrders={orders}
        onSelectOrder={(selectedOrd) => {
          setActiveOrder(selectedOrd);
          setCurrentScreen('order-tracker');
        }}
        isArabic={isArabic}
        isDark={isDark}
      />

      {/* Footer */}
      <footer
        className={`mt-12 border-t py-6 px-4 text-center text-xs transition-colors ${
          isDark
            ? 'border-dark-border bg-dark-surface text-stone-gray'
            : 'border-[#EADBD0] bg-white text-stone-gray'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lantern-red font-display">FeastCraft Fast-Casual Kitchen</span>
            <span>•</span>
            <span>Artisanal Wood-Fired Pizzas & Smash Burgers</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Greater Cairo Delivery • 15–45m</span>
            <span>•</span>
            <span>Hot & Fresh Guarantee</span>
            <span>•</span>
            <a
              id="footer-admin-link"
              href="/admin/login"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/admin/login');
                setCurrentScreen('admin-login');
              }}
              className="hover:text-lantern-red text-stone-gray/80 hover:underline transition-colors cursor-pointer"
            >
              {isArabic ? 'بوابة الإدارة' : 'Staff Portal'}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
