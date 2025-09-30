import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Settings',
  description: 'Manage system settings',
};

export default function AdminSystemPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">System Settings</h1>
      <p className="text-gray-600">Configure system settings from this page.</p>
      {/* Add your system settings component here */}
    </div>
  );
}
