import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, where, query } from 'firebase/firestore';
import { db } from '../firebase';
import { logActivity } from '../utils/activityLogger';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import RoleBadge from './RoleBadge';

export default function AdminPanel() {
  const { user, userRole, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    regularUsers: 0,
  });

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);

      // Calculate stats
      setStats({
        totalUsers: usersList.length,
        admins: usersList.filter(u => u.role === 'admin').length,
        regularUsers: usersList.filter(u => u.role === 'user').length,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      // Log activity
      await logActivity(user.uid, 'admin_action', {
        action: 'role_changed',
        targetUserId: userId,
        newRole: newRole,
      });

      fetchAllUsers();
      setMessage(`User role changed to ${newRole}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating role: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'users', userId));

        // Log activity
        await logActivity(user.uid, 'admin_action', {
          action: 'user_deleted',
          deletedUserId: userId,
          deletedUserName: userName,
        });

        fetchAllUsers();
        setMessage(`User ${userName} deleted successfully`);
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Error deleting user: ' + error.message);
      }
    }
  };

  // Filter and search users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || u.role === filterRole;

    return matchesSearch && matchesRole;
  });

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
      <div className="flex-1 flex flex-col">
        <Header user={{ firstName: user?.displayName || 'Admin' }} userRole={userRole} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

            {message && (
              <div className={`mb-4 px-4 py-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
                <h3 className="text-gray-500 text-sm font-semibold mb-2">Admins</h3>
                <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
                <h3 className="text-gray-500 text-sm font-semibold mb-2">Regular Users</h3>
                <p className="text-3xl font-bold text-green-600">{stats.regularUsers}</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Search Users</label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Filter by Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins Only</option>
                    <option value="user">Users Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">{user.firstName} {user.lastName}</td>
                      <td className="px-6 py-3 text-sm">{user.email}</td>
                      <td className="px-6 py-3">
                        <RoleBadge role={user.role} size="small" />
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="user">Make User</option>
                            <option value="admin">Make Admin</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="bg-gray-100 rounded-lg p-8 text-center mt-4">
                <p className="text-gray-600 font-semibold">No users found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}