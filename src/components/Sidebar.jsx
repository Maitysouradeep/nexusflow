import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ userRole }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈', all: true },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/activity', label: 'Activity Log', icon: '📋' },
    { path: '/subscription', label: 'Subscription', icon: '💳', all: true },
    { path: '/settings', label: 'Settings', icon: '⚙️', all: true },
    ...(userRole === 'admin' ? [
      { path: '/admin', label: 'Admin Panel', icon: '👑', admin: true },
    ] : []),
    // Demo links(always visible)
      { path: '/demo/admin', label: 'Demo: Admin', icon: '🎨', demo: true },
      { path: '/demo/analytics', label: 'Demo: Analytics', icon: '🎨', demo: true },
  ];

  return (
    <aside className="w-64 bg-gray-900 dark:bg-gray-950 text-white min-h-screen flex flex-col shadow-lg transition-colors">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700 dark:border-gray-800">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          SaaS
        </h2>
        <p className='text-gray-400 dark:text-gray-500 text-xs mt-1'>Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-8 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-4 px-6 py-3 transition font-medium ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-r-4 border-blue-400'
                : 'text-gray-300 dark:text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      {/*Footer */}
      <div className='p-6 border-gray-700 dark:border-gray-800 dark:bg-gray-900 bg-gray-800'>
        <p className='text-xs text-gray-500 dark:text-gray-600 text-center'>
          © 2026 SaaS Dashboard
        </p>
      </div>
    </aside>
  );
}