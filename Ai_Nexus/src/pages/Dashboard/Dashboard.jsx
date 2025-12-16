
import React, { useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserDashboard from './UserDashboard';
import CompanyDashboard from './CompanyDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  // Redirect to appropriate dashboard based on user role
  if (!loading && user) {
    const tab = searchParams.get('tab');
    const userRole = user.role;

    // If no tab specified or wrong tab, redirect to correct one
    if (!tab || (tab === 'user' && userRole !== 'user') || (tab === 'company' && userRole !== 'company')) {
      const correctTab = userRole === 'company' ? 'company' : 'user';
      return <Navigate to={`/dashboard?tab=${correctTab}`} replace />;
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated (should be handled by ProtectedRoute, but just in case)
  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  const currentTab = searchParams.get('tab');
  
  if (currentTab === 'company' || user.role === 'company') {
    return <CompanyDashboard />;
  } else {
    return <UserDashboard />;
  }
};

export default Dashboard;
