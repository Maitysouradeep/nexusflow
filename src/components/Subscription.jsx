import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Subscription() {
  const { user, userRole, logout } = useAuth();
  const [ userData, setUserData ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if(!user) return;
    try{
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if(userDoc.exists()){
        setUserData(userDoc.data());
      }
    } catch (error){
      console.error('Error fetching user data:', error);
    }finally{
      setLoading(false);
    }
  
  };
  const handleLogout = async () =>{
  await logout();
  };

  if(loading){
    return(
      <div className='flex h-screen bg-gray-100'>
        <Sidebar userRole={userRole} />
        <div className='flex-1 flex flex-col'>
          <Header user={userData} userRole={userRole} onLogout={handleLogout} />
          <div className='flex items-center justify-center flex-1'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
          </div>
        </div>
      </div>
    )
  }

  

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Header user={userData} userRole={userRole} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Subscription Plans</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Free</h2>
                <p className="text-gray-600 mb-4">$0/month</p>
                <button className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold mb-6">Current Plan</button>
                <ul className="space-y-2">
                  <li className="text-gray-700">✓ 5 Users</li>
                  <li className="text-gray-700">✓ Basic Analytics</li>
                  <li className="text-gray-700">✓ Community Support</li>
                  <li className="text-gray-400">✗ Advanced Features</li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white transform scale-105">
                <h2 className="text-2xl font-bold mb-2">Pro</h2>
                <p className="mb-4">$29/month</p>
                <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-semibold mb-6 hover:bg-gray-100">Upgrade Now</button>
                <ul className="space-y-2">
                  <li>✓ 50 Users</li>
                  <li>✓ Advanced Analytics</li>
                  <li>✓ Priority Support</li>
                  <li>✓ API Access</li>
                </ul>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Enterprise</h2>
                <p className="text-gray-600 mb-4">Custom pricing</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold mb-6 hover:bg-blue-700">Contact Sales</button>
                <ul className="space-y-2">
                  <li className="text-gray-700">✓ Unlimited Users</li>
                  <li className="text-gray-700">✓ Custom Analytics</li>
                  <li className="text-gray-700">✓ Dedicated Support</li>
                  <li className="text-gray-700">✓ Custom Integrations</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}