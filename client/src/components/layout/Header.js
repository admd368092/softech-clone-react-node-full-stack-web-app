import React from 'react';
import { MdMenu, MdLogout, MdNotifications } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'م';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className={`header ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
      <div className="header-left">
        <button 
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <MdMenu />
        </button>
        <h2 className="header-title">نظام إدارة الأعمال الذكي</h2>
      </div>
      
      <div className="header-right">
        <button className="action-btn" aria-label="Notifications">
          <MdNotifications />
        </button>
        
        <div className="user-info">
          <div className="user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name || 'مستخدم'}</div>
            <div className="user-role">
              {user?.role === 'admin' ? 'مدير' : 
               user?.role === 'manager' ? 'مسؤول' : 'موظف'}
            </div>
          </div>
        </div>
        
        <button 
          className="logout-btn"
          onClick={logout}
          aria-label="تسجيل الخروج"
          title="تسجيل الخروج"
        >
          <MdLogout />
        </button>
      </div>
    </header>
  );
};

export default Header;
