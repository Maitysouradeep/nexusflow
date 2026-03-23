import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Dashboard() {
  const { user, userRole, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Header user={userData} userRole={userRole} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Welcome, {userData?.firstName}!
            </h1>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-800">$45,280</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-gray-500 text-sm font-semibold mb-2">Active Users</h3>
                <p className="text-3xl font-bold text-gray-800">1,234</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-gray-500 text-sm font-semibold mb-2">Growth Rate</h3>
                <p className="text-3xl font-bold text-green-600">+23%</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-gray-500 text-sm font-semibold mb-2">Your Role</h3>
                <p className="text-3xl font-bold text-blue-600 capitalize">{userRole}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="text-gray-800 font-semibold">{userData?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Full Name</p>
                  <p className="text-gray-800 font-semibold">
                    {userData?.firstName} {userData?.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}