import { useAuth } from '../context/AuthContext';

// Component that only renders for company users
export function CompanyOnly({ children }) {
  const { user } = useAuth();
  
  if (user?.role === 'company') {
    return children;
  }
  
  return null;
}

// Component that only renders for regular users
export function UserOnly({ children }) {
  const { user } = useAuth();
  
  if (user?.role === 'user') {
    return children;
  }
  
  return null;
}

// Component that renders for both user and company
export function UserOrCompany({ children }) {
  const { user } = useAuth();
  
  if (user?.role === 'user' || user?.role === 'company') {
    return children;
  }
  
  return null;
}

// Hook for role-based logic
export function useRolePermissions() {
  const { user } = useAuth();
  
  return {
    isUser: user?.role === 'user',
    isCompany: user?.role === 'company',
    isAuthenticated: !!user,
    canCreateJobs: user?.role === 'company',
    canCreateEvents: user?.role === 'company',
    canApplyForJobs: user?.role === 'user',
    canRegisterForEvents: user?.role === 'user' || user?.role === 'company',
    canViewApplicants: user?.role === 'company',
    canViewParticipants: user?.role === 'company'
  };
}

export default {
  CompanyOnly,
  UserOnly,
  UserOrCompany,
  useRolePermissions
};
