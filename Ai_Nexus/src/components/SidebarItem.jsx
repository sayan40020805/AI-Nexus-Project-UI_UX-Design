import React from 'react';
import { ChevronRight } from 'lucide-react';

export function SidebarItem({ 
  item, 
  isActive, 
  onClick, 
  className = '',
  showArrow = true 
}) {
  const Icon = item.icon;
  
  return (
    <button
      className={`nav-item ${isActive ? 'active' : ''} ${className}`}
      onClick={() => onClick(item.id)}
    >
      <div className="nav-item-icon-wrapper">
        {Icon && <Icon className="nav-item-icon" />}
        {isActive && <div className="nav-item-indicator" />}
      </div>
      
      <span className="nav-item-label">{item.label}</span>
      
      {showArrow && isActive && (
        <ChevronRight className="nav-item-arrow" />
      )}
    </button>
  );
}
