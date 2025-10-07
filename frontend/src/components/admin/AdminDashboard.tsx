'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');

  // Mock data - in real app, this would come from API
  const stats = [
    {
      name: 'Total Revenue',
      value: '$2,847,500',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: '💰',
      description: 'Last 30 days',
    },
    {
      name: 'Total Bookings',
      value: '1,247',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: '✈️',
      description: 'Last 30 days',
    },
    {
      name: 'Active Users',
      value: '12,847',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: '👥',
      description: 'Last 30 days',
    },
    {
      name: 'Conversion Rate',
      value: '3.24%',
      change: '-0.5%',
      changeType: 'negative' as const,
      icon: '📊',
      description: 'Last 30 days',
    },
  ];

  const recentBookings = [
    {
      id: 'BK001',
      customer: 'Ahmed Rahman',
      type: 'Hajj Package',
      amount: '$4,500',
      status: 'Confirmed',
      date: '2024-01-15',
    },
    {
      id: 'BK002',
      customer: 'Sarah Johnson',
      type: 'Dubai Package',
      amount: '$1,200',
      status: 'Pending',
      date: '2024-01-15',
    },
    {
      id: 'BK003',
      customer: 'Mohammad Ali',
      type: 'Flight Booking',
      amount: '$450',
      status: 'Confirmed',
      date: '2024-01-14',
    },
    {
      id: 'BK004',
      customer: 'Fatima Khan',
      type: 'Umrah Package',
      amount: '$1,800',
      status: 'Processing',
      date: '2024-01-14',
    },
    {
      id: 'BK005',
      customer: 'John Smith',
      type: 'Hotel Booking',
      amount: '$320',
      status: 'Confirmed',
      date: '2024-01-13',
    },
  ];

  const topDestinations = [
    { name: 'Makkah, Saudi Arabia', bookings: 156, revenue: '$702,000' },
    { name: 'Dubai, UAE', bookings: 89, revenue: '$267,000' },
    { name: 'Istanbul, Turkey', bookings: 67, revenue: '$134,000' },
    { name: 'Madinah, Saudi Arabia', bookings: 45, revenue: '$202,500' },
    { name: 'Kuala Lumpur, Malaysia', bookings: 34, revenue: '$68,000' },
  ];

  const systemAlerts = [
    {
      type: 'warning',
      message: 'Payment gateway response time is higher than usual',
      time: '5 minutes ago',
    },
    {
      type: 'info',
      message: 'New Hajj packages for 2024 have been published',
      time: '1 hour ago',
    },
    {
      type: 'success',
      message: 'Database backup completed successfully',
      time: '2 hours ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your platform's performance and key metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="brand">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
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
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-sm ${
                stat.changeType === 'positive' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500">{stat.description}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'Confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Destinations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Destinations</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topDestinations.map((destination, index) => (
                <div key={destination.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                      <span className="text-brand-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{destination.name}</p>
                      <p className="text-sm text-gray-600">{destination.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{destination.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === 'warning' 
                      ? 'bg-yellow-500'
                      : alert.type === 'success'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Add Package', icon: '➕', href: '/admin/packages/new' },
                { name: 'View Reports', icon: '📊', href: '/admin/reports' },
                { name: 'Manage Users', icon: '👥', href: '/admin/users' },
                { name: 'System Settings', icon: '⚙️', href: '/admin/settings' },
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
          </div>
        </motion.div>
      </div>

      {/* Performance Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">Revenue</Button>
            <Button variant="ghost" size="sm">Bookings</Button>
            <Button variant="ghost" size="sm">Users</Button>
          </div>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-gray-600">Interactive charts will be displayed here</p>
            <p className="text-sm text-gray-500">Integration with Chart.js or similar library</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
