import React from 'react';
import { AdminUsersView } from '../../../src/components/admin/AdminUsersView';

export default function AdminUsersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminUsersView isArabic={false} isDark={false} />
    </div>
  );
}
