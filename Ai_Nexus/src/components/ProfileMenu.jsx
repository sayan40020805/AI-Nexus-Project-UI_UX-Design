import React, { useState } from 'react';
import { User, Settings, LogOut, BarChart3, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfileMenu({ onCloseSidebar }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate('/dashboard');
    onCloseSidebar?.();
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      onClick: handleDashboardClick,
      isPrimary: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => console.log('Settings clicked'),
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      onClick: () => console.log('Logout clicked'),
      isDestructive: true
    }
  ];

  return (
    <div className="profile-menu">
      <button
