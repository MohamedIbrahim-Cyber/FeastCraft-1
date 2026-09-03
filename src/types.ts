export type ThemeMode = 'light' | 'dark';
export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';
export type ViewportMode = 'desktop-1440' | 'mobile-390' | 'dual-bidirectional';

export type ScreenId =
  | 'menu'
  | 'menu-ordering'
  | 'checkout'
  | 'order-tracker'
  | 'admin-login'
  | 'admin-kds'
  | 'admin-menu'
  | 'admin-menu-cms'
  | 'admin-analytics'
  | 'admin-users'
  | 'admin-reservations'
  | 'admin-delivery'
  | 'admin-cashier'
  | 'design-system';

export type FulfillmentType = 'DELIVERY' | 'PICKUP';

export type OrderStatus =
  | 'RECEIVED'
  | 'PENDING'
  | 'ACCEPTED'
  | 'KITCHEN_PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'PAYMOB_CARD' | 'INSTAPAY_WALLET';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'PENDING_COD';

export type StaffRole =
  | 'ADMIN'
  | 'CASHIER'
  | 'KITCHEN'
  | 'DELIVERY'
  | 'RESERVATION'
  | 'STAFF';

export type AdminRole = StaffRole;
export type UserRole = 'CUSTOMER' | StaffRole;

export interface TableReservation {
  id: string;
  reservationNumber: string; // e.g. #RES-101
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:mm
  seatingArea: 'INDOOR' | 'OUTDOOR_PATIO' | 'VIP_BOOTH' | 'RAMADAN_MAJLIS';
  status: 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';
  specialNotes?: string;
  assignedStaff?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ItemOption {
  id: string;
  optionGroupId: string;
  name: string;
  nameAr: string;
  priceDelta: number; // in EGP
  isDefault?: boolean;
  isAvailable: boolean;
}

export interface ItemOptionGroup {
  id: string;
  menuItemId?: string;
  name: string;
  nameAr: string;
  minSelect: number; // 0 for optional, 1 for required single choice
  maxSelect: number; // 1 for radio, >1 for multi-select checkboxes
  isRequired: boolean;
  options: ItemOption[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  imageUrl: string;
  basePrice: number; // in EGP
  isAvailable: boolean;
  isArchived?: boolean;
  isPopular?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  calories?: number;
  prepTimeMinutes?: number;
  optionGroups?: ItemOptionGroup[];
}

export interface DeliveryZone {
  id: string;
  zoneName: string;
  zoneNameAr: string;
  deliveryFee: number; // in EGP
  estimatedMinutes: number;
  isActive: boolean;
}

export interface SelectedOptionChoice {
  groupId: string;
  groupName: string;
  groupNameAr: string;
  optionId: string;
  optionName: string;
  optionNameAr: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique item line id
  menuItemId: string;
  name: string;
  nameAr: string;
  imageUrl: string;
  basePrice: number;
  selectedOptions: SelectedOptionChoice[];
  specialInstructions?: string;
  quantity: number;
  unitPrice: number; // basePrice + sum of selected options priceDelta
  totalPrice: number; // unitPrice * quantity
}

export interface CouponDiscount {
  code: string;
  discountPercentage: number;
  maxDiscount?: number;
  minOrderAmount: number;
}

export interface OrderPricingSummary {
  subtotal: number;
  deliveryFee: number;
  taxAmount: number; // 14% VAT
  discountAmount: number;
  appliedCouponCode?: string;
  totalAmount: number;
}

export interface DeliveryAddressDetails {
  street: string;
  building: string;
  floor: string;
  apartment: string;
  nearestLandmark?: string;
  deliveryNotes?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface CustomerDeliveryInfo {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryZoneId: string;
  deliveryAddress: string;
  building?: string;
  floor?: string;
  apartment?: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #FC-8921
  userId?: string;
  fulfillmentType: FulfillmentType;
  status: OrderStatus;
  
  // Customer & Address Info
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryZoneNameAr?: string;
  deliveryAddress?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  deliveryNotes?: string;
  
  // Financial Breakdowns
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  appliedCouponCode?: string;
  totalAmount: number;
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentGatewayRef?: string;
  
  // Timings & Tracking
  estimatedMinutes: number;
  createdAt: string;
  acceptedAt?: string;
  preparedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  
  items: CartItem[];
}

export interface CalculatedPricingBreakdown {
  subtotal: string;
  deliveryFee: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  itemsBreakdown: Array<{
    id: string;
    name: string;
    unitPrice: string;
    quantity: number;
    total: string;
  }>;
}
