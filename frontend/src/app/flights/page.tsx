'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function FlightsPage() {
  const [tripType, setTripType] = useState('roundtrip');
  const [travelClass, setTravelClass] = useState('economy');
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [showPassengers, setShowPassengers] = useState(false);

  const popularDestinations = [
    { city: 'Dubai', country: 'UAE', price: '$450', image: '🏙️' },
    { city: 'London', country: 'UK', price: '$650', image: '🏰' },
    { city: 'Paris', country: 'France', price: '$580', image: '🗼' },
    { city: 'New York', country: 'USA', price: '$750', image: '🗽' },
    { city: 'Tokyo', country: 'Japan', price: '$820', image: '🗾' },
    { city: 'Singapore', country: 'Singapore', price: '$380', image: '🌆' },
  ];

  const airlines = [
    { name: 'Emirates', logo: '✈️' },
    { name: 'Qatar Airways', logo: '🛫' },
    { name: 'Singapore Airlines', logo: '✈️' },
    { name: 'Turkish Airlines', logo: '🛬' },
  ];

  return (
    <MainLayout>
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Flight</h1>
            <p className="text-xl text-blue-100">Search and compare flights from 500+ airlines worldwide</p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-gray-900">
            {/* Trip Type Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setTripType('roundtrip')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  tripType === 'roundtrip'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Round Trip
              </button>
              <button
                onClick={() => setTripType('oneway')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  tripType === 'oneway'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                One Way
              </button>
              <button
                onClick={() => setTripType('multicity')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  tripType === 'multicity'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Multi-City
              </button>
            </div>

            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* From */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    From
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="City or Airport"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Swap Button */}
              <div className="hidden md:flex md:col-span-1 items-end justify-center pb-3">
                <button className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>

              {/* To */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    To
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="City or Airport"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Departure Date */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Departure
                  </span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Return Date */}
              {tripType === 'roundtrip' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Return
                    </span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Passengers & Class */}
              <div className="md:col-span-3 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Travelers & Class
                  </span>
                </label>
                <button
                  onClick={() => setShowPassengers(!showPassengers)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {passengers.adults + passengers.children + passengers.infants} Travelers, {travelClass}
                </button>

                {showPassengers && (
                  <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Adults (12+)</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setPassengers({...passengers, adults: Math.max(1, passengers.adults - 1)})} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300">-</button>
                          <span className="w-8 text-center">{passengers.adults}</span>
                          <button onClick={() => setPassengers({...passengers, adults: passengers.adults + 1})} className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700">+</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Children (2-11)</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setPassengers({...passengers, children: Math.max(0, passengers.children - 1)})} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300">-</button>
                          <span className="w-8 text-center">{passengers.children}</span>
                          <button onClick={() => setPassengers({...passengers, children: passengers.children + 1})} className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700">+</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Infants (0-2)</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setPassengers({...passengers, infants: Math.max(0, passengers.infants - 1)})} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300">-</button>
                          <span className="w-8 text-center">{passengers.infants}</span>
                          <button onClick={() => setPassengers({...passengers, infants: passengers.infants + 1})} className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700">+</button>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <label className="block text-sm font-medium mb-2">Travel Class</label>
                        <select
                          value={travelClass}
                          onChange={(e) => setTravelClass(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="economy">Economy</option>
                          <option value="premium">Premium Economy</option>
                          <option value="business">Business Class</option>
                          <option value="first">First Class</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="md:col-span-12">
                <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl">
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Flights
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {popularDestinations.map((dest) => (
            <div key={dest.city} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group">
              <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-6xl">
                {dest.image}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{dest.city}</h3>
                <p className="text-sm text-gray-500">{dest.country}</p>
                <p className="text-blue-600 font-semibold mt-2">from {dest.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Airlines */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Partner Airlines</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {airlines.map((airline) => (
              <div key={airline.name} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-3">{airline.logo}</div>
                <p className="text-gray-700 font-medium text-center">{airline.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Book With Us */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Book Flights With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
            <p className="text-gray-600">Find the lowest prices or we'll refund the difference</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
            <p className="text-gray-600">Your data is protected with industry-leading security</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">Our team is always here to help you</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
