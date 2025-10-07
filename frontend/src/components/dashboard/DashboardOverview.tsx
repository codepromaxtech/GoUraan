'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const DashboardOverview: React.FC = () => {
  // Mock data - in real app, this would come from API
  const stats = [
    {
      name: 'Total Bookings',
      value: '12',
      icon: '✈️',
      change: '+2 this month',
      changeType: 'positive' as const,
    },
    {
      name: 'Wallet Balance',
      value: '$1,250',
      icon: '💰',
      change: '+$150 this week',
      changeType: 'positive' as const,
    },
    {
      name: 'Loyalty Points',
      value: '2,840',
      icon: '⭐',
      change: '+120 points',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Trips',
      value: '2',
      icon: '🎒',
      change: 'Dubai & Turkey',
      changeType: 'neutral' as const,
    },
  ];

  const recentBookings = [
    {
      id: '1',
      type: 'Flight',
      destination: 'Dubai, UAE',
      date: '2024-02-15',
      status: 'Confirmed',
      amount: '$450',
      reference: 'FL240215001',
    },
    {
      id: '2',
      type: 'Hotel',
      destination: 'Istanbul, Turkey',
      date: '2024-03-10',
      status: 'Pending',
      amount: '$320',
      reference: 'HT240310002',
    },
    {
      id: '3',
      type: 'Package',
      destination: 'Hajj Package',
      date: '2024-06-20',
      status: 'Confirmed',
      amount: '$4,500',
      reference: 'HJ240620003',
    },
  ];

  const upcomingTrips = [
    {
      id: '1',
      title: 'Dubai Business Trip',
      date: '2024-02-15',
      days: '5 days',
      type: 'Flight + Hotel',
      status: 'Ready to Travel',
    },
    {
      id: '2',
      title: 'Turkey Cultural Tour',
      date: '2024-03-10',
      days: '8 days',
      type: 'Package',
      status: 'Documents Pending',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
          <p className="text-gray-600">Here's what's happening with your travel plans</p>
        </div>
        <Button variant="brand">
          New Booking
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
            <div className="mt-4">
              <span className={`text-sm ${
                stat.changeType === 'positive' 
                  ? 'text-green-600' 
                  : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                      <span className="text-brand-600 font-semibold text-sm">
                        {booking.type.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{booking.destination}</p>
                      <p className="text-sm text-gray-600">{booking.reference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{booking.amount}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Trips */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Trips</h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{trip.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{trip.type}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>📅 {trip.date}</span>
                        <span className="mx-2">•</span>
                        <span>⏱️ {trip.days}</span>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      trip.status === 'Ready to Travel'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="brand" className="flex-1">
                      Check-in
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Book Flight', icon: '✈️', href: '/flights' },
            { name: 'Find Hotel', icon: '🏨', href: '/hotels' },
            { name: 'Browse Packages', icon: '🎒', href: '/packages' },
            { name: 'Hajj & Umrah', icon: '🕌', href: '/hajj-umrah' },
          ].map((action) => (
            <Button
              key={action.name}
              variant="outline"
              className="h-20 flex-col space-y-2 hover:bg-brand-50 hover:border-brand-200"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm">{action.name}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Travel Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2">Travel Tip of the Day</h2>
            <p className="text-brand-100">
              Book your flights at least 6-8 weeks in advance for the best deals on international travel.
            </p>
          </div>
          <div className="text-4xl">💡</div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;
