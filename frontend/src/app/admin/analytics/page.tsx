'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30days');

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-2">Deep insights into your business performance</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <p className="text-blue-100 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">$0</p>
            <p className="text-blue-100 text-sm mt-2">↑ 0% from last period</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <p className="text-green-100 text-sm">Conversion Rate</p>
            <p className="text-3xl font-bold mt-2">0%</p>
            <p className="text-green-100 text-sm mt-2">↑ 0% from last period</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <p className="text-purple-100 text-sm">Avg. Order Value</p>
            <p className="text-3xl font-bold mt-2">$0</p>
            <p className="text-purple-100 text-sm mt-2">↑ 0% from last period</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
            <p className="text-orange-100 text-sm">Customer LTV</p>
            <p className="text-3xl font-bold mt-2">$0</p>
            <p className="text-orange-100 text-sm mt-2">↑ 0% from last period</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p>Revenue chart will display here</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p>User growth chart will display here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic & Device Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
            <div className="space-y-3">
              {['United States', 'United Kingdom', 'Saudi Arabia', 'UAE', 'Bangladesh'].map((country, idx) => (
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌍</span>
                    <span className="text-gray-700">{country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${100 - idx * 15}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-600 font-medium w-12 text-right">0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mobile</p>
                    <p className="text-sm text-gray-500">0 users</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">0%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Desktop</p>
                    <p className="text-sm text-gray-500">0 users</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">0%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Tablet</p>
                    <p className="text-sm text-gray-500">0 users</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Funnel</h3>
          <div className="space-y-2">
            {[
              { stage: 'Visitors', count: 0, percentage: 100 },
              { stage: 'Search', count: 0, percentage: 80 },
              { stage: 'View Details', count: 0, percentage: 60 },
              { stage: 'Add to Cart', count: 0, percentage: 40 },
              { stage: 'Checkout', count: 0, percentage: 20 },
              { stage: 'Completed', count: 0, percentage: 15 },
            ].map((stage) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <span className="w-32 text-sm font-medium text-gray-700">{stage.stage}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-end px-3"
                    style={{ width: `${stage.percentage}%` }}
                  >
                    <span className="text-white text-sm font-medium">{stage.count}</span>
                  </div>
                </div>
                <span className="w-16 text-sm text-gray-600 text-right">{stage.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
