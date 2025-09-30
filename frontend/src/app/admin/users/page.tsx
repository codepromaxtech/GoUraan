import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users Management',
  description: 'Manage all users',
};

export default function AdminUsersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users Management</h1>
      <p className="text-gray-600">Manage all users from this page.</p>
      {/* Add your users management component here */}
    </div>
  );
}
