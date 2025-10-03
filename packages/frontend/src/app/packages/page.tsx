'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function PackagesPage() {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Travel Packages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Package {i}</h3>
                <p className="text-gray-600 mb-4">Explore amazing destinations with our curated packages</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">$999</span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
