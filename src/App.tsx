import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TaskManagement from './pages/Admin/TaskManagement';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import MyTasks from './pages/Employee/MyTasks';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace /> : <Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/tasks" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <TaskManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <div className="p-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-600 mt-2">Manage system users and permissions</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin/departments" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Department Management</h1>
            <p className="text-gray-600 mt-2">Manage departments and organizational structure</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin/projects" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Project Management</h1>
            <p className="text-gray-600 mt-2">Manage projects and assignments</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">View performance reports and analytics</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <div className="p-6">
            <h1 className="text-2xl font-bold">System Settings</h1>
            <p className="text-gray-600 mt-2">Configure system settings and preferences</p>
          </div>
        </ProtectedRoute>
      } />

      {/* Employee Routes */}
      <Route path="/employee" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/employee/tasks" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <MyTasks />
        </ProtectedRoute>
      } />
      <Route path="/employee/logs" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Time Logs</h1>
            <p className="text-gray-600 mt-2">View your time logs and activity history</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/employee/settings" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <div className="p-6">
            <h1 className="text-2xl font-bold">My Settings</h1>
            <p className="text-gray-600 mt-2">Manage your profile and preferences</p>
          </div>
        </ProtectedRoute>
      } />

      {/* Default redirects */}
      <Route path="/" element={
        <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/employee') : '/login'} replace />
      } />
      <Route path="*" element={
        <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/employee') : '/login'} replace />
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#22C55E',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
};

export default App;