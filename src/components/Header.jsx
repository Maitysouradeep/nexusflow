import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import RoleBadge from './RoleBadge';

export default function Header({ user, userRole, onLogout }) {
  const {isDarkMode, toggleDarkMode} = useDarkMode();
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      <div className='max-w-full px-6 py-4 flex justify-between items-center' >
        <div>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
          Dashboard
        </h1>
        </div>

        <div className='flex items-center space-x-6'>
          <div className='text-right'>
            <p className='text-gray-800 dark:text-gray-200 font-semibold text-sm'>{user?.firstName} {user?.lastName}</p>
            <p className='text-gray-500 dark:text-gray-400 text-xs'>{user?.email}</p>
          </div>

          <div className='hidden sm:block'>
            <RoleBadge role={userRole} size='small'/>
          </div>
          <div className='w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg'>
            {user?.firstName?.[0]}
          </div>

          {/* Dark Mode Toggle */}
          <button 
          onClick={toggleDarkMode}
          title='Toggle Dark Mode'
          className='bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hoverbg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg transition font-semibold text-sm'
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <button 
           onClick={onLogout}
           className='bg-red-500 dark:bg-gray-700 hover:bg-gray-300 text-white px-4 py-2 rounded-lg transition font-semibold text-sm '
          >
            Logout
          </button>
        </div>
        
      </div>
    </header>      
  );
}