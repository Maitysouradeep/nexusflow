import React, { useState } from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsDemo() {
  const { isDarkMode } = useDarkMode();
  const [demoUser] = useState({
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@example.com',
  });

  const stats = {
    totalUsers: 1245,
    admins: 12,
    regularUsers: 1233,
    activeUsers: 956,
    revenue: 125480,
    monthlyRevenue: 10457,
    growthData: [
      { month: 'Jan', users: 45, revenue: 8000 },
      { month: 'Feb', users: 52, revenue: 9200 },
      { month: 'Mar', users: 68, revenue: 11500 },
      { month: 'Apr', users: 85, revenue: 14200 },
      { month: 'May', users: 102, revenue: 17800 },
      { month: 'Jun', users: 1245, revenue: 125480 },
    ],
    roleDistribution: [
      { name: 'Admins', value: 12, color: '#ff6b6b' },
      { name: 'Users', value: 1233, color: '#4ecdc4' },
    ],
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors`}>
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col">
        {/* Demo Header */}
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm transition-colors`}>
          <div className="max-w-full px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard (Demo)
              </h1>
            </div>
            <Link to="/login" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold text-sm">
              Exit Demo
            </Link>
          </div>
        </header>

        <main className={`flex-1 overflow-auto p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Analytics</h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Welcome to your analytics dashboard</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-semibold`}>Total Users</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mt-2`}>{stats.totalUsers}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
                <p className="text-xs text-green-600 mt-4">+12% from last month</p>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-semibold`}>Active Users</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mt-2`}>{stats.activeUsers}</p>
                  </div>
                  <div className="text-4xl">⚡</div>
                </div>
                <p className="text-xs text-green-600 mt-4">{Math.round((stats.activeUsers / stats.totalUsers) * 100)}% active</p>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-semibold`}>Total Revenue</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mt-2`}>${stats.revenue?.toLocaleString()}</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
                <p className="text-xs text-green-600 mt-4">+8% from last month</p>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 border-t-4 border-red-500 hover:shadow-xl transition`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-semibold`}>Admins</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mt-2`}>{stats.admins}</p>
                  </div>
                  <div className="text-4xl">👑</div>
                </div>
                <p className="text-xs text-gray-500 mt-4">{Math.round((stats.admins / stats.totalUsers) * 100)}% of total</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>User & Revenue Growth</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#ccc'} />
                    <XAxis dataKey="month" stroke={isDarkMode ? '#888' : '#666'} />
                    <YAxis yAxisId="left" stroke={isDarkMode ? '#888' : '#666'} />
                    <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#888' : '#666'} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>User Role Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}