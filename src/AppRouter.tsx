import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// SSP Pages
import SSPDashboard from './pages/ssp/Dashboard';
import SSPAddRecord from './pages/ssp/AddRecord';
import SSPViewRecords from './pages/ssp/ViewRecords';
import SSPProfile from './pages/ssp/Profile';
// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUserManagement from './pages/admin/UserManagement';
import AdminRecordManagement from './pages/admin/RecordManagement';
// Layout
import Layout from './components/Layout';
export function AppRouter() {
  return <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected SSP Routes */}
        <Route path="/ssp" element={<ProtectedRoute role="ssp">
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<SSPDashboard />} />
          <Route path="add-record" element={<SSPAddRecord />} />
          <Route path="records" element={<SSPViewRecords />} />
          <Route path="profile" element={<SSPProfile />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin">
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="records" element={<AdminRecordManagement />} />
        </Route>

        {/* Redirect to login if not authenticated */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>;
}
// Protected route component
function ProtectedRoute({
  children,
  role
}) {
  const {
    user,
    isAuthenticated
  } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/ssp'} replace />;
  }
  return children;
}