import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  Phone,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  X,
  Check,
  CalendarCheck,
} from 'lucide-react';
import { TableReservation } from '../../types';

interface AdminReservationsViewProps {
  isArabic: boolean;
  isDark: boolean;
  currentUser?: { name?: string; email?: string; role?: string } | null;
}

export const AdminReservationsView: React.FC<AdminReservationsViewProps> = ({
  isArabic,
  isDark,
  currentUser,
}) => {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');

  // New Reservation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [reservationDate, setReservationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reservationTime, setReservationTime] = useState('20:00');
  const [seatingArea, setSeatingArea] = useState<'INDOOR' | 'OUTDOOR_PATIO' | 'VIP_BOOTH' | 'RAMADAN_MAJLIS'>('INDOOR');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch reservations from API
  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reservations');
      if (res.ok) {
        const data = await res.json();
        if (data.reservations) {
          setReservations(data.reservations);
        }
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: TableReservation['status']) => {
    try {
      const res = await fetch(`/api/admin/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        setFeedbackMessage({
          type: 'success',
          text: isArabic ? 'تم تحديث حالة الحجز بنجاح' : 'Reservation status updated successfully',
        });
      }
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: isArabic ? 'تعذر تحديث الحجز' : 'Failed to update reservation',
      });
    }
  };

  // Create Reservation
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setFeedbackMessage({
        type: 'error',
        text: isArabic ? 'يرجى إدخال اسم العميل ورقم الهاتف' : 'Customer name and phone are required',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          partySize,
          reservationDate,
          reservationTime,
          seatingArea,
          specialNotes,
          assignedStaff: currentUser?.name || 'Reservation Desk',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reservation) {
          setReservations((prev) => [data.reservation, ...prev]);
          setIsCreateModalOpen(false);
          setCustomerName('');
          setCustomerPhone('');
          setPartySize(2);
          setSpecialNotes('');
          setFeedbackMessage({
            type: 'success',
            text: isArabic
              ? `تم تأكيد حجز الطاولة رقم ${data.reservation.reservationNumber} بنجاح!`
              : `Table reservation ${data.reservation.reservationNumber} confirmed!`,
          });
        }
      }
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: isArabic ? 'فشل إرسال الحجز للخادم' : 'Failed to save reservation',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered reservations
  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone.includes(searchQuery) ||
      r.reservationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesArea = areaFilter === 'ALL' || r.seatingArea === areaFilter;
    return matchesSearch && matchesStatus && matchesArea;
  });

  const confirmedCount = reservations.filter((r) => r.status === 'CONFIRMED').length;
  const seatedCount = reservations.filter((r) => r.status === 'SEATED').length;
  const totalGuests = reservations
    .filter((r) => r.status === 'CONFIRMED' || r.status === 'SEATED')
    .reduce((acc, r) => acc + (r.partySize || 0), 0);

  const getAreaBadge = (area: string) => {
    switch (area) {
      case 'INDOOR':
        return { label: isArabic ? 'الصالة الداخلية' : 'Main Indoor Hall', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      case 'OUTDOOR_PATIO':
        return { label: isArabic ? 'التراس الخارجي' : 'Outdoor Patio', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      case 'VIP_BOOTH':
        return { label: isArabic ? 'كابينة VIP خاصة' : 'VIP Private Booth', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
      case 'RAMADAN_MAJLIS':
        return { label: isArabic ? 'مجلس شرقي مريح' : 'Oriental Majlis Lounge', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      default:
        return { label: area, color: 'bg-stone-500/10 text-stone-600 border-stone-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight">
                {isArabic ? 'فريق الحجوزات وتنظيم الطاولات' : 'Table Reservations & Guest Seating'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                {isArabic ? 'محطة الحجوزات' : 'Reservation Station'}
              </span>
            </div>
            <p className="text-xs text-stone-gray">
              {isArabic
                ? 'إدارة حجوزات الضيوف وتسكين الطاولات والتحكم بالطاقة الاستيعابية للصالة'
                : 'Manage dining reservations, party sizes, seating layouts, and guest arrivals'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchReservations}
            disabled={isLoading}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark
                ? 'bg-dark-surface-elevated border-dark-border text-evening-cream hover:bg-white/10'
                : 'bg-white border-[#E8D9CD] text-temple-brown hover:bg-stone-50'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-500' : ''}`} />
          </button>

          <button
            id="new-reservation-btn"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'حجز طاولة جديد' : 'New Reservation'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <div className="text-xs font-bold text-stone-gray">{isArabic ? 'الحجوزات المؤكدة' : 'Confirmed'}</div>
          <div className="text-2xl font-black mt-1 text-purple-600 dark:text-purple-400">{confirmedCount}</div>
        </div>
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <div className="text-xs font-bold text-stone-gray">{isArabic ? 'ضيوف حاليون بالصالة' : 'Currently Seated'}</div>
          <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{seatedCount}</div>
        </div>
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <div className="text-xs font-bold text-stone-gray">{isArabic ? 'إجمالي الأفراد المحجوز لهم' : 'Total Reserved Guests'}</div>
          <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">{totalGuests} <span className="text-xs font-normal text-stone-gray">{isArabic ? 'فرد' : 'guests'}</span></div>
        </div>
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <div className="text-xs font-bold text-stone-gray">{isArabic ? 'إجمالي الحجوزات المسجلة' : 'All Bookings'}</div>
          <div className="text-2xl font-black mt-1">{reservations.length}</div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button type="button" onClick={() => setFeedbackMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'بحث بالاسم، رقم الهاتف، أو كود الحجز (#RES)...' : 'Search by guest name, phone, or reservation code (#RES)...'}
            className={`w-full ps-10 pe-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDark
                ? 'bg-dark-surface border-dark-border text-evening-cream placeholder:text-stone-600'
                : 'bg-white border-[#EADBD0] text-temple-brown placeholder:text-stone-400'
            }`}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-dark-surface text-stone-400 hover:text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st === 'ALL'
                ? isArabic ? 'الكل' : 'All'
                : st === 'CONFIRMED'
                ? isArabic ? 'مؤكد' : 'Confirmed'
                : st === 'SEATED'
                ? isArabic ? 'تم التسكين' : 'Seated'
                : st === 'COMPLETED'
                ? isArabic ? 'مكتمل' : 'Completed'
                : isArabic ? 'ملغي' : 'Cancelled'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Reservations List Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-gray text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
          <span>{isArabic ? 'جاري تحميل سجل الحجوزات...' : 'Loading reservations...'}</span>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADBD0]'}`}>
          <Calendar className="w-12 h-12 mx-auto text-stone-gray/40 mb-3" />
          <h3 className="font-bold text-sm">{isArabic ? 'لا توجد حجوزات مطابقة' : 'No matching reservations'}</h3>
          <p className="text-xs text-stone-gray mt-1">
            {isArabic ? 'جرب تغيير خيارات البحث أو قم بإضافة حجز جديد للعملاء' : 'Try adjusting your search filters or add a new table booking.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReservations.map((res) => {
            const area = getAreaBadge(res.seatingArea);
            return (
              <div
                key={res.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isDark
                    ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
                    : 'bg-white border-[#EADBD0] text-temple-brown'
                }`}
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-purple-600 dark:text-purple-400">
                        {res.reservationNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${area.color}`}>
                        {area.label}
                      </span>
                    </div>
                    <h3 className="font-black text-base mt-1">{res.customerName}</h3>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      res.status === 'CONFIRMED'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                        : res.status === 'SEATED'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : res.status === 'COMPLETED'
                        ? 'bg-stone-500/15 text-stone-600 dark:text-stone-400'
                        : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                    }`}
                  >
                    {res.status === 'CONFIRMED'
                      ? isArabic ? 'مؤكد' : 'Confirmed'
                      : res.status === 'SEATED'
                      ? isArabic ? 'جالس بالصالة' : 'Seated'
                      : res.status === 'COMPLETED'
                      ? isArabic ? 'انتهت الجلسة' : 'Completed'
                      : isArabic ? 'ملغي' : 'Cancelled'}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2 text-stone-gray">
                    <Calendar className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span>{res.reservationDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-gray">
                    <Clock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span className="font-mono font-bold text-black dark:text-white">{res.reservationTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-gray">
                    <Users className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span>
                      <strong className="text-black dark:text-white">{res.partySize}</strong> {isArabic ? 'أفراد' : 'guests'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-gray">
                    <Phone className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <a href={`tel:${res.customerPhone}`} className="hover:underline font-mono">
                      {res.customerPhone}
                    </a>
                  </div>
                </div>

                {res.specialNotes && (
                  <p className="mt-2 text-xs text-stone-gray bg-black/5 dark:bg-white/5 p-2.5 rounded-xl">
                    <span className="font-bold text-black dark:text-white">{isArabic ? 'ملاحظات: ' : 'Notes: '}</span>
                    {res.specialNotes}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center justify-between gap-2 pt-2">
                  <div className="text-[11px] text-stone-gray">
                    {isArabic ? 'بإشراف: ' : 'Staff: '} {res.assignedStaff || 'Reservation Desk'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {res.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(res.id, 'SEATED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'تسكين الضيف' : 'Seat Guest'}</span>
                      </button>
                    )}

                    {res.status === 'SEATED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(res.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-xl bg-stone-700 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'إخلاء الطاولة' : 'Complete'}</span>
                      </button>
                    )}

                    {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-bold transition-all cursor-pointer"
                        title={isArabic ? 'إلغاء الحجز' : 'Cancel'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. New Reservation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 transition-all ${
              isDark ? 'bg-dark-surface-elevated border-dark-border text-white' : 'bg-white border-[#EADBD0] text-temple-brown'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base">{isArabic ? 'حجز طاولة جديد للضيوف' : 'New Table Reservation'}</h3>
                  <p className="text-[11px] text-stone-gray">{isArabic ? 'تسجيل بيانات الضيف وتحديد موعد الجلسة' : 'Record guest details and dining slot'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-stone-gray cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-gray mb-1">
                    {isArabic ? 'اسم العميل الضيف *' : 'Guest Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isArabic ? 'مثال: كريم منصور' : 'e.g. Karim Mansour'}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-dark-surface border-dark-border text-white' : 'bg-stone-50 border-[#DEC7B7] text-temple-brown'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-gray mb-1">
                    {isArabic ? 'رقم الهاتف المحمول *' : 'Mobile Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-dark-surface border-dark-border text-white' : 'bg-stone-50 border-[#DEC7B7] text-temple-brown'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-gray mb-1">
                    {isArabic ? 'عدد الأفراد' : 'Guests Count'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-dark-surface border-dark-border text-white' : 'bg-stone-50 border-[#DEC7B7] text-temple-brown'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-gray mb-1">
                    {isArabic ? 'تاريخ الحجز' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-dark-surface border-dark-border text-white' : 'bg-stone-50 border-[#DEC7B7] text-temple-brown'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-gray mb-1">
                    {isArabic ? 'الوقت' : 'Time Slot'}
                  </label>
                  <input
                    type="time"
                    value={reservationTime}
                    onChange={(e) => setReservationTime(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-dark-surface border-dark-border text-white' : 'bg-stone-50 border-[#DEC7B7] text-temple-brown'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-gray mb-1">
                  {isArabic ? 'منطقة الجلوس المفضلة' : 'Preferred Dining Area'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'INDOOR', labelEn: 'Indoor Dining Hall', labelAr: 'الصالة الداخلية' },
                    { id: 'OUTDOOR_PATIO', labelEn: 'Outdoor Patio', labelAr: 'التراس الخارجي' },
                    { id: 'VIP_BOOTH', labelEn: 'VIP Private Booth', labelAr: 'كابينة VIP خاصة' },
                    { id: 'RAMADAN_MAJLIS', labelEn: 'Oriental Majlis', labelAr: 'مجلس شرقي' },
                  ].map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => setSeatingArea(area.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-start transition-all cursor-pointer ${
                        seatingArea === area.id
                          ? 'border-purple-600 bg-purple-600/15 text-purple-600 dark:text-purple-300 ring-2 ring-purple-600/30'
                          : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {isArabic ? area.labelAr : area.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-gray mb-1">
                  {isArabic ? 'ملاحظات خاصة (اختياري)' : 'Special Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder={isArabic ? 'احتفال خاص، كرسي أطفال، طاولة بجوار النافذة...' : 'Anniversary celebration, baby highchair, window table...'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? 'bg-dark-surface border-dark-border text-white' : 'bg-stone-50 border-[#DEC7B7] text-temple-brown'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isArabic ? 'تأكيد وحفظ الحجز' : 'Confirm & Save Booking'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
