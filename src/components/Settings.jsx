import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useDarkMode } from '../context/DarkModeContext';

export default function Settings() {
  const { user, userRole, logout } = useAuth();
  const [ userData,  setUserData ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    try{
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()){
        setUserData(userDoc.data());
      }
    } catch (error){
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false); 
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if(loading){
    return(
      <div className='flex h-screen bg-gray-100'>
        <Sidebar userRole={userRole}/>
        <div className='flex-1 flex flex-col'>
          <Header user={userData} userRole={userRole} onLogout={handleLogout}/>
          <div className='flex items-center justify-center flex-1'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 broder-blue-500'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Header user={userData} userRole={userRole} onLogout={logout} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive email updates about your account</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>
                <hr />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Appearance</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Dark Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark theme (coming soon)</p>
                </div>
                <button
                 onClick={() => toggleDarkMode()}
                 className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isDarkMode
                     ? 'bg-blue-600 text-white'
                     : 'bg-gray-200 text-gray-800'
                }`}
                >
                  {isDarkMode ? '🌙 Dark' : '☀️ Light'}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
              <h2 className="text-xl font-bold text-red-800 mb-4">Danger Zone</h2>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                Delete Account
              </button>
              <p className="text-sm text-red-700 mt-2">This action cannot be undone</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}