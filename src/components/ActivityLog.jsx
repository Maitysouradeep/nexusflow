import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserActivityLogs, getAllActivityLogs } from '../utils/activityLogger';
import Header from './Header';
import Sidebar from './Sidebar';

export default function ActivityLog() {
  const { user, userRole, logout } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, [userRole]);

  const fetchActivities = async () => {
    try {
      let logs = [];
      if (userRole === 'admin') {
        logs = await getAllActivityLogs(100);
      } else {
        logs = await getUserActivityLogs(user.uid, 50);
      }
      setActivities(logs);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      'login': '🔓',
      'logout': '🔒',
      'profile_update': '✏️',
      'admin_action': '⚙️',
      'user_deleted': '🗑️',
      'role_changed': '👑',
      'user_created': '👤',
    };
    return icons[action] || '📝';
  };

  const getActionLabel = (action) => {
    const labels = {
      'login': 'Logged In',
      'logout': 'Logged Out',
      'profile_update': 'Profile Updated',
      'admin_action': 'Admin Action',
      'user_deleted': 'User Deleted',
      'role_changed': 'Role Changed',
      'user_created': 'User Created',
    };
    return labels[action] || action;
  };

  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(a => a.action === filterType);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Header user={{ firstName: user?.displayName || 'User' }} userRole={userRole} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {userRole === 'admin' ? 'All Activity Logs' : 'Your Activity Log'}
            </h1>

            {/* Filter Buttons */}
            <div className="mb-6 flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterType === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                All Activities
              </button>
              <button
                onClick={() => setFilterType('login')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterType === 'login' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Logins
              </button>
              <button
                onClick={() => setFilterType('profile_update')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterType === 'profile_update' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Profile Updates
              </button>
              {userRole === 'admin' && (
                <button
                  onClick={() => setFilterType('admin_action')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filterType === 'admin_action' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Admin Actions
                </button>
              )}
            </div>

            {/* Activity List */}
            <div className="space-y-2">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((log) => (
                  <div key={log.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-lg transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getActionIcon(log.action)}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{getActionLabel(log.action)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              {JSON.stringify(log.details)}
                            </p>
                          )}
                        </div>
                      </div>
                      {userRole === 'admin' && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-mono">{log.userId.substring(0, 8)}...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-600 font-semibold">No activities found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}