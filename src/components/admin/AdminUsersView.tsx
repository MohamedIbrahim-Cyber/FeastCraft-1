import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ChefHat,
  Trash2,
  Search,
  Key,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Database,
  Check,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AdminRole, StaffRole } from '../../types';
import { AddStaffForm } from './AddStaffForm';
import { Bike, Receipt, CalendarCheck, UserCheck } from 'lucide-react';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  createdAt?: string;
}

interface AdminUsersViewProps {
  currentUser?: { name?: string; email?: string; role?: string } | null;
  isArabic: boolean;
  isDark: boolean;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  currentUser,
  isArabic,
  isDark,
}) => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Form Display State (inline toggle & modal)
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete Confirmation State
  const [userToDelete, setUserToDelete] = useState<AdminUserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userToDelete.id || userToDelete.email)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setNotification({
          type: 'error',
          message: data.error || (isArabic ? 'فشل حذف الحساب' : 'Failed to delete account'),
        });
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id && u.email !== userToDelete.email));
        setNotification({
          type: 'success',
          message: isArabic
            ? `تم حذف الحساب "${userToDelete.name}" (${userToDelete.email}) بنجاح`
            : `Account "${userToDelete.name}" (${userToDelete.email}) was permanently deleted`,
        });
        setUserToDelete(null);
      }
    } catch {
      setNotification({
        type: 'error',
        message: isArabic ? 'خطأ في الاتصال بالخادم' : 'Server error while deleting account',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const cashierCount = users.filter((u) => u.role === 'CASHIER').length;
  const kitchenCount = users.filter((u) => u.role === 'KITCHEN').length;
  const deliveryCount = users.filter((u) => u.role === 'DELIVERY').length;
  const reservationCount = users.filter((u) => u.role === 'RESERVATION').length;
  const staffCount = users.filter((u) => u.role === 'STAFF').length;

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          icon: Shield,
          iconBg: 'bg-lantern-red text-white',
          badge: (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-lantern-red/10 text-lantern-red border border-lantern-red/20">
              <Shield className="w-3 h-3" />
              <span>ADMIN ({isArabic ? 'مدير عام' : 'Super Admin'})</span>
            </span>
          ),
        };
      case 'CASHIER':
        return {
          icon: Receipt,
          iconBg: 'bg-emerald-600 text-white',
          badge: (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Receipt className="w-3 h-3" />
              <span>CASHIER ({isArabic ? 'كاشير POS' : 'Cashier Counter'})</span>
            </span>
          ),
        };
      case 'KITCHEN':
        return {
          icon: ChefHat,
          iconBg: 'bg-amber-500 text-white',
          badge: (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ChefHat className="w-3 h-3" />
              <span>KITCHEN ({isArabic ? 'شيف مطبخ' : 'Kitchen KDS'})</span>
            </span>
          ),
        };
      case 'DELIVERY':
        return {
          icon: Bike,
          iconBg: 'bg-blue-600 text-white',
          badge: (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Bike className="w-3 h-3" />
              <span>DELIVERY ({isArabic ? 'سائق توصيل' : 'Courier Driver'})</span>
            </span>
          ),
        };
      case 'RESERVATION':
        return {
          icon: CalendarCheck,
          iconBg: 'bg-purple-600 text-white',
          badge: (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <CalendarCheck className="w-3 h-3" />
              <span>RESERVATION ({isArabic ? 'حجوزات وصالة' : 'Table Bookings'})</span>
            </span>
          ),
        };
      default:
        return {
          icon: UserCheck,
          iconBg: 'bg-slate-600 text-white',
          badge: (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
              <UserCheck className="w-3 h-3" />
              <span>STAFF ({isArabic ? 'طاقم العمل' : 'Floor Staff'})</span>
            </span>
          ),
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-lantern-red/10 text-lantern-red flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight">
                {isArabic ? 'إدارة الموظفين وصلاحيات الإدارة' : 'Staff & User Access Management'}
              </h1>
              <p className="text-xs text-stone-gray">
                {isArabic
                  ? 'إضافة وحذف حسابات الموظفين والمسؤولين مع تشفير Bcrypt في قاعدة البيانات PostgreSQL'
                  : 'Add & delete Staff and Admin accounts with bcrypt-hashed credentials stored in PostgreSQL'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="admin-users-refresh-btn"
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark
                ? 'bg-dark-surface-elevated border-dark-border text-evening-cream hover:bg-white/10'
                : 'bg-white border-[#E8D9CD] text-temple-brown hover:bg-stone-50'
            }`}
            title={isArabic ? 'تحديث القائمة' : 'Refresh list'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-lantern-red' : ''}`} />
          </button>

          <button
            id="admin-create-staff-btn"
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="px-4 py-2.5 rounded-xl bg-lantern-red hover:bg-[#8B3426] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>
              {showAddForm
                ? isArabic
                  ? 'إخفاء نموذج الإضافة'
                  : 'Hide Add Form'
                : isArabic
                ? 'إضافة موظف جديد'
                : 'Add New Staff Member'}
            </span>
            {showAddForm ? <ChevronUp className="w-3.5 h-3.5 ms-1" /> : <ChevronDown className="w-3.5 h-3.5 ms-1" />}
          </button>
        </div>
      </div>

      {/* Notifications / Success Alert */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Collapsible / Inline Add Staff Form Component */}
      {showAddForm && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <AddStaffForm
            isInline={true}
            isArabic={isArabic}
            isDark={isDark}
            onSuccess={() => {
              fetchUsers();
              setNotification({
                type: 'success',
                message: isArabic
                  ? 'تم حفظ وتشفير حساب الموظف الجديد بنجاح في قاعدة البيانات!'
                  : 'New staff account successfully created and password hashed with bcrypt in PostgreSQL!',
              });
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* 3. Top Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Stat 1: Total Staff */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#EADBD0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-gray">
              {isArabic ? 'إجمالي الحسابات المسجلة' : 'Total Access Accounts'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black font-mono">{users.length}</div>
          <div className="mt-1 text-[11px] text-stone-gray flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-500" />
            <span>{isArabic ? 'مخزنة في قاعدة البيانات' : 'Stored in PostgreSQL Database'}</span>
          </div>
        </div>

        {/* Stat 2: Administrators */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#EADBD0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-gray">
              {isArabic ? 'مسؤولو النظام (ADMIN)' : 'Administrators (ADMIN)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-lantern-red/10 text-lantern-red flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-lantern-red">{adminCount}</div>
          <div className="mt-1 text-[11px] text-stone-gray">
            {isArabic ? 'صلاحية كاملة للمنيو والتقارير' : 'Full system CMS & management access'}
          </div>
        </div>

        {/* Stat 3: Kitchen / Staff Accounts */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#EADBD0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-gray">
              {isArabic ? 'طاقم المطبخ (STAFF)' : 'Kitchen & Staff (STAFF)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-amber-500">{staffCount}</div>
          <div className="mt-1 text-[11px] text-stone-gray">
            {isArabic ? 'صلاحية شاشة الطلبات KDS' : 'KDS live order fulfillment access'}
          </div>
        </div>
      </div>

      {/* 4. Search & Filter Bar */}
      <div
        className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#EADBD0]'
        }`}
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-stone-gray" />
          <input
            id="admin-users-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'بحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
            className={`w-full ps-9 pe-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-lantern-red ${
              isDark
                ? 'bg-[#1C1816] border-dark-border text-evening-cream'
                : 'bg-stone-50 border-[#E8D9CD] text-temple-brown'
            }`}
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', labelEn: 'All Roles', labelAr: 'الكل', count: users.length },
            { id: 'ADMIN', labelEn: 'Admin', labelAr: 'الإدارة', count: adminCount },
            { id: 'CASHIER', labelEn: 'Cashier', labelAr: 'الكاشير', count: cashierCount },
            { id: 'KITCHEN', labelEn: 'Kitchen', labelAr: 'المطبخ', count: kitchenCount },
            { id: 'DELIVERY', labelEn: 'Delivery', labelAr: 'التوصيل', count: deliveryCount },
            { id: 'RESERVATION', labelEn: 'Reservations', labelAr: 'الحجوزات', count: reservationCount },
            { id: 'STAFF', labelEn: 'Staff', labelAr: 'الصالة', count: staffCount },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRoleFilter(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                roleFilter === r.id
                  ? 'bg-lantern-red text-white shadow-2xs'
                  : isDark
                  ? 'bg-[#1C1816] text-stone-gray hover:text-white'
                  : 'bg-stone-100 text-stone-gray hover:text-temple-brown'
              }`}
            >
              <span>{isArabic ? r.labelAr : r.labelEn}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  roleFilter === r.id ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'
                }`}
              >
                {r.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Accounts Table with Individual Delete Actions */}
      <div
        className={`rounded-3xl border overflow-hidden shadow-sm ${
          isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#EADBD0]'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs min-w-[640px]">
            <thead>
              <tr
                className={`border-b text-stone-gray uppercase tracking-wider text-[10px] font-bold ${
                  isDark ? 'bg-[#1C1816]/70 border-dark-border' : 'bg-stone-50 border-[#EADBD0]'
                }`}
              >
                <th className="py-3.5 px-4 text-start">{isArabic ? 'المستخدم' : 'User / Identity'}</th>
                <th className="py-3.5 px-4 text-start">{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</th>
                <th className="py-3.5 px-4 text-start">{isArabic ? 'الدور والصلاحية' : 'Role & Permissions'}</th>
                <th className="py-3.5 px-4 text-start">{isArabic ? 'حماية كلمة المرور' : 'Password Security'}</th>
                <th className="py-3.5 px-4 text-end">{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-gray">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-lantern-red" />
                    <span>{isArabic ? 'جاري تحميل الحسابات...' : 'Loading staff accounts from database...'}</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-gray">
                    <Users className="w-8 h-8 mx-auto mb-2 text-stone-gray/50" />
                    <p className="font-bold">{isArabic ? 'لا توجد حسابات مطابقة' : 'No matching accounts found'}</p>
                    <p className="text-[11px] mt-1">
                      {isArabic ? 'أضف موظفاً جديداً للبدء' : 'Click "Add New Staff Member" above to create one.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isPrimaryAdmin = user.email?.toLowerCase() === 'shadosama@gmail.com';
                  const isCurrentAuth =
                    currentUser?.email && user.email?.toLowerCase() === currentUser.email.toLowerCase();

                        const roleDisplay = getRoleDisplay(user.role);
                        return (
                          <tr
                            key={user.id || user.email}
                            className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
                          >
                            {/* Name & Initials */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${roleDisplay.iconBg}`}
                                >
                                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <div className="font-bold text-xs flex items-center gap-1.5">
                                    <span>{user.name}</span>
                                    {isCurrentAuth && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                        {isArabic ? 'أنت' : 'You'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-stone-gray font-mono">
                                    ID: {user.id ? (user.id.length > 14 ? `${user.id.slice(0, 14)}...` : user.id) : 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-3.5 px-4 font-mono text-xs text-stone-gray">
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-stone-gray/70" />
                                <span>{user.email}</span>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-3.5 px-4">
                              {roleDisplay.badge}
                            </td>

                      {/* Password Security */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Bcrypt (10 rounds)</span>
                        </span>
                      </td>

                      {/* Individual Delete Action */}
                      <td className="py-3.5 px-4 text-end">
                        {isPrimaryAdmin ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-gray px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5"
                            title={isArabic ? 'الحساب الرئيسي لا يمكن حذفه' : 'Primary Admin Account Protected'}
                          >
                            <Lock className="w-3 h-3 text-lantern-red" />
                            <span>{isArabic ? 'حساب أساسي محمي' : 'Protected'}</span>
                          </span>
                        ) : (
                          <button
                            id={`delete-user-${user.id}`}
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="px-2.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ms-auto"
                            title={isArabic ? 'حذف الحساب' : 'Delete Account'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'حذف' : 'Delete'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MODAL ADD STAFF FALLBACK (IF USER PREFERS MODAL) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg">
            <AddStaffForm
              isInline={false}
              isArabic={isArabic}
              isDark={isDark}
              onSuccess={() => {
                fetchUsers();
                setIsCreateModalOpen(false);
              }}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 7. INDIVIDUAL DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${
              isDark
                ? 'bg-[#1C1816] border-[#4A352A] text-[#FAF7F2]'
                : 'bg-white border-[#E8D9CD] text-[#2C2420]'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-center font-bold text-sm">
              {isArabic ? 'تأكيد حذف الحساب' : 'Confirm Account Deletion'}
            </h3>

            <p className="text-center text-xs text-stone-gray mt-2">
              {isArabic
                ? `هل أنت متأكد من رغبتك في حذف حساب "${userToDelete.name}" (${userToDelete.email}) نهائياً من قاعدة البيانات؟`
                : `Are you sure you want to permanently delete the account "${userToDelete.name}" (${userToDelete.email}) from PostgreSQL?`}
            </p>

            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-gray hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                {isArabic ? 'تراجع' : 'Cancel'}
              </button>

              <button
                id="confirm-delete-user-btn"
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isArabic ? 'جاري الحذف...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تأكيد الحذف' : 'Delete Account'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersView;
