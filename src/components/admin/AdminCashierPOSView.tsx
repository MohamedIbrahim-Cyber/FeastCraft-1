import React, { useState } from 'react';
import {
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ShoppingBag,
  DollarSign,
  ArrowRight,
  Sparkles,
  User,
  Phone,
  Trash2,
} from 'lucide-react';
import { Order, OrderStatus, MenuItem, PaymentMethod, CartItem } from '../../types';

interface AdminCashierPOSViewProps {
  orders: Order[];
  menuItems: MenuItem[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onAddNewOrder: (newOrder: Order) => void;
  isArabic: boolean;
  isDark: boolean;
  currentUser?: { name?: string; email?: string; role?: string } | null;
}

export const AdminCashierPOSView: React.FC<AdminCashierPOSViewProps> = ({
  orders,
  menuItems,
  onUpdateOrderStatus,
  onAddNewOrder,
  isArabic,
  isDark,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'POS_NEW' | 'PENDING_PAYMENTS' | 'TODAY_TRANSACTIONS'>('POS_NEW');
  const [searchMenuQuery, setSearchMenuQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Quick POS Ticket items
  const [posTicketItems, setPosTicketItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('+20 100 000 0000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [showReceiptModal, setShowReceiptModal] = useState<Order | null>(null);

  // Calculations
  const ticketSubtotal = posTicketItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxAmount = ticketSubtotal * 0.14;
  const grandTotal = ticketSubtotal + taxAmount;
  const changeDue = Math.max(0, (Number(cashTendered) || 0) - grandTotal);

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.isArchived) return false;
    const matchesSearch =
      item.name.toLowerCase().includes(searchMenuQuery.toLowerCase()) ||
      item.nameAr.includes(searchMenuQuery);
    const matchesCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Add Item to ticket
  const handleAddItemToTicket = (item: MenuItem) => {
    setPosTicketItems((prev) => {
      const idx = prev.findIndex((i) => i.menuItemId === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        const updatedQty = copy[idx].quantity + 1;
        copy[idx] = {
          ...copy[idx],
          quantity: updatedQty,
          totalPrice: updatedQty * copy[idx].unitPrice,
        };
        return copy;
      } else {
        const newItem: CartItem = {
          id: `pos-${Date.now()}-${item.id}`,
          menuItemId: item.id,
          name: item.name,
          nameAr: item.nameAr,
          imageUrl: item.imageUrl,
          basePrice: item.basePrice,
          selectedOptions: [],
          quantity: 1,
          unitPrice: item.basePrice,
          totalPrice: item.basePrice,
        };
        return [...prev, newItem];
      }
    });
  };

  // Modify quantity
  const handleUpdateItemQty = (index: number, delta: number) => {
    setPosTicketItems((prev) => {
      const copy = [...prev];
      const newQty = copy[index].quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== index);
      }
      copy[index] = {
        ...copy[index],
        quantity: newQty,
        totalPrice: newQty * copy[index].unitPrice,
      };
      return copy;
    });
  };

  // Submit and Print POS Ticket
  const handleCheckoutPOSTicket = () => {
    if (posTicketItems.length === 0) return;

    const newOrder: Order = {
      id: `pos-${Date.now()}`,
      orderNumber: `#FC-${Math.floor(8000 + Math.random() * 1999)}`,
      fulfillmentType: 'PICKUP',
      status: 'KITCHEN_PREPARING',
      customerName: customerName.trim() || 'Walk-in Guest',
      customerPhone: customerPhone.trim() || '+20 100 000 0000',
      customerEmail: 'cashier@feastcraft.com',
      deliveryAddress: 'FeastCraft Main Counter / In-Store Dining',
      subtotal: ticketSubtotal,
      deliveryFee: 0,
      taxAmount,
      discountAmount: 0,
      totalAmount: grandTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      estimatedMinutes: 15,
      createdAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
      items: [...posTicketItems],
    };

    onAddNewOrder(newOrder);
    setShowReceiptModal(newOrder);
    setPosTicketItems([]);
    setCashTendered('');
  };

  // Cashier metrics
  const todayPaidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
  const todayTotalRevenue = todayPaidOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* 1. Cashier Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight">
                {isArabic ? 'محطة الكاشير ونقاط البيع POS' : 'Cashier Counter & POS Terminal'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                {isArabic ? 'محطة الكاشير' : 'Cashier Station'}
              </span>
            </div>
            <p className="text-xs text-stone-gray">
              {isArabic
                ? 'تسجيل طلبات الصالة، تحصيل الفواتير، وطباعة إيصالات الدفع الحرارية'
                : 'Direct in-store order taking, payment processing, cash drawer, and receipt generation'}
            </p>
          </div>
        </div>

        {/* Quick Shift Revenue Badge */}
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <div className="text-end">
            <div className="text-[10px] text-stone-gray font-bold">{isArabic ? 'مبيعات الوردية الحالية' : 'Today Sales'}</div>
            <div className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
              {todayTotalRevenue.toFixed(2)} <span className="text-xs font-normal">EGP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mode Selector Bar */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('POS_NEW')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'POS_NEW'
              ? 'bg-emerald-600 text-white shadow-xs'
              : isDark
              ? 'bg-dark-surface text-stone-400 hover:text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isArabic ? 'نقطة البيع السريعة POS' : 'Quick POS Terminal'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PENDING_PAYMENTS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'PENDING_PAYMENTS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : isDark
              ? 'bg-dark-surface text-stone-400 hover:text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>{isArabic ? 'فواتير مطلوب تحصيلها' : 'Pending Payments'}</span>
        </button>
      </div>

      {/* 3. Main Body */}
      {activeTab === 'POS_NEW' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Menu Items Selector */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-gray" />
                <input
                  type="text"
                  value={searchMenuQuery}
                  onChange={(e) => setSearchMenuQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث في الأصناف لإضافتها للتذكرة...' : 'Search items to add to ticket...'}
                  className={`w-full ps-10 pe-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-dark-surface border-dark-border text-white' : 'bg-white border-[#EADBD0] text-temple-brown'
                  }`}
                />
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddItemToTicket(item)}
                  className={`p-3 rounded-2xl border cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between ${
                    isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={isArabic ? item.nameAr : item.name}
                    className="w-full h-24 object-cover rounded-xl mb-2"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-xs line-clamp-1">{isArabic ? item.nameAr : item.name}</h4>
                    <div className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      {item.basePrice} EGP
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-2 w-full py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Bill / Ticket Cart */}
          <div id="active-counter-ticket" className="lg:col-span-5">
            <div className={`p-5 rounded-3xl border sticky top-20 shadow-sm ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 font-black text-sm">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>{isArabic ? 'تذكرة الكاشير الحالية' : 'Active Counter Ticket'}</span>
                </div>
                {posTicketItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPosTicketItems([])}
                    className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isArabic ? 'مسح التذكرة' : 'Clear'}</span>
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="py-3 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {posTicketItems.length === 0 ? (
                  <div className="py-8 text-center text-stone-gray text-xs">
                    {isArabic ? 'اضغط على أي صنف من القائمة لإضافته للتذكرة' : 'Click on any item on the left to add it to ticket'}
                  </div>
                ) : (
                  posTicketItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between text-xs pb-2 border-b border-black/5 dark:border-white/5">
                      <div className="flex-1 pr-2">
                        <div className="font-bold">{isArabic ? item.nameAr : item.name}</div>
                        <div className="text-[11px] text-stone-gray font-mono">{item.unitPrice} EGP</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(idx, -1)}
                          className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 font-bold flex items-center justify-center hover:bg-black/10"
                        >
                          -
                        </button>
                        <span className="font-bold font-mono px-1">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(idx, 1)}
                          className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 font-bold flex items-center justify-center hover:bg-black/10"
                        >
                          +
                        </button>
                        <span className="font-mono font-bold w-16 text-end">{item.totalPrice} EGP</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals Breakdown */}
              <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-gray">
                  <span>{isArabic ? 'المجموع الجزئي' : 'Subtotal'}</span>
                  <span className="font-mono">{ticketSubtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between text-stone-gray">
                  <span>{isArabic ? 'ضريبة القيمة المضافة (14%)' : 'VAT (14%)'}</span>
                  <span className="font-mono">{taxAmount.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between text-base font-black pt-2 border-t border-black/5 dark:border-white/5">
                  <span>{isArabic ? 'المطلوب سداده' : 'Total Due'}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{grandTotal.toFixed(2)} EGP</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                <div className="text-xs font-bold text-stone-gray mb-2">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'CASH_ON_DELIVERY'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600'
                        : 'border-black/10 dark:border-white/10'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>{isArabic ? 'كاش نقدي' : 'Cash'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PAYMOB_CARD')}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'PAYMOB_CARD'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600'
                        : 'border-black/10 dark:border-white/10'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isArabic ? 'فيزا / بطاقة' : 'Card POS'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('INSTAPAY_WALLET')}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'INSTAPAY_WALLET'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600'
                        : 'border-black/10 dark:border-white/10'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{isArabic ? 'إنستاباي' : 'Instapay'}</span>
                  </button>
                </div>
              </div>

              {/* Cash Calculator if paying Cash */}
              {paymentMethod === 'CASH_ON_DELIVERY' && grandTotal > 0 && (
                <div className="mt-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{isArabic ? 'المبلغ المستلم من العميل' : 'Cash Tendered'}</span>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder={grandTotal.toFixed(0)}
                      className="w-24 px-2 py-1 text-end rounded-lg font-mono font-bold bg-white dark:bg-black border border-stone-300 dark:border-stone-700"
                    />
                  </div>
                  {Number(cashTendered) > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>{isArabic ? 'الباقي المستحق للعميل:' : 'Change to Return:'}</span>
                      <span className="font-mono text-sm">{changeDue.toFixed(2)} EGP</span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Ticket Action */}
              <button
                type="button"
                onClick={handleCheckoutPOSTicket}
                disabled={posTicketItems.length === 0}
                className="mt-4 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>{isArabic ? 'تأكيد الحساب وإصدار الفاتورة' : 'Confirm Payment & Print Receipt'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Pending Payments List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`p-5 rounded-3xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}
            >
              <div className="flex justify-between items-start pb-2 border-b border-black/5 dark:border-white/5">
                <div>
                  <span className="font-mono font-bold text-sm text-emerald-600">{order.orderNumber}</span>
                  <h4 className="font-black text-sm">{order.customerName}</h4>
                </div>
                <div className="text-end">
                  <div className="font-mono font-black text-base">{order.totalAmount.toFixed(2)} EGP</div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {order.paymentStatus === 'PAID' ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="py-2 text-xs text-stone-gray space-y-1">
                <div>{order.items.length} {isArabic ? 'أصناف' : 'items'}</div>
                <div>{order.paymentMethod}</div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(order)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 hover:bg-black/5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'طباعة إيصال' : 'Print Receipt'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white text-black p-6 font-mono text-xs shadow-2xl border">
            <div className="text-center pb-3 border-b border-dashed border-black">
              <h3 className="font-black text-lg">FEASTCRAFT CAIRO</h3>
              <p className="text-[11px] text-stone-500">Artisanal Dining & Kitchen</p>
              <div className="mt-1 font-bold">{showReceiptModal.orderNumber}</div>
              <div className="text-[10px] text-stone-500">{new Date(showReceiptModal.createdAt).toLocaleString()}</div>
            </div>

            <div className="py-3 border-b border-dashed border-black space-y-2">
              {showReceiptModal.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.quantity}x {it.name}</span>
                  <span>{it.totalPrice} EGP</span>
                </div>
              ))}
            </div>

            <div className="py-3 border-b border-dashed border-black space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{showReceiptModal.subtotal.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (14%):</span>
                <span>{showReceiptModal.taxAmount.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1">
                <span>TOTAL:</span>
                <span>{showReceiptModal.totalAmount.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 pt-1">
                <span>Payment:</span>
                <span>{showReceiptModal.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[11px] text-stone-500">
              <p>Thank you for dining with FeastCraft!</p>
              <p>شكراً لزيارتكم ونتمنى لكم وجبة شهية</p>
            </div>

            <button
              type="button"
              onClick={() => setShowReceiptModal(null)}
              className="mt-4 w-full py-2 rounded-xl bg-black text-white font-sans font-bold text-xs"
            >
              {isArabic ? 'إغلاق الإيصال' : 'Close Receipt'}
            </button>
          </div>
        </div>
      )}
      {/* Mobile Floating Ticket Bar for quick counter checkout */}
      {activeTab === 'POS_NEW' && posTicketItems.length > 0 && (
        <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 animate-slideUp">
          <button
            type="button"
            onClick={() => {
              document.getElementById('active-counter-ticket')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-between shadow-xl cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-mono text-[11px]">
                {posTicketItems.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
              <span>{isArabic ? 'عرض تذكرة الكاشير والحساب' : 'View Ticket & Checkout'}</span>
            </div>
            <span className="font-mono text-sm font-black">
              {grandTotal.toFixed(2)} EGP
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
