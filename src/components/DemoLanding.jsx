import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';

export default function DemoLanding() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors`}>
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm transition-colors`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SaaS Dashboard
          </h1>
          <button
            onClick={toggleDarkMode}
            className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <div className={`max-w-6xl mx-auto px-6 py-16`}>
        <h2 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-6`}>
          Welcome to the SaaS Dashboard Demo
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mb-8`}>
          Explore the design and features of our modern SaaS dashboard
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/demo/admin" className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'} p-8 rounded-lg shadow-lg transition`}>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>👑 Admin Panel</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Manage users, view statistics, and control the platform</p>
          </Link>

          <Link to="/demo/analytics" className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'} p-8 rounded-lg shadow-lg transition`}>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>📊 Analytics</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>View charts, metrics, and business intelligence</p>
          </Link>

          <Link to="/login" className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'} p-8 rounded-lg shadow-lg transition`}>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>🔐 Login</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Sign in to your account with protected routes</p>
          </Link>

          <Link to="/register" className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'} p-8 rounded-lg shadow-lg transition`}>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>📝 Register</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Create a new account and get started</p>
          </Link>
        </div>
      </div>
    </div>
  );
}