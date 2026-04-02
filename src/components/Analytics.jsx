import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Header from './Header';
import Sidebar from './Sidebar';
import RoleBadge from './RoleBadge';
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

export default function Analytics() {
  const { user, userRole, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userRole]);

  const fetchAnalytics = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      const users = snapshot.docs.map(doc => doc.data());

      // Calculate statistics
      const totalUsers = users.length;
      const admins = users.filter(u => u.role === 'admin').length;
      const regularUsers = users.filter(u => u.role === 'user').length;

      // Mock revenue data (in real app, would come from payments table)
      const revenue = Math.floor(Math.random() * 50000) + 10000;
      const monthlyRevenue = Math.floor(revenue / 12);

      // Mock active users data
      const activeUsers = Math.floor(totalUsers * 0.75);

      // Growth trend (mock data)
      const growthData = [
        { month: 'Jan', users: 45, revenue: 8000 },
        { month: 'Feb', users: 52, revenue: 9200 },
        { month: 'Mar', users: 68, revenue: 11500 },
        { month: 'Apr', users: 85, revenue: 14200 },
        { month: 'May', users: 102, revenue: 17800 },
        { month: 'Jun', users: totalUsers, revenue: monthlyRevenue * 6 },
      ];

      // Role distribution (pie chart)
      const roleDistribution = [
        { name: 'Admins', value: admins, color: '#ff6b6b' },
        { name: 'Users', value: regularUsers, color: '#4ecdc4' },
      ];

      setStats({
        totalUsers,
        admins,
        regularUsers,
        activeUsers,
        revenue,
        monthlyRevenue,
        growthData,
        roleDistribution,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar userRole={userRole} />
        <div className="flex-1 flex flex-col">
          <Header user={{ firstName: 'Analytics' }} userRole={userRole} onLogout={handleLogout} />
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Header user={{ firstName: user?.displayName || 'Analytics' }} userRole={userRole} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
              <p className="text-gray-600 mt-1">Welcome to your analytics dashboard</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users Card */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Total Users</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalUsers}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
                <p className="text-xs text-green-600 mt-4">+12% from last month</p>
              </div>

              {/* Active Users Card */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Active Users</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.activeUsers}</p>
                  </div>
                  <div className="text-4xl">⚡</div>
                </div>
                <p className="text-xs text-green-600 mt-4">{Math.round((stats?.activeUsers / stats?.totalUsers) * 100)}% active</p>
              </div>

              {/* Total Revenue Card */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">${stats?.revenue?.toLocaleString()}</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
                <p className="text-xs text-green-600 mt-4">+8% from last month</p>
              </div>

              {/* Admin Count Card */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-500 hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Admins</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.admins}</p>
                  </div>
                  <div className="text-4xl">👑</div>
                </div>
                <p className="text-xs text-gray-500 mt-4">{Math.round((stats?.admins / stats?.totalUsers) * 100)}% of total</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Growth Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">User & Revenue Growth</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats?.growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Role Distribution Pie Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">User Role Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats?.roleDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Table */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Metric</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Value</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">Total Users</td>
                      <td className="px-6 py-3 font-semibold">{stats?.totalUsers}</td>
                      <td className="px-6 py-3 text-green-600">+12%</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">Active Users</td>
                      <td className="px-6 py-3 font-semibold">{stats?.activeUsers}</td>
                      <td className="px-6 py-3 text-green-600">+8%</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">Total Revenue</td>
                      <td className="px-6 py-3 font-semibold">${stats?.revenue?.toLocaleString()}</td>
                      <td className="px-6 py-3 text-green-600">+15%</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">Monthly Revenue</td>
                      <td className="px-6 py-3 font-semibold">${stats?.monthlyRevenue?.toLocaleString()}</td>
                      <td className="px-6 py-3 text-green-600">+10%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3">Admins</td>
                      <td className="px-6 py-3 font-semibold">{stats?.admins}</td>
                      <td className="px-6 py-3 text-gray-500">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}