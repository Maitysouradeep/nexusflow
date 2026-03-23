import React from 'react';

export default function Header({ user, userRole, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 shadow">
      <div className="max-w-full px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SaaS Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {user?.firstName}</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-gray-800 font-semibold text-sm">{user?.email}</p>
            <p className="text-gray-500 text-xs capitalize">{userRole}</p>
          </div>

          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}