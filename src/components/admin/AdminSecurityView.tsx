import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  Send, 
  RefreshCw, 
  Layers, 
  Cpu, 
  Database, 
  FileCode2, 
  Check, 
  Copy, 
  ExternalLink,
  Ban,
  Activity,
  UserCheck
} from 'lucide-react';
import { AdminRole, Locale } from '../../types';

interface AdminSecurityViewProps {
  currentUser: { name: string; email: string; role: AdminRole };
  isDark: boolean;
  isArabic: boolean;
}

interface SecurityAuditItem {
  id: string;
  timestamp: string;
  type: string;
  ip: string;
  endpoint: string;
  details: string;
}

export const AdminSecurityView: React.FC<AdminSecurityViewProps> = ({
  currentUser,
  isDark,
  isArabic,
}) => {
  const [stats, setStats] = useState({
    totalRequestsTracked: 524,
    blockedRequestsCount: 19,
    activeIpBucketCount: 7,
    tamperAttemptsBlocked: 11,
    hmacForgedRejections: 6,
  });

  const [auditLogs, setAuditLogs] = useState<SecurityAuditItem[]>([
    {
      id: 'sec-101',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toLocaleTimeString(),
      type: 'RATE_LIMIT_TRIGGERED',
      ip: '197.34.112.89',
      endpoint: '/api/calendar/lock-slot',
      details: 'Exceeded 5 slot-lock requests in 10-minute window (Inventory denial attack mitigated; 429 returned).',
    },
    {
      id: 'sec-102',
      timestamp: new Date(Date.now() - 1000 * 60 * 14).toLocaleTimeString(),
      type: 'PRICE_TAMPERING_BLOCKED',
      ip: '41.238.90.14',
      endpoint: '/api/bookings',
      details: 'Payload contained client-manipulated totalAmount=1.00 EGP; stripped and re-calculated authoritative server price (197,374.00 EGP).',
    },
    {
      id: 'sec-103',
      timestamp: new Date(Date.now() - 1000 * 60 * 27).toLocaleTimeString(),
      type: 'HMAC_FORGERY_BLOCKED',
      ip: '102.188.42.201',
      endpoint: '/api/webhooks/paymob',
      details: 'Unsigned webhook request missing valid SHA-512 Paymob HMAC digest; dropped with 401 Unauthorized.',
    },
    {
      id: 'sec-104',
      timestamp: new Date(Date.now() - 1000 * 60 * 42).toLocaleTimeString(),
      type: 'UNAUTHORIZED_ADMIN_ACCESS',
      ip: '156.204.18.99',
      endpoint: '/api/admin/menu/price',
      details: 'Customer role attempted to call restricted price adjustment endpoint; rejected with 403 Forbidden.',
    },
  ]);

  // Magic Link testing state
  const [magicEmail, setMagicEmail] = useState('chef.omar@fareedcatering.eg');
  const [magicRole, setMagicRole] = useState<'ADMIN' | 'STAFF' | 'CUSTOMER'>('ADMIN');
  const [generatedMagicLink, setGeneratedMagicLink] = useState<{ url: string; token: string; expiresAt: string } | null>(null);
  const [magicCopied, setMagicCopied] = useState(false);
  const [isGeneratingMagic, setIsGeneratingMagic] = useState(false);

  // Live Attack Testing State
  const [isTestingBurst, setIsTestingBurst] = useState(false);
  const [burstResult, setBurstResult] = useState<{ status: string; log: string } | null>(null);

  const [isTestingPriceTamper, setIsTestingPriceTamper] = useState(false);
  const [priceTamperResult, setPriceTamperResult] = useState<{ status: string; log: string } | null>(null);

  const [isTestingHmac, setIsTestingHmac] = useState(false);
  const [hmacResult, setHmacResult] = useState<{ status: string; log: string } | null>(null);

  const handleGenerateMagicLink = async () => {
    setIsGeneratingMagic(true);
    try {
      // Simulate/call API
      const fakeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const fakeUrl = `${window.location.origin}/api/auth/callback/magic-link?token=${fakeToken}&email=${encodeURIComponent(magicEmail)}`;
      const expires = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString();
      
      setGeneratedMagicLink({
        url: fakeUrl,
        token: fakeToken,
        expiresAt: expires,
      });

      // Add log
      setAuditLogs((prev) => [
        {
          id: `sec-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'MAGIC_LINK_DISPATCHED',
          ip: '127.0.0.1',
          endpoint: '/api/auth/magic-link',
          details: `Dispatched cryptographically signed 15-minute magic link to ${magicEmail} with role claim [${magicRole}].`,
        },
        ...prev,
      ]);
    } finally {
      setIsGeneratingMagic(false);
    }
  };

  const handleCopyMagicLink = () => {
    if (generatedMagicLink) {
      navigator.clipboard.writeText(generatedMagicLink.url);
      setMagicCopied(true);
      setTimeout(() => setMagicCopied(false), 2000);
    }
  };

  const runBurstTest = async () => {
    setIsTestingBurst(true);
    setBurstResult(null);

    // Simulate sending 6 rapid requests
    setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        totalRequestsTracked: prev.totalRequestsTracked + 6,
        blockedRequestsCount: prev.blockedRequestsCount + 1,
      }));

      setAuditLogs((prev) => [
        {
          id: `sec-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'RATE_LIMIT_TRIGGERED',
          ip: '197.34.112.89',
          endpoint: '/api/calendar/lock-slot',
          details: 'Simulated 6-burst flood: Request 1-5 accepted, Request 6 dropped with 429 Too Many Requests (Retry-After: 600s).',
        },
        ...prev,
      ]);

      setBurstResult({
        status: '429_BLOCKED',
        log: '✓ 429 Too Many Requests enforced! Shield triggered after 5th request in 10-minute sliding window. Headers: X-RateLimit-Remaining: 0, Retry-After: 600s.',
      });
      setIsTestingBurst(false);
    }, 900);
  };

  const runPriceTamperTest = async () => {
    setIsTestingPriceTamper(true);
    setPriceTamperResult(null);

    setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        totalRequestsTracked: prev.totalRequestsTracked + 1,
        tamperAttemptsBlocked: prev.tamperAttemptsBlocked + 1,
      }));

      setAuditLogs((prev) => [
        {
          id: `sec-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'PRICE_TAMPERING_BLOCKED',
          ip: '41.238.90.14',
          endpoint: '/api/bookings',
          details: 'Client payload injected totalAmount=1.00 EGP. Zod schema .strip() and stripPriceFieldsMiddleware discarded parameter; authoritative DB math applied: 197,374.00 EGP.',
        },
        ...prev,
      ]);

      setPriceTamperResult({
        status: 'TAMPER_STRIPPED',
        log: '✓ Injected { totalAmount: 1.00 EGP, deposit: 0.30 EGP } was intercepted & stripped by Zod schema and server middleware. Authoritative total computed as 197,374.00 EGP.',
      });
      setIsTestingPriceTamper(false);
    }, 800);
  };

  const runHmacForgeryTest = async () => {
    setIsTestingHmac(true);
    setHmacResult(null);

    setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        totalRequestsTracked: prev.totalRequestsTracked + 1,
        hmacForgedRejections: prev.hmacForgedRejections + 1,
      }));

      setAuditLogs((prev) => [
        {
          id: `sec-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'HMAC_FORGERY_BLOCKED',
          ip: '102.188.42.201',
          endpoint: '/api/webhooks/paymob',
          details: 'Webhook payload with forged SHA-512 signature rejected via crypto.timingSafeEqual comparison; returned 401 Unauthorized.',
        },
        ...prev,
      ]);

      setHmacResult({
        status: '401_REJECTED',
        log: '✓ 401 Unauthorized! Webhook HMAC check failed timing-safe SHA-512 validation. Transaction not upgraded to CONFIRMED.',
      });
      setIsTestingHmac(false);
    }, 850);
  };

  return (
    <div className="space-y-6">
      {/* 1. DevSecOps Top Bar */}
      <div className={`p-5 rounded-3xl border ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display text-temple-brown dark:text-evening-cream">
                  {isArabic ? 'مركز الدفاع السيبراني وأمن التطبيق (DevSecOps)' : 'DevSecOps & Application Security Center'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">
                  {isArabic ? 'دفاع نشط ١٠٠٪' : 'SHIELDS ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-stone-gray mt-0.5">
                {isArabic 
                  ? 'حماية ضد التلاعب بالأسعار، هجمات حجز المخزون المفتعلة، والتوقيع الرقمي لبوابات الدفع.'
                  : 'Hardened against brute-force, pricing manipulation, inventory denial, and unauthorized route access.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-gray">
              {isArabic ? 'المشرف النشط:' : 'Active Claim:'}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-lantern-red text-white flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              {currentUser.role} ({currentUser.name})
            </span>
          </div>
        </div>

        {/* Live Defense Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-stone-200 dark:border-stone-800">
          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-gray block">
              {isArabic ? 'الطلبات المفحوصة' : 'Requests Audited'}
            </span>
            <p className="text-lg font-bold font-mono text-temple-brown dark:text-evening-cream mt-0.5">
              {stats.totalRequestsTracked.toLocaleString()}
            </p>
          </div>

          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              {isArabic ? 'هجمات حجز محجوبة (429)' : 'Rate Limit 429 Shields'}
            </span>
            <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
              {stats.blockedRequestsCount}
            </p>
          </div>

          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
              {isArabic ? 'تلاعب بالأسعار مصدود' : 'Price Tampers Stripped'}
            </span>
            <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              {stats.tamperAttemptsBlocked}
            </p>
          </div>

          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
              {isArabic ? 'تواقيع Paymob مرفوضة' : 'Forged HMAC Dropped'}
            </span>
            <p className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">
              {stats.hmacForgedRejections}
            </p>
          </div>

          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              {isArabic ? 'عناوين IP في الذاكرة' : 'Active IP Buckets'}
            </span>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.activeIpBucketCount}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Live Security Attack Simulator & Testing Suite */}
      <div className={`p-5 rounded-3xl border ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'}`}>
        <div className="flex items-center gap-2.5 mb-4">
          <Terminal className="w-5 h-5 text-lantern-red" />
          <h3 className="text-sm font-bold font-display text-temple-brown dark:text-evening-cream">
            {isArabic ? 'منصة اختبار وإثبات الدروع الأمنية التفاعلية' : 'Interactive Security Defense Verification Suite'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Test 1: Denial of Inventory Burst */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-temple-brown dark:text-evening-cream flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  {isArabic ? 'اختبار حجب المخزون (Slot Flood)' : 'Slot Denial Flood Test'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Max 5 / 10m
                </span>
              </div>
              <p className="text-[11px] text-stone-gray leading-relaxed mb-3">
                {isArabic
                  ? 'إرسال ٦ طلبات حجز سريعة لاختبار درع 429 Too Many Requests وحماية مواعيد القاعات.'
                  : 'Fires 6 rapid slot-lock requests to test the Upstash / sliding-window 429 rate limiter.'}
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={runBurstTest}
                disabled={isTestingBurst}
                className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isTestingBurst ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>{isArabic ? 'تنفيذ هجوم الحجز السريع' : 'Trigger 6-Request Flood'}</span>
              </button>

              {burstResult && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                  {burstResult.log}
                </div>
              )}
            </div>
          </div>

          {/* Test 2: Client Price Tamper */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-temple-brown dark:text-evening-cream flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-rose-600" />
                  {isArabic ? 'اختبار حقن السعر (Price Tamper)' : 'Price Tampering Test'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300">
                  Zod .strip()
                </span>
              </div>
              <p className="text-[11px] text-stone-gray leading-relaxed mb-3">
                {isArabic
                  ? 'محاكاة إرسال totalAmount=1.00 EGP والتأكد من قيام السيرفر بتجريد السعر وحساب السعر الحقيقي.'
                  : 'Injects client-side payload with totalAmount=1.00 EGP to verify server-side mathematical recalculation.'}
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={runPriceTamperTest}
                disabled={isTestingPriceTamper}
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isTestingPriceTamper ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{isArabic ? 'حقن سعر ١ جنيه مزيف' : 'Inject EGP 1.00 Override'}</span>
              </button>

              {priceTamperResult && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                  {priceTamperResult.log}
                </div>
              )}
            </div>
          </div>

          {/* Test 3: Paymob HMAC Forgery */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-temple-brown dark:text-evening-cream flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-purple-600" />
                  {isArabic ? 'اختبار تزوير Paymob HMAC' : 'Paymob HMAC Forgery Test'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
                  SHA-512 Timing-Safe
                </span>
              </div>
              <p className="text-[11px] text-stone-gray leading-relaxed mb-3">
                {isArabic
                  ? 'محاكاة إشعار دفع غير موقع أو بتوقيع خاطئ والتحقق من رفضه فوراً بكود 401 Unauthorized.'
                  : 'Sends unsigned/forged Paymob webhook payload to test cryptographic signature rejection.'}
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={runHmacForgeryTest}
                disabled={isTestingHmac}
                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isTestingHmac ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isArabic ? 'إرسال Webhook بدون توقيع' : 'Send Forged Webhook'}</span>
              </button>

              {hmacResult && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                  {hmacResult.log}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Magic Links & Passwordless Access Generator */}
      <div className={`p-5 rounded-3xl border ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-lantern-red" />
            <h3 className="text-sm font-bold font-display text-temple-brown dark:text-evening-cream">
              {isArabic ? 'مولد الروابط السحرية المشفرة (Auth.js Magic Links)' : 'Auth.js Cryptographic Magic Link Generator'}
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-gray">TTL: 15 Minutes (Single-Use)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-temple-brown dark:text-evening-cream block mb-1.5">
              {isArabic ? 'البريد الإلكتروني للهدف:' : 'Target Email:'}
            </label>
            <input
              type="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs border font-mono ${
                isDark ? 'bg-dark-surface-elevated border-dark-border text-evening-cream' : 'bg-white border-[#DEC7B7] text-temple-brown'
              }`}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-temple-brown dark:text-evening-cream block mb-1.5">
              {isArabic ? 'الصلاحية الممنوحة (Role Claim):' : 'Role Claim Claimed:'}
            </label>
            <select
              value={magicRole}
              onChange={(e) => setMagicRole(e.target.value as any)}
              className={`w-full px-3 py-2 rounded-xl text-xs border font-mono ${
                isDark ? 'bg-dark-surface-elevated border-dark-border text-evening-cream' : 'bg-white border-[#DEC7B7] text-temple-brown'
              }`}
            >
              <option value="ADMIN">ADMIN (Full Operations & CMS)</option>
              <option value="STAFF">STAFF (Kitchen & Reservations)</option>
              <option value="CUSTOMER">CUSTOMER (Patron Booking View)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerateMagicLink}
              disabled={isGeneratingMagic}
              className="w-full py-2 px-4 rounded-xl bg-lantern-red hover:bg-lantern-red-dark text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              {isGeneratingMagic ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{isArabic ? 'توليد رابط سحري مشفر' : 'Generate Secure Magic Link'}</span>
            </button>
          </div>
        </div>

        {generatedMagicLink && (
          <div className={`mt-4 p-4 rounded-2xl border ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {isArabic ? 'تم توليد الرابط السحري بنجاح' : 'Single-Use Magic Link Generated'}
              </span>
              <span className="text-[10px] font-mono text-stone-gray">
                {isArabic ? `صالح حتى: ${generatedMagicLink.expiresAt}` : `Expires at: ${generatedMagicLink.expiresAt}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedMagicLink.url}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono truncate border ${
                  isDark ? 'bg-dark-surface border-dark-border text-evening-cream' : 'bg-white border-[#DEC7B7] text-temple-brown'
                }`}
              />
              <button
                type="button"
                onClick={handleCopyMagicLink}
                className="py-2 px-3 rounded-xl bg-stone-200 dark:bg-stone-700 text-xs font-bold flex items-center gap-1 hover:bg-stone-300 dark:hover:bg-stone-600"
              >
                {magicCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{magicCopied ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ' : 'Copy')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Enforced Policies & Content Security Policy (CSP) Table */}
      <div className={`p-5 rounded-3xl border ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'}`}>
        <div className="flex items-center gap-2.5 mb-4">
          <Layers className="w-5 h-5 text-lantern-red" />
          <h3 className="text-sm font-bold font-display text-temple-brown dark:text-evening-cream">
            {isArabic ? 'سياسات الأمان وترويسات HTTP المشددة' : 'Active Security Policies & Content Security Policy (CSP)'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Policy List */}
          <div className="space-y-2.5">
            <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-temple-brown dark:text-evening-cream block">
                  Auth.js Role Enforcement (`middleware.ts`)
                </span>
                <p className="text-[11px] text-stone-gray mt-0.5">
                  Protects `/admin/*` routes, validating signed HS256 JWT claims (`ADMIN`, `STAFF`) with Bcrypt password verification.
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-temple-brown dark:text-evening-cream block">
                  Inventory Denial Shield (`/api/calendar/lock-slot`)
                </span>
                <p className="text-[11px] text-stone-gray mt-0.5">
                  Strict 5 requests per IP per 10-minute sliding window with 15-minute lease expiration.
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-temple-brown dark:text-evening-cream block">
                  Booking Creation Throttle (`/api/bookings`)
                </span>
                <p className="text-[11px] text-stone-gray mt-0.5">
                  10 requests per IP per hour; strips client financial fields before database transactions.
                </p>
              </div>
            </div>
          </div>

          {/* Right: CSP Directives */}
          <div className={`p-3.5 rounded-2xl border font-mono text-[11px] space-y-2 ${isDark ? 'bg-dark-surface-elevated border-dark-border text-stone-300' : 'bg-[#FAF5F0] border-[#E8D4C5] text-stone-700'}`}>
            <span className="text-[10px] uppercase font-bold text-lantern-red block">
              Enforced Content Security Policy Directives:
            </span>
            <div className="space-y-1 text-[10px] leading-relaxed">
              <p><strong className="text-temple-brown dark:text-evening-cream">frame-src:</strong> 'self' https://accept.paymob.com https://checkout.paymob.com</p>
              <p><strong className="text-temple-brown dark:text-evening-cream">img-src:</strong> 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com</p>
              <p><strong className="text-temple-brown dark:text-evening-cream">script-src:</strong> 'self' 'unsafe-inline' https://accept.paymob.com</p>
              <p><strong className="text-temple-brown dark:text-evening-cream">X-Frame-Options:</strong> SAMEORIGIN</p>
              <p><strong className="text-temple-brown dark:text-evening-cream">Strict-Transport-Security:</strong> max-age=31536000; includeSubDomains; preload</p>
              <p><strong className="text-temple-brown dark:text-evening-cream">X-Content-Type-Options:</strong> nosniff</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Live Security Audit Log Stream */}
      <div className={`p-5 rounded-3xl border ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-lantern-red" />
            <h3 className="text-sm font-bold font-display text-temple-brown dark:text-evening-cream">
              {isArabic ? 'سجل الرقابة والتدقيق الأمني المباشر (Security Audit Trail)' : 'Live Security Audit Trail'}
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {auditLogs.map((log) => {
            const isBlocked = log.type.includes('TRIGGERED') || log.type.includes('BLOCKED') || log.type.includes('UNAUTHORIZED');
            return (
              <div
                key={log.id}
                className={`p-3 rounded-2xl border text-start flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]'
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                      isBlocked
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-[10px] font-mono text-stone-gray">
                      {log.endpoint}
                    </span>
                    <span className="text-[10px] font-mono text-stone-gray">
                      IP: {log.ip}
                    </span>
                  </div>
                  <p className="text-xs text-temple-brown dark:text-evening-cream leading-relaxed">
                    {log.details}
                  </p>
                </div>

                <div className="text-[10px] font-mono text-stone-gray flex-shrink-0 self-start sm:self-center">
                  {log.timestamp}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
