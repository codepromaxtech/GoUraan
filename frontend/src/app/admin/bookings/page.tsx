import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookings Management',
  description: 'Manage all bookings',
};

export default function AdminBookingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bookings Management</h1>
      <p className="text-gray-600">Manage all bookings from this page.</p>
      {/* Add your bookings management component here */}
    </div>
  );
}
