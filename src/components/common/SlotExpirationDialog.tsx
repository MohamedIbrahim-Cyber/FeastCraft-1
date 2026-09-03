import React from 'react';
import { ShieldAlert, RefreshCw, Calendar, ArrowRight, ArrowLeft, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface SlotExpirationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExtendHold: () => void;
  onSelectNewDate?: () => void;
  isDark?: boolean;
  isArabic?: boolean;
  venueName?: string;
  date?: string;
  timeSlot?: string;
}

export const SlotExpirationDialog: React.FC<SlotExpirationDialogProps> = ({
  isOpen,
  onClose,
  onExtendHold,
  onSelectNewDate,
  isDark = false,
  isArabic = false,
  venueName = 'Nile Terrace Imperial Garden',
  date = '2026-09-18',
  timeSlot = '18:00 - 01:00',
}) => {
  const containerRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="slot-expiration-title"
          aria-describedby="slot-expiration-desc"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={containerRef}
            tabIndex={-1}
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl relative text-start outline-none ${
              isDark
                ? 'bg-[#2D201A] border-dark-border text-evening-cream'
                : 'bg-[#FAF5F0] border-[#DEC7B7] text-temple-brown'
            }`}
          >
            {/* Close button with high-contrast accessibility & min 44x44px target */}
            <button
              type="button"
              onClick={onClose}
              aria-label={isArabic ? 'إغلاق التنبيه' : 'Close dialog'}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-stone-gray hover:text-lantern-red hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon & Eyebrow */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2.5 p-3 rounded-2xl bg-lantern-red/15 text-lantern-red border border-lantern-red/30">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  {isArabic ? 'تنبيه انتهاء مهلة القفل الفوري' : '15-Minute Reservation Lock Expired'}
                </span>
              </div>

              <div>
                <h3
                  id="slot-expiration-title"
                  className="text-2xl font-extrabold font-display tracking-tight text-lantern-red"
                >
                  {isArabic ? 'انتهت مدة حجز الموعد الحصري' : 'Reservation Hold Has Expired'}
                </h3>
                <p id="slot-expiration-desc" className="text-xs sm:text-sm text-stone-gray mt-2 leading-relaxed">
                  {isArabic
                    ? 'لحماية توافر القاعات، يتم فتح الحجز تلقائياً لباقي العملاء بعد ١٥ دقيقة. يمكنك تمديد الحجز فوراً أو اختيار موعد بديل.'
                    : 'To ensure fairness for all private banquets, our inventory lock expires after 15 minutes of inactivity. Extend your exclusive hold now to secure this date.'}
                </p>
              </div>

              {/* Slot Summary Card */}
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  isDark ? 'bg-black/30 border-white/5' : 'bg-white/80 border-black/5'
                }`}
              >
                <div className="flex items-center justify-between text-stone-gray">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-lantern-red" />
                    <span>{isArabic ? 'الموقع والتاريخ:' : 'Venue & Date:'}</span>
                  </span>
                  <span className="font-bold text-temple-brown dark:text-evening-cream">
                    {date}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-gray">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-lantern-red" />
                    <span>{isArabic ? 'الفترة الزمنية:' : 'Time Slot:'}</span>
                  </span>
                  <span className="font-semibold">{timeSlot}</span>
                </div>
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-[11px] text-stone-gray">
                  <span>{isArabic ? 'الموقع المحجوز:' : 'Held Space:'}</span>
                  <span className="font-bold text-lantern-red">{venueName}</span>
                </div>
              </div>

              {/* Action Buttons with 44x44px min targets */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={onExtendHold}
                  className="w-full min-h-[48px] py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-lantern-red hover:opacity-95 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 group"
                  style={{ backgroundColor: '#A13D2D' }}
                >
                  <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
                  <span>
                    {isArabic ? 'تمديد قفل الموعد لـ ١٥ دقيقة إضافية' : 'Extend Hold for 15 More Minutes'}
                  </span>
                  {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>

                {onSelectNewDate && (
                  <button
                    type="button"
                    onClick={onSelectNewDate}
                    className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-2 ${
                      isDark
                        ? 'border-dark-border bg-dark-surface-elevated text-evening-cream hover:bg-white/10'
                        : 'border-[#DEC7B7] bg-white text-temple-brown hover:bg-[#F2E5DC]'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-stone-gray" />
                    <span>{isArabic ? 'اختيار موعد أو قاعة بديلة' : 'Browse Alternative Dates / Venues'}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
