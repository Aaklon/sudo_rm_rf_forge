import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect admin users to admin panel (if you create one)
  if (userProfile?.role === 'admin' && window.location.pathname !== '/admin') {
    // For now, just allow them to see regular pages
    // return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
