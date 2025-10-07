'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type SearchType = 'flights' | 'hotels' | 'packages' | 'hajj-umrah';

const SearchSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SearchType>('flights');

  const tabs = [
    { id: 'flights', label: 'Flights', icon: '✈️' },
    { id: 'hotels', label: 'Hotels', icon: '🏨' },
    { id: 'packages', label: 'Packages', icon: '🎒' },
    { id: 'hajj-umrah', label: 'Hajj & Umrah', icon: '🕌' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Journey
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search and compare the best deals for flights, hotels, and travel packages
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl mx-auto"
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SearchType)}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white border-b-2 border-brand-600'
                    : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Forms */}
          <div className="min-h-[200px]">
            {activeTab === 'flights' && <FlightSearchForm />}
            {activeTab === 'hotels' && <HotelSearchForm />}
            {activeTab === 'packages' && <PackageSearchForm />}
            {activeTab === 'hajj-umrah' && <HajjUmrahSearchForm />}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FlightSearchForm: React.FC = () => {
  const [tripType, setTripType] = useState<'round-trip' | 'one-way' | 'multi-city'>('round-trip');

  return (
    <div className="space-y-6">
      {/* Trip Type */}
      <div className="flex gap-4">
        {[
          { id: 'round-trip', label: 'Round Trip' },
          { id: 'one-way', label: 'One Way' },
          { id: 'multi-city', label: 'Multi City' },
        ].map((type) => (
          <label key={type.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value={type.id}
              checked={tripType === type.id}
              onChange={(e) => setTripType(e.target.value as any)}
              className="text-brand-600 focus:ring-brand-500"
            />
            <span className="text-gray-700">{type.label}</span>
          </label>
        ))}
      </div>

      {/* Search Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input
            type="text"
            placeholder="Departure city"
            className="input-field"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">To</label>
          <input
            type="text"
            placeholder="Destination city"
            className="input-field"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Departure</label>
          <input
            type="date"
            className="input-field"
          />
        </div>
        {tripType === 'round-trip' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Return</label>
            <input
              type="date"
              className="input-field"
            />
          </div>
        )}
      </div>

      {/* Passengers and Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Passengers</label>
          <select className="input-field">
            <option>1 Adult</option>
            <option>2 Adults</option>
            <option>3 Adults</option>
            <option>4+ Adults</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Class</label>
          <select className="input-field">
            <option>Economy</option>
            <option>Premium Economy</option>
            <option>Business</option>
            <option>First Class</option>
          </select>
        </div>
      </div>

      <Button variant="brand" size="lg" className="w-full md:w-auto px-12">
        Search Flights
      </Button>
    </div>
  );
};

const HotelSearchForm: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Destination</label>
          <input
            type="text"
            placeholder="City or hotel name"
            className="input-field"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Check-in</label>
          <input
            type="date"
            className="input-field"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Check-out</label>
          <input
            type="date"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Rooms</label>
          <select className="input-field">
            <option>1 Room</option>
            <option>2 Rooms</option>
            <option>3 Rooms</option>
            <option>4+ Rooms</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Guests</label>
          <select className="input-field">
            <option>2 Adults</option>
            <option>2 Adults, 1 Child</option>
            <option>2 Adults, 2 Children</option>
            <option>Custom</option>
          </select>
        </div>
      </div>

      <Button variant="brand" size="lg" className="w-full md:w-auto px-12">
        Search Hotels
      </Button>
    </div>
  );
};

const PackageSearchForm: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Destination</label>
          <select className="input-field">
            <option>Select destination</option>
            <option>Dubai & UAE</option>
            <option>Turkey</option>
            <option>Malaysia</option>
            <option>Thailand</option>
            <option>Europe</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Package Type</label>
          <select className="input-field">
            <option>All Packages</option>
            <option>Honeymoon</option>
            <option>Family</option>
            <option>Adventure</option>
            <option>Cultural</option>
            <option>Beach</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Departure Date</label>
          <input
            type="date"
            className="input-field"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Duration</label>
          <select className="input-field">
            <option>Any Duration</option>
            <option>3-5 Days</option>
            <option>6-10 Days</option>
            <option>11-15 Days</option>
            <option>15+ Days</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Travelers</label>
          <select className="input-field">
            <option>2 Adults</option>
            <option>2 Adults, 1 Child</option>
            <option>2 Adults, 2 Children</option>
            <option>Custom</option>
          </select>
        </div>
      </div>

      <Button variant="brand" size="lg" className="w-full md:w-auto px-12">
        Search Packages
      </Button>
    </div>
  );
};

const HajjUmrahSearchForm: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Package Type</label>
          <select className="input-field">
            <option>Select package type</option>
            <option>Hajj Package</option>
            <option>Umrah Package</option>
            <option>Hajj + Umrah Combo</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Package Category</label>
          <select className="input-field">
            <option>Select category</option>
            <option>Economy</option>
            <option>Standard</option>
            <option>Premium</option>
            <option>VIP</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Departure Date</label>
          <input
            type="date"
            className="input-field"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Duration</label>
          <select className="input-field">
            <option>14 Days</option>
            <option>21 Days</option>
            <option>28 Days</option>
            <option>35 Days</option>
            <option>Custom</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Pilgrims</label>
          <select className="input-field">
            <option>1 Person</option>
            <option>2 People</option>
            <option>3 People</option>
            <option>4+ People</option>
          </select>
        </div>
      </div>

      <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-gold-600 text-xl">🕌</span>
          <div>
            <h4 className="font-medium text-gold-800 mb-1">Special Hajj & Umrah Services</h4>
            <p className="text-sm text-gold-700">
              Includes visa processing, guided tours, religious guidance, and 24/7 support throughout your spiritual journey.
            </p>
          </div>
        </div>
      </div>

      <Button variant="gold" size="lg" className="w-full md:w-auto px-12">
        Find Hajj & Umrah Packages
      </Button>
    </div>
  );
};

export default SearchSection;
