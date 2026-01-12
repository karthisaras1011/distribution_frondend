import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Create this component

export default function ProtectedRoute({ children, requiredRole }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <LoadingSpinner />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRole && auth.userType !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}