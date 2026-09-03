'use client';

import React, { useState } from 'react';
import { Lock, Mail, Shield, AlertCircle, ChefHat, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface AdminLoginPageProps {
  onSuccess?: (user: any) => void;
  callbackUrl?: string;
  isArabic?: boolean;
}

export default function AdminLoginPage({
  onSuccess,
  callbackUrl = '/',
  isArabic = false,
}: AdminLoginPageProps) {
  const [email, setEmail] = useState('admin@cyberdev.me');
  const [password, setPassword] = useState('ChefOmar@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your administrative credentials.');
      }

      setSuccessMessage(
        isArabic
          ? 'تم التحقق بنجاح. جاري الدخول للوحة التحكم...'
          : 'Authenticated successfully. Redirecting to Executive Portal...'
      );

      if (onSuccess) {
        onSuccess(data.user);
      } else {
        // Redirect to callback URL or root
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div
      id="admin-login-page"
      className="min-h-screen w-full bg-[#1C1816] text-[#FAF7F2] flex flex-col justify-center items-center p-4 sm:p-6"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(161, 61, 45, 0.15) 0%, rgba(28, 24, 22, 1) 70%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#A13D2D] text-white shadow-xl shadow-[#A13D2D]/30 mb-4 border border-[#FAF7F2]/10">
            <ChefHat className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-[#FAF7F2]">
            {isArabic ? 'بوابة إدارة فيست كرافت' : 'FeastCraft Staff & Admin Portal'}
          </h1>
          <p className="text-sm text-[#FAF7F2]/60 mt-1">
            {isArabic
              ? 'نظام التوثيق الآمن للعمليات وإدارة المطبخ'
              : 'Self-Hosted Operational & Kitchen Management System'}
          </p>
        </div>

        {/* Credentials Form Box */}
        <div className="bg-[#26201D] border border-[#4A352A]/60 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A13D2D] via-[#D97706] to-[#A13D2D]" />

          <div className="flex items-center justify-between pb-5 border-b border-[#4A352A]/40 mb-6">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#A13D2D]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FAF7F2]/80">
                {isArabic ? 'تسجيل دخول موظفين معتمد' : 'Authorized Personnel Only'}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF7F2]/10 text-[#FAF7F2]/60">
              RBAC v2.4
            </span>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium text-[#FAF7F2]/80 mb-1.5 uppercase tracking-wider"
              >
                {isArabic ? 'البريد الإلكتروني الإداري' : 'Administrative Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAF7F2]/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cyberdev.me"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#1C1816] border border-[#4A352A] rounded-xl text-sm text-[#FAF7F2] placeholder-[#FAF7F2]/30 focus:outline-none focus:ring-2 focus:ring-[#A13D2D] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-[#FAF7F2]/80 mb-1.5 uppercase tracking-wider"
              >
                {isArabic ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAF7F2]/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#1C1816] border border-[#4A352A] rounded-xl text-sm text-[#FAF7F2] placeholder-[#FAF7F2]/30 focus:outline-none focus:ring-2 focus:ring-[#A13D2D] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#FAF7F2]/40 hover:text-[#FAF7F2] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="admin-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#A13D2D] hover:bg-[#8D3325] active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-lg shadow-[#A13D2D]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isArabic ? 'تسجيل الدخول للنظام' : 'Authenticate & Enter Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Fillers for Demo / Local Test */}
          <div className="mt-6 pt-5 border-t border-[#4A352A]/40">
            <div className="text-[11px] font-medium text-[#FAF7F2]/50 uppercase tracking-wider mb-2.5">
              {isArabic ? 'حسابات تجريبية سريعة:' : 'Quick Pre-Seeded Accounts:'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@cyberdev.me', 'ChefOmar@2026!')}
                className="text-left p-2 rounded-lg bg-[#1C1816]/70 hover:bg-[#1C1816] border border-[#4A352A]/50 text-[11px] transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-[#FAF7F2] group-hover:text-[#A13D2D]">Chef Omar</div>
                <div className="text-[#FAF7F2]/40 text-[10px]">Role: ADMIN</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('staff@cyberdev.me', 'Staff@FeastCraft2026!')}
                className="text-left p-2 rounded-lg bg-[#1C1816]/70 hover:bg-[#1C1816] border border-[#4A352A]/50 text-[11px] transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-[#FAF7F2] group-hover:text-[#A13D2D]">Kitchen KDS</div>
                <div className="text-[#FAF7F2]/40 text-[10px]">Role: STAFF</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice Footer */}
        <div className="text-center mt-6 text-[11px] text-[#FAF7F2]/40 space-y-1">
          <p>FeastCraft Fast-Casual • Self-Hosted Authentication Engine</p>
          <p>Protected by Bcrypt Password Hashing & Signed JWT HttpOnly Cookies</p>
        </div>
      </div>
    </div>
  );
}
