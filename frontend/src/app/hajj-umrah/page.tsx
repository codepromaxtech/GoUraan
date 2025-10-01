'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function HajjUmrahPage() {
  const packages = [
    {
      id: 1,
      name: 'Umrah Economy Package',
      duration: '10 Days',
      price: '$1,999',
      features: ['3-star hotel', 'Visa processing', 'Airport transfers', 'Group guidance'],
    },
    {
      id: 2,
      name: 'Umrah Premium Package',
      duration: '14 Days',
      price: '$3,499',
      features: ['5-star hotel', 'Visa processing', 'Private transfers', 'Personal guide', 'Ziyarat tours'],
    },
    {
      id: 3,
      name: 'Hajj Standard Package',
      duration: '30 Days',
      price: '$5,999',
      features: ['4-star hotel', 'Full visa support', 'All transfers', 'Experienced guide', 'Complete Hajj rituals'],
    },
    {
      id: 4,
      name: 'Hajj VIP Package',
      duration: '35 Days',
      price: '$9,999',
      features: ['5-star hotel near Haram', 'VIP visa processing', 'Private transport', 'Dedicated guide', 'Premium services'],
    },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hajj & Umrah Packages</h1>
          <p className="text-xl text-gray-600">
            Experience the spiritual journey of a lifetime with our carefully curated packages
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-green-100">{pkg.duration}</p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                  <span className="text-gray-600"> per person</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-semibold mb-6">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Accommodation</h3>
              <p className="text-gray-600">Comfortable hotels near the Holy Mosques</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Transportation</h3>
              <p className="text-gray-600">Airport transfers and local transport</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Guidance</h3>
              <p className="text-gray-600">Experienced guides for rituals</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Visa Support</h3>
              <p className="text-gray-600">Complete visa processing assistance</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Meals</h3>
              <p className="text-gray-600">Daily breakfast and selected meals</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock assistance</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
