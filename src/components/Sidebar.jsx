import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ userRole }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/activity', label: 'Activity Log', icon: '📋' },
    ...(userRole === 'admin' ? [
      { path: '/admin', label: 'Admin Panel', icon: '⚙️' },
    ] : []),
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold">SaaS</h2>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-4 px-6 py-3 transition ${
              isActive(item.path)
                ? 'bg-blue-600 border-r-4 border-blue-400'
                : 'hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}