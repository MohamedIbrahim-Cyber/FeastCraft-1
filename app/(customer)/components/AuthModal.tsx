'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, AlertCircle, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  onContinueAsGuest?: () => void;
  allowGuest?: boolean;
  isArabic?: boolean;
  initialMode?: 'signin' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  onContinueAsGuest,
  allowGuest = true,
  isArabic = false,
  initialMode = 'signin',
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('karim@mansour.com');
  const [phone, setPhone] = useState('+20 100 293 8472');
  const [password, setPassword] = useState('Customer@2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailOrPhone: emailOrPhone.trim(),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Unable to sign in. Please verify your email/phone and password.');
        }

        setSuccessMessage(isArabic ? 'تم تسجيل الدخول بنجاح!' : 'Signed in successfully!');
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
        }, 400);
      } else {
        // Register mode
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: emailOrPhone.includes('@') ? emailOrPhone.trim() : undefined,
            phone: phone.trim() || (!emailOrPhone.includes('@') ? emailOrPhone.trim() : undefined),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create account. Please try again.');
        }

        setSuccessMessage(isArabic ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
        }, 400);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="customer-auth-modal"
        className="w-full max-w-md bg-[#FAF7F2] dark:bg-[#1C1816] text-[#2C2420] dark:text-[#FAF7F2] rounded-2xl shadow-2xl border border-[#4A352A]/20 dark:border-[#4A352A]/50 overflow-hidden relative"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-[#4A352A]/10 dark:border-[#4A352A]/40 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#2C2420] dark:text-[#FAF7F2]">
              {mode === 'signin'
                ? isArabic
                  ? 'تسجيل الدخول'
                  : 'Welcome Back'
                : isArabic
                ? 'إنشاء حساب جديد'
                : 'Join FeastCraft'}
            </h2>
            <p className="text-xs text-[#7A6B63] dark:text-[#FAF7F2]/60 mt-0.5">
              {mode === 'signin'
                ? isArabic
                  ? 'سجل دخولك لمتابعة طلباتك والعروض الحصرية'
                  : 'Sign in to track orders & save delivery addresses'
                : isArabic
                ? 'أنشئ حسابك للاستمتاع بتجربة طلب سلسة'
                : 'Create your account for faster checkout and reordering'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A6B63] dark:text-[#FAF7F2]/60 hover:bg-[#4A352A]/10 dark:hover:bg-[#FAF7F2]/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="p-5 pt-4">
          <div className="flex bg-[#EFE9DF] dark:bg-[#26201D] p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white dark:bg-[#A13D2D] text-[#2C2420] dark:text-white shadow-sm'
                  : 'text-[#7A6B63] dark:text-[#FAF7F2]/60 hover:text-[#2C2420]'
              }`}
            >
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#A13D2D] text-[#2C2420] dark:text-white shadow-sm'
                  : 'text-[#7A6B63] dark:text-[#FAF7F2]/60 hover:text-[#2C2420]'
              }`}
            >
              {isArabic ? 'حساب جديد' : 'Create Account'}
            </button>
          </div>

          {/* Feedback */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#7A6B63] dark:text-[#FAF7F2]/70 mb-1">
                  {isArabic ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7A6B63]/60 dark:text-[#FAF7F2]/40">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isArabic ? 'كريم منصور' : 'Karim Mansour'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#1C1816] border border-[#4A352A]/20 dark:border-[#4A352A] rounded-xl text-sm focus:ring-2 focus:ring-[#A13D2D] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#7A6B63] dark:text-[#FAF7F2]/70 mb-1">
                {isArabic ? 'البريد الإلكتروني أو الهاتف' : 'Email or Mobile Phone'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7A6B63]/60 dark:text-[#FAF7F2]/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="karim@mansour.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#1C1816] border border-[#4A352A]/20 dark:border-[#4A352A] rounded-xl text-sm focus:ring-2 focus:ring-[#A13D2D] focus:outline-none"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#7A6B63] dark:text-[#FAF7F2]/70 mb-1">
                  {isArabic ? 'رقم الهاتف للتوصيل' : 'Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7A6B63]/60 dark:text-[#FAF7F2]/40">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 293 8472"
                    className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#1C1816] border border-[#4A352A]/20 dark:border-[#4A352A] rounded-xl text-sm focus:ring-2 focus:ring-[#A13D2D] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#7A6B63] dark:text-[#FAF7F2]/70 mb-1">
                {isArabic ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7A6B63]/60 dark:text-[#FAF7F2]/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#1C1816] border border-[#4A352A]/20 dark:border-[#4A352A] rounded-xl text-sm focus:ring-2 focus:ring-[#A13D2D] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#A13D2D] hover:bg-[#8D3325] text-white font-medium text-sm rounded-xl shadow-lg shadow-[#A13D2D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin'
                      ? isArabic
                        ? 'تسجيل الدخول'
                        : 'Sign In'
                      : isArabic
                      ? 'إنشاء الحساب'
                      : 'Create Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest Checkout Option */}
          {allowGuest && onContinueAsGuest && (
            <div className="mt-4 pt-4 border-t border-[#4A352A]/10 dark:border-[#4A352A]/40 text-center">
              <button
                type="button"
                onClick={() => {
                  onContinueAsGuest();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-transparent hover:bg-[#4A352A]/5 dark:hover:bg-[#FAF7F2]/5 border border-dashed border-[#4A352A]/30 text-xs font-semibold text-[#4A352A] dark:text-[#FAF7F2]/80 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#A13D2D]" />
                <span>
                  {isArabic
                    ? 'المتابعة كضيف بدون تسجيل حساب'
                    : 'Continue as Guest (No Account Needed)'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
