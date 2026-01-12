// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes';
import EmployeeRoutes from './routes/EmployeeRoutes';
import Login from './utils/login';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastProvider from './components/ToastProvider';
import SuperAdminRoutes from './superAdmin/superAdminRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRoutes />
            </ProtectedRoute>
          } />
          
          <Route path="/employee/*" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeRoutes />
            </ProtectedRoute>
          } />
          
          <Route path="/super_admin/*" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminRoutes />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;