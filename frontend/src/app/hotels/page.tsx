'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function HotelsPage() {
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [showGuests, setShowGuests] = useState(false);
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const handleSearch = () => {
    if (!destination || !checkIn || !checkOut) {
      alert('Please fill in all search fields');
      return;
    }
    
    const searchData = {
      destination,
      checkIn,
      checkOut,
      guests: {
        adults: guests.adults,
        children: guests.children,
        rooms: guests.rooms
      }
    };
    
    console.log('Searching hotels with:', searchData);
    alert(`Searching hotels in ${destination}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${guests.adults + guests.children}, Rooms: ${guests.rooms}\n\nThis will be connected to the hotel search API.`);
  };

  const popularHotels = [
    { name: 'Burj Al Arab', city: 'Dubai', rating: 5, price: '$850', image: '🏨', reviews: '4,523' },
    { name: 'The Ritz London', city: 'London', rating: 5, price: '$720', image: '🏰', reviews: '3,891' },
    { name: 'Four Seasons Paris', city: 'Paris', rating: 5, price: '$680', image: '🏛️', reviews: '4,102' },
    { name: 'Marina Bay Sands', city: 'Singapore', rating: 5, price: '$420', image: '🌃', reviews: '5,234' },
    { name: 'The Plaza', city: 'New York', rating: 5, price: '$890', image: '🏢', reviews: '4,567' },
    { name: 'Park Hyatt Tokyo', city: 'Tokyo', rating: 5, price: '$650', image: '🗼', reviews: '3,456' },
  ];

  const destinations = [
    { city: 'Dubai', hotels: '2,450+', image: '🏙️' },
    { city: 'Makkah', hotels: '1,200+', image: '🕌' },
    { city: 'Madinah', hotels: '850+', image: '🕌' },
    { city: 'Istanbul', hotels: '3,100+', image: '🌉' },
    { city: 'London', hotels: '4,200+', image: '🏰' },
    { city: 'Paris', hotels: '3,800+', image: '🗼' },
  ];

  const amenities = [
    { name: 'Free WiFi', icon: '📶' },
    { name: 'Swimming Pool', icon: '🏊' },
    { name: 'Spa & Wellness', icon: '💆' },
    { name: 'Restaurant', icon: '🍽️' },
    { name: 'Gym', icon: '💪' },
    { name: 'Parking', icon: '🅿️' },
    { name: 'Airport Shuttle', icon: '🚐' },
    { name: '24/7 Reception', icon: '🔔' },
  ];

  return (
    <MainLayout>
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
            <p className="text-xl text-pink-100">Search from millions of hotels worldwide</p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Destination */}
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Where are you going?
                  </span>
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="City, hotel, or landmark"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Check-in */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Check-in
                  </span>
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Check-out */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Check-out
                  </span>
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Guests & Rooms */}
              <div className="md:col-span-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Guests & Rooms
                  </span>
                </label>
                <button
                  onClick={() => setShowGuests(!showGuests)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {guests.adults + guests.children} Guests, {guests.rooms} Room{guests.rooms > 1 ? 's' : ''}
                </button>

                {showGuests && (
                  <div className="absolute z-10 mt-2 w-64 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Adults</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setGuests({...guests, adults: Math.max(1, guests.adults - 1)})} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300">-</button>
                          <span className="w-8 text-center">{guests.adults}</span>
                          <button onClick={() => setGuests({...guests, adults: guests.adults + 1})} className="w-8 h-8 rounded-full bg-purple-600 text-white hover:bg-purple-700">+</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Children</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setGuests({...guests, children: Math.max(0, guests.children - 1)})} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300">-</button>
                          <span className="w-8 text-center">{guests.children}</span>
                          <button onClick={() => setGuests({...guests, children: guests.children + 1})} className="w-8 h-8 rounded-full bg-purple-600 text-white hover:bg-purple-700">+</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Rooms</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setGuests({...guests, rooms: Math.max(1, guests.rooms - 1)})} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300">-</button>
                          <span className="w-8 text-center">{guests.rooms}</span>
                          <button onClick={() => setGuests({...guests, rooms: guests.rooms + 1})} className="w-8 h-8 rounded-full bg-purple-600 text-white hover:bg-purple-700">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="md:col-span-12">
                <button 
                  onClick={handleSearch}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Hotels
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Hotels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Luxury Hotels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularHotels.map((hotel) => (
            <div key={hotel.name} className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all cursor-pointer overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-7xl">
                {hotel.image}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{hotel.name}</h3>
                    <p className="text-sm text-gray-500">{hotel.city}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold text-purple-900">{hotel.rating}.0</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-xs text-gray-500">{hotel.reviews} reviews</p>
                    <p className="text-purple-600 font-bold text-xl">{hotel.price}<span className="text-sm text-gray-500">/night</span></p>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map((dest) => (
              <div key={dest.city} className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-5xl mb-3">{dest.image}</div>
                <h3 className="font-bold text-gray-900">{dest.city}</h3>
                <p className="text-sm text-gray-500">{dest.hotels} hotels</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Amenities</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {amenities.map((amenity) => (
            <div key={amenity.name} className="bg-white rounded-lg p-6 text-center border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all">
              <div className="text-4xl mb-3">{amenity.icon}</div>
              <p className="font-medium text-gray-700">{amenity.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Book With Us */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Book Hotels With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Price</h3>
              <p className="text-gray-600 text-sm">Lowest rates guaranteed</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Cancellation</h3>
              <p className="text-gray-600 text-sm">On most bookings</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Booking</h3>
              <p className="text-gray-600 text-sm">Your data is safe</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">We're here to help</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
