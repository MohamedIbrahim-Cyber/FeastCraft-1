import React, { useState } from 'react';
import { CreditCard, Smartphone, Upload, CheckCircle2, ShieldCheck, Loader2, X, Lock, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface PaymobModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositAmount: number;
  currency?: string;
  onPaymentSuccess: (method: 'paymob_card' | 'paymob_wallet' | 'instapay', refNumber: string) => void;
  isDark?: boolean;
  isArabic?: boolean;
}

export const PaymobModal: React.FC<PaymobModalProps> = ({
  isOpen,
  onClose,
  depositAmount,
  currency = 'EGP',
  onPaymentSuccess,
  isDark = false,
  isArabic = false,
}) => {
  const [activeTab, setActiveTab] = useState<'paymob_card' | 'paymob_wallet' | 'instapay'>('paymob_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedRef, setGeneratedRef] = useState<string>('');

  // Card form state
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 4444');
  const [cardHolder, setCardHolder] = useState('Karim El-Mansoury');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');

  // InstaPay receipt state
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [instapayRef, setInstapayRef] = useState('IP-EG-792834');

  const containerRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose,
  });

  const formatCurrency = (val: number) => `${val.toLocaleString()} ${isArabic ? 'ج.م' : currency}`;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    const ref = `PM-${Date.now().toString().slice(-6)}`;
    setGeneratedRef(ref);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(activeTab, ref);
        onClose();
      }, 1200);
    } catch (e) {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedReceipt(e.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paymob-modal-title"
          aria-describedby="paymob-modal-desc"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={containerRef}
            tabIndex={-1}
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`w-full max-w-xl rounded-[32px] border p-6 sm:p-8 shadow-2xl relative text-start outline-none my-auto ${
              isDark
                ? 'bg-[#2D201A] border-dark-border text-evening-cream'
                : 'bg-[#FAF5F0] border-[#DEC7B7] text-temple-brown'
            }`}
          >
            {/* Close Button with 44x44px target */}
            <button
              type="button"
              onClick={onClose}
              aria-label={isArabic ? 'إغلاق نافذة الدفع' : 'Close payment gateway modal'}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-stone-gray hover:text-lantern-red hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gateway Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-black/10 dark:border-white/10 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-lantern-red text-white flex items-center justify-center font-extrabold font-display shadow-md">
                P
              </div>
              <div>
                <h3 id="paymob-modal-title" className="text-base sm:text-lg font-bold font-display">
                  {isArabic ? 'بوابة الدفع الآمنة (Paymob 3D-Secure)' : 'Paymob 3D-Secure Checkout Portal'}
                </h3>
                <p id="paymob-modal-desc" className="text-xs text-stone-gray">
                  {isArabic ? 'التاجر المعتمد: مجموعة فيست كرافت للضيافة' : 'Authorized Merchant: FeastCraft Hospitality'}
                </p>
              </div>
            </div>

            {/* Deposit Amount Banner */}
            <div className="p-3.5 rounded-2xl bg-lantern-red/10 border border-lantern-red/20 flex items-center justify-between mb-5">
              <span className="text-xs font-semibold text-stone-gray">
                {isArabic ? 'الدفعة الأولى للتثبيت (٣٠٪):' : 'Instant Hold Deposit (30%):'}
              </span>
              <span className="text-base sm:text-lg font-extrabold font-mono text-lantern-red">
                {formatCurrency(depositAmount)}
              </span>
            </div>

            {/* Gateway Tabs */}
            <div className="flex rounded-2xl p-1 bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 mb-5 gap-1">
              {[
                { id: 'paymob_card', labelEn: 'Credit Card', labelAr: 'بطاقة بنكية', icon: CreditCard },
                { id: 'paymob_wallet', labelEn: 'E-Wallet (Vodafone)', labelAr: 'المحفظة الذكية', icon: Smartphone },
                { id: 'instapay', labelEn: 'InstaPay Receipt', labelAr: 'إيصال إنستاباي', icon: Upload },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
                      isActive
                        ? 'bg-lantern-red text-white shadow-md'
                        : 'text-stone-gray hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{isArabic ? tab.labelAr : tab.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Paymob Card Form */}
            {activeTab === 'paymob_card' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-gray block">
                    {isArabic ? 'رقم البطاقة الائتمانية' : 'Card Number'}
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:border-lantern-red dark:bg-dark-surface-elevated"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-gray block">
                      {isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:border-lantern-red dark:bg-dark-surface-elevated"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-gray block">
                      {isArabic ? 'رمز الأمان (CVV)' : 'CVV / CVC'}
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:border-lantern-red dark:bg-dark-surface-elevated"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-gray block">
                    {isArabic ? 'اسم حامل البطاقة' : 'Cardholder Name'}
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-lantern-red dark:bg-dark-surface-elevated"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Mobile Wallet */}
            {activeTab === 'paymob_wallet' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                  {isArabic
                    ? 'أدخل رقم هاتفك المسجل في محفظة فودافون كاش أو أورانج أو إي آند كاش لتأكيد السداد عبر طلب USSD.'
                    : 'Enter your Vodafone Cash, Orange Money, or e& Cash mobile number to receive the instant USSD payment prompt.'}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-gray block">
                    {isArabic ? 'رقم المحفظة الإلكترونية' : 'Mobile Wallet Number'}
                  </label>
                  <input
                    type="tel"
                    defaultValue="+20 100 293 8472"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:border-lantern-red dark:bg-dark-surface-elevated"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: InstaPay Direct Upload */}
            {activeTab === 'instapay' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-gray">{isArabic ? 'معرف إنستاباي المعتمد (IPA):' : 'FeastCraft IPA Handle:'}</span>
                    <span className="font-mono font-bold text-lantern-red">feastcraft@instapay</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-gray">{isArabic ? 'الحساب البنكي (CIB):' : 'Bank Account (CIB Egypt):'}</span>
                    <span className="font-mono font-bold">1000 4829 1049 2011</span>
                  </div>
                </div>

                {/* Drag-and-Drop / Manual Selection Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-colors ${
                    isDragging
                      ? 'border-lantern-red bg-lantern-red/10'
                      : 'border-stone-gray/30 hover:border-lantern-red/50 bg-black/5 dark:bg-white/5'
                  }`}
                >
                  <input
                    type="file"
                    id="receipt-file-input"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <label htmlFor="receipt-file-input" className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 text-lantern-red mx-auto" />
                    <div>
                      <span className="text-xs font-bold text-lantern-red">
                        {isArabic ? 'انقر لرفع إيصال التحويل أو اسحب الملف هنا' : 'Click to select receipt or drag & drop'}
                      </span>
                      <p className="text-[10px] text-stone-gray mt-0.5">PNG, JPG, or PDF up to 10MB</p>
                    </div>
                  </label>

                  {uploadedReceipt && (
                    <div className="mt-3 p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isArabic ? 'تم تحميل الإيصال بنجاح' : 'Receipt uploaded & verified'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-gray block">
                    {isArabic ? 'الرقم المرجعي للتحويل (Reference #)' : 'InstaPay Transaction Reference'}
                  </label>
                  <input
                    type="text"
                    value={instapayRef}
                    onChange={(e) => setInstapayRef(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:border-lantern-red dark:bg-dark-surface-elevated"
                  />
                </div>
              </div>
            )}

            {/* Bottom Submit Action */}
            <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm text-white bg-lantern-red hover:opacity-95 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: '#A13D2D' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isArabic ? 'جاري توثيق العملية عبر البنك...' : 'Authorizing 3D-Secure Transaction...'}</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{isArabic ? 'تم تأكيد الدفع بنجاح!' : 'Deposit Authorized Successfully!'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {activeTab === 'instapay'
                        ? isArabic
                          ? 'تأكيد إيصال التحويل وحجز الموعد'
                          : `Submit Voucher (${formatCurrency(depositAmount)})`
                        : isArabic
                        ? `سداد الدفعة الآن (${formatCurrency(depositAmount)})`
                        : `Authorize Payment (${formatCurrency(depositAmount)})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
