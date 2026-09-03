import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, AlertTriangle, RefreshCw } from 'lucide-react';

interface CountdownTimerProps {
  initialSeconds?: number;
  isDark?: boolean;
  isArabic?: boolean;
  onExpire?: () => void;
  onExtend?: () => void;
  allowQuickTest?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds = 900, // 15 minutes = 900 seconds
  isDark = false,
  isArabic = false,
  onExpire,
  onExtend,
  allowQuickTest = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (!hasExpired) {
            setHasExpired(true);
            onExpire?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasExpired, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = secondsLeft < 180 && secondsLeft > 0; // under 3 minutes
  const isExpired = secondsLeft === 0;

  const handleResetTimer = () => {
    setSecondsLeft(900);
    setHasExpired(false);
    onExtend?.();
  };

  return (
    <div
      className={`w-full py-2.5 px-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all border shadow-sm ${
        isExpired
          ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300'
          : isUrgent
          ? isDark
            ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
            : 'bg-amber-50 border-amber-400 text-amber-900'
          : isDark
          ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
          : 'bg-[#FDF7F3] border-[#E8D4C5] text-temple-brown'
      }`}
    >
      <div className="flex items-center gap-2.5 text-start">
        <div
          className={`p-2 rounded-xl flex-shrink-0 ${
            isExpired
              ? 'bg-rose-600 text-white animate-bounce'
              : isUrgent
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-lantern-red/10 text-lantern-red'
          }`}
        >
          {isExpired ? (
            <AlertTriangle className="w-4 h-4" />
          ) : isUrgent ? (
            <ShieldAlert className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
        </div>
        <div>
          <p className="text-xs font-bold leading-tight font-display flex items-center gap-1.5">
            <span>
              {isExpired
                ? isArabic
                  ? 'انتهت صلاحية قفل الموعد'
                  : 'Inventory Hold Has Expired'
                : isArabic
                ? 'قفل الحجز الفوري نشط (١٥ دقيقة)'
                : '15-Minute Instant Hold Active'}
            </span>
          </p>
          <p className="text-[11px] opacity-75">
            {isExpired
              ? isArabic
                ? 'تم تحرير القاعة مؤقتاً. اضغط تمديد لتجديد القفل الفوري.'
                : 'Held slot released for other patrons. Extend hold to refresh.'
              : isArabic
              ? 'الأسعار وتوافر القاعة محجوزة حصرياً لك طوال هذه الجلسة'
              : 'Venue rate & inventory held exclusively for your booking session'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {allowQuickTest && (
          <button
            type="button"
            onClick={() => setSecondsLeft(5)}
            className="text-[10px] font-mono px-2 py-1 rounded bg-black/10 hover:bg-black/20 dark:bg-white/10"
            title="QA Test: Trigger expiration in 5s"
          >
            Test 5s
          </button>
        )}

        {isExpired ? (
          <button
            type="button"
            onClick={handleResetTimer}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-lantern-red hover:opacity-90 flex items-center gap-1.5 shadow-sm"
            style={{ backgroundColor: '#A13D2D' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تمديد الحجز' : 'Extend Hold'}</span>
          </button>
        ) : (
          <>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                isUrgent
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200'
                  : 'bg-lantern-red/15 text-lantern-red'
              }`}
            >
              {isArabic ? 'ينتهي خلال' : 'Expires in'}
            </span>
            <span
              className={`font-mono text-base font-extrabold tracking-wider px-2.5 py-1 rounded-lg ${
                isUrgent
                  ? 'bg-amber-500/20 text-amber-900 dark:text-amber-100'
                  : 'bg-black/10 dark:bg-black/30'
              }`}
            >
              {formattedTime}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

