import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('role');

  if (!role) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role || '')) {
    // Redirect to home if user role is not permitted for this route
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
