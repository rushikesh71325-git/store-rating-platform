import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Feature Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StoresPage from './pages/StoresPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminStoresPage from './pages/AdminStoresPage';
import AdminUsersPage from './pages/AdminUsersPage';
import StoreOwnerDashboardPage from './pages/StoreOwnerDashboardPage';

/**
 * Root Index Redirector based on authenticated user role
 */
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'STORE_OWNER') {
    return <Navigate to="/owner" replace />;
  }

  return <Navigate to="/stores" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Root Role Redirector */}
          <Route path="/" element={<RootRedirect />} />

          {/* Authenticated Routes with Shared Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Normal User Routes */}
              <Route path="/stores" element={<StoresPage />} />

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/stores" element={<AdminStoresPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>

              {/* Store Owner Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
                <Route path="/owner" element={<StoreOwnerDashboardPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
