import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Key,
  User,
  Shield,
  ChefHat,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Bike,
  Receipt,
  CalendarCheck,
  UserCheck,
} from 'lucide-react';
import { StaffRole } from '../../types';

export interface AddStaffFormData {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}

interface AddStaffFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isArabic: boolean;
  isDark: boolean;
  isInline?: boolean;
}

export const AddStaffForm: React.FC<AddStaffFormProps> = ({
  onSuccess,
  onCancel,
  isArabic,
  isDark,
  isInline = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('STAFF');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage(
        isArabic ? 'البريد الإلكتروني وكلمة المرور مطلوبان' : 'Email and password are required'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        isArabic
          ? 'يجب أن تتكون كلمة المرور من ٦ خانات على الأقل'
          : 'Password must be at least 6 characters long'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName || `${role} Staff`,
          email: trimmedEmail,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error ||
            (isArabic ? 'فشل إنشاء الحساب في قاعدة البيانات' : 'Failed to create user account in database')
        );
      } else {
        setSuccessMessage(
          isArabic
            ? `تم إنشاء حساب ${role} (${trimmedEmail}) بنجاح وتشفيره في PostgreSQL!`
            : `Successfully created ${role} account (${trimmedEmail}) and hashed password with bcrypt!`
        );
        setName('');
        setEmail('');
        setPassword('');
        setRole('STAFF');

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || (isArabic ? 'خطأ في الاتصال بالخادم' : 'Server connection error')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 transition-all ${
        isInline
          ? isDark
            ? 'bg-dark-surface border-dark-border'
            : 'bg-white border-[#EADBD0]'
          : isDark
          ? 'bg-[#1C1816] border-[#4A352A] text-[#FAF7F2]'
          : 'bg-white border-[#E8D9CD] text-[#2C2420]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lantern-red/10 text-lantern-red flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">
              {isArabic ? 'إضافة موظف / حساب جديد' : 'Add New Staff Member'}
            </h3>
            <p className="text-[11px] text-stone-gray">
              {isArabic
                ? 'تشفير كلمة المرور آلياً عبر Bcrypt (10 دورات) والتخزين في PostgreSQL'
                : 'Bcrypt hashed (10 rounds) & persisted to PostgreSQL database'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
          <Lock className="w-3 h-3" />
          <span>Bcrypt Enabled</span>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-stone-gray">
              {isArabic ? 'الاسم أو اللقب (اختياري)' : 'Full Name / Label (Optional)'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-stone-gray" />
              <input
                id="staff-form-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isArabic ? 'مثال: شيف أحمد - محطة البيتزا' : 'e.g. Chef Ahmed (Pizza Station)'}
                className={`w-full ps-9 pe-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-lantern-red transition-all ${
                  isDark
                    ? 'bg-[#120F0D] border-dark-border text-white placeholder:text-stone-600'
                    : 'bg-stone-50 border-[#E8D9CD] text-temple-brown placeholder:text-stone-400'
                }`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-stone-gray">
              {isArabic ? 'البريد الإلكتروني (مطلوب)' : 'Staff Email Address (Required)'}
              <span className="text-rose-500 ms-0.5">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-stone-gray" />
              <input
                id="staff-form-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@feastcraft.com"
                className={`w-full ps-9 pe-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-lantern-red transition-all ${
                  isDark
                    ? 'bg-[#120F0D] border-dark-border text-white placeholder:text-stone-600'
                    : 'bg-stone-50 border-[#E8D9CD] text-temple-brown placeholder:text-stone-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Role Selector & Password Row */}
        <div>
          <label className="block text-xs font-bold mb-1.5 text-stone-gray">
            {isArabic ? 'نوع الصلاحية ومحطة العمل' : 'Staff Role & Assigned Station'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'ADMIN' as const,
                label: 'ADMIN',
                descEn: 'Full system & CMS',
                descAr: 'تحكم شامل بالكامل',
                icon: Shield,
                color: 'text-lantern-red',
                activeBorder: 'border-lantern-red bg-lantern-red/10 ring-2 ring-lantern-red/30',
              },
              {
                id: 'CASHIER' as const,
                label: 'CASHIER',
                descEn: 'POS & Counter billing',
                descAr: 'الكاشير وتحصيل الفواتير',
                icon: Receipt,
                color: 'text-emerald-600 dark:text-emerald-400',
                activeBorder: 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30',
              },
              {
                id: 'KITCHEN' as const,
                label: 'KITCHEN',
                descEn: 'Chef KDS tickets',
                descAr: 'شيف المطبخ وشاشة KDS',
                icon: ChefHat,
                color: 'text-amber-600 dark:text-amber-400',
                activeBorder: 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30',
              },
              {
                id: 'DELIVERY' as const,
                label: 'DELIVERY',
                descEn: 'Couriers & Dispatch',
                descAr: 'فريق التوصيل والسائقين',
                icon: Bike,
                color: 'text-blue-600 dark:text-blue-400',
                activeBorder: 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30',
              },
              {
                id: 'RESERVATION' as const,
                label: 'RESERVATION',
                descEn: 'Bookings & Tables',
                descAr: 'فريق الحجوزات وتنظيم الصالة',
                icon: CalendarCheck,
                color: 'text-purple-600 dark:text-purple-400',
                activeBorder: 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30',
              },
              {
                id: 'STAFF' as const,
                label: 'STAFF',
                descEn: 'General Floor Staff',
                descAr: 'طاقم الصالة والعمليات',
                icon: UserCheck,
                color: 'text-slate-600 dark:text-slate-400',
                activeBorder: 'border-slate-500 bg-slate-500/10 ring-2 ring-slate-500/30',
              },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                    role === r.id
                      ? r.activeBorder
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className={`flex items-center gap-1.5 font-bold text-xs ${r.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{r.label}</span>
                  </div>
                  <div className="text-[10px] text-stone-gray mt-0.5 line-clamp-1">
                    {isArabic ? r.descAr : r.descEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold mb-1.5 text-stone-gray">
            {isArabic ? 'كلمة المرور (تُشفر آلياً بـ Bcrypt)' : 'Password (Auto Bcrypt Hashed)'}
            <span className="text-rose-500 ms-0.5">*</span>
          </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-stone-gray" />
              <input
                id="staff-form-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full ps-9 pe-10 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-lantern-red transition-all ${
                  isDark
                    ? 'bg-[#120F0D] border-dark-border text-white placeholder:text-stone-600'
                    : 'bg-stone-50 border-[#E8D9CD] text-temple-brown placeholder:text-stone-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-gray hover:text-black dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-stone-gray">
              <span>{isArabic ? '٦ خانات كحد أدنى' : 'Min 6 characters'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">10 Salt Rounds</span>
            </div>
          </div>

        {/* Submit Actions */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/10 dark:border-white/10">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-gray hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
          )}

          <button
            id="staff-form-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-lantern-red hover:bg-[#8B3426] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isArabic ? 'جاري التشفير والحفظ...' : 'Hashing & Saving...'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>
                  {isArabic
                    ? role === 'STAFF'
                      ? 'إضافة حساب الموظف'
                      : 'إضافة حساب المسؤول'
                    : `Create ${role} Account`}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaffForm;
