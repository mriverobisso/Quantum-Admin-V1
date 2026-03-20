import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PreviewModal from './PreviewModal';
import GlobalFormModal from './GlobalFormModal';
import AIChatPanel from './AIChatPanel';
import './Layout.css';

const Layout = () => {
  const { state } = useGlobalContext();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isAIChatOpen, setAIChatOpen] = useState(false);
  const location = useLocation();

  const currentUser = state.currentUser || {};
  const isAdmin = currentUser.role === 'Administrador';

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleMobileSidebar = () => setMobileOpen(!isMobileOpen);

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile backdrop */}
      <div 
        className={`sidebar-backdrop ${isMobileOpen ? 'visible' : ''}`} 
        onClick={() => setMobileOpen(false)} 
      />

      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)} 
        isMobileOpen={isMobileOpen}
      />
      
      <div className="main-wrapper">
        <TopBar onMobileMenuToggle={toggleMobileSidebar} />
        
        <main className="main-content">
          <Outlet />
          
          {/* AI Chat FAB - Admin Only */}
          {isAdmin && (
            <button 
              className="fab-ai" 
              aria-label="Quantum AI" 
              onClick={() => setAIChatOpen(!isAIChatOpen)}
              style={isAIChatOpen ? { background: 'linear-gradient(135deg, #2a9d8f, #2575fc)', boxShadow: '0 4px 20px rgba(37,117,252,0.4)' } : {}}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}
        </main>
      </div>

      <PreviewModal />
      <GlobalFormModal />

      {/* AI Chat Panel - Admin Only */}
      {isAdmin && (
        <AIChatPanel isOpen={isAIChatOpen} onClose={() => setAIChatOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
