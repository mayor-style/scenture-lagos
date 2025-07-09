import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * ProtectedRoute component to protect routes that require authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string|string[]} [props.requiredRoles] - Optional roles required to access the route
 * @param {string} [props.redirectTo='/admin/login'] - Path to redirect to if not authenticated
 */
const ProtectedRoute = ({
  children,
  requiredRoles,
  redirectTo = '/admin/login'
}) => {
  const { currentUser, loading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRoles && !hasRole(requiredRoles)) {
    // Redirect to unauthorized page or dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children if authenticated and authorized
  return children;
};

export default ProtectedRoute;