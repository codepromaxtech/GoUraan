import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports',
  description: 'View reports and analytics',
};

export default function AdminReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
      <p className="text-gray-600">View reports and analytics from this page.</p>
      {/* Add your reports component here */}
    </div>
  );
}
