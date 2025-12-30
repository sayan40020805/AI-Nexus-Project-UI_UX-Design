
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role (supports both single role and array of roles)
  const checkRoleAccess = () => {
    if (!requiredRole && !allowedRoles) return true;
    
    if (allowedRoles && Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    
    if (requiredRole) {
      return user.role === requiredRole;
    }
    
    return true;
  };

  // If specific role required, check user's role
  if (!checkRoleAccess()) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user.role === 'company' ? '/dashboard?tab=company' : '/dashboard?tab=user';
    return <Navigate to={redirectPath} replace />;
  }

  // For dashboard routes, ensure proper role-based redirect
  if (location.pathname === '/dashboard') {
    const expectedTab = user.role === 'company' ? 'company' : 'user';
    const currentTab = new URLSearchParams(location.search).get('tab');
    
    if (currentTab !== expectedTab) {
      const redirectPath = `/dashboard?tab=${expectedTab}`;
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

// Hook to check if user has required role
export const useRole = (requiredRoles) => {
  const { user, loading } = useAuth();
  
  if (loading) return false;
  if (!user) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }
  
  return user.role === requiredRoles;
};

export default ProtectedRoute;
