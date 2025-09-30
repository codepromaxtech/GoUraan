import { Metadata } from 'next';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard - GoUraan',
  description: 'Comprehensive admin dashboard for managing the GoUraan travel platform',
};

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
