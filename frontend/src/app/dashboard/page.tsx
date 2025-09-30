import { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your bookings, profile, and travel preferences',
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}
