'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About GoUraan</h1>
        
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
          <p className="text-gray-600 mb-4">
            GoUraan is a comprehensive travel booking platform specializing in flights, hotels, 
            travel packages, and Hajj & Umrah services. We are dedicated to making travel accessible, 
            affordable, and hassle-free for everyone.
          </p>
          <p className="text-gray-600">
            With years of experience in the travel industry, we understand the needs of modern travelers 
            and strive to provide the best possible service.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-600">
            To provide seamless travel experiences by offering comprehensive booking solutions, 
            competitive prices, and exceptional customer service.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Best prices guaranteed</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>24/7 customer support</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Secure payment options</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Instant booking confirmation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Specialized Hajj & Umrah packages</span>
            </li>
          </ul>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
