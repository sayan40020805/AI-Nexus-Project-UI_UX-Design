import React from 'react';
import { useAuth } from '../context/AuthContext';

// Component to conditionally render content based on user role
export const RoleBasedComponent = ({ 
  requiredRole, 
  children, 
  fallback = null,
  multipleRoles = null 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or return a loading spinner
  }

  if (!user) {
    return fallback;
  }

  let hasAccess = false;

  if (multipleRoles) {
    hasAccess = multipleRoles.includes(user.role);
  } else {
    hasAccess = user.role === requiredRole;
  }

  return hasAccess ? children : fallback;
};

// Component for company-only content
export const CompanyOnly = ({ children, fallback = null }) => {
  return (
    <RoleBasedComponent requiredRole="company" fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
};

// Component for user-only content
export const UserOnly = ({ children, fallback = null }) => {
  return (
    <RoleBasedComponent requiredRole="user" fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
};

// Component that shows different content for different roles
export const RoleBasedContent = ({ 
  companyContent, 
  userContent, 
  defaultContent = null 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return defaultContent;
  }

  return user.role === 'company' ? companyContent : userContent;
};

// Hook for role-based logic
export const useUserRole = () => {
  const { user, loading } = useAuth();
  
  return {
    user,
    loading,
    isCompany: user?.role === 'company',
    isUser: user?.role === 'user',
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role),
  };
};

// Component for navigation items
export const RoleBasedNavItem = ({ 
  item, 
  isActive, 
  onClick,
  companyIcon,
  userIcon,
  defaultIcon
}) => {
  const { user } = useAuth();

  const getIcon = () => {
    if (!user) return defaultIcon;
    
    switch (user.role) {
      case 'company':
        return companyIcon || item.icon;
      case 'user':
        return userIcon || item.icon;
      default:
        return defaultIcon || item.icon;
    }
  };

  return (
    <div
      className={`nav-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(item.section)}
    >
      <span className="nav-icon">{getIcon()}</span>
      <span className="nav-text">{item.label}</span>
    </div>
  );
};

export default RoleBasedComponent;
