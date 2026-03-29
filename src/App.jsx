import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';
import Sidebar from './components/Sidebar';
import ActivityLog from './components/ActivityLog';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="flex h-screen">
                  <Sidebar userRole="user" />
                  <div className="flex-1 overflow-auto">
                    <UserProfile />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <div className="flex h-screen">
                  <Sidebar userRole="admin" />
                  <div className="flex-1 overflow-auto">
                    <AdminPanel />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <ActivityLog/>
            </ProtectedRoute>
          }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;