import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PreviewModal from './PreviewModal';
import GlobalFormModal from './GlobalFormModal';
import './Layout.css';

const Layout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)} />
      
      <div className="main-wrapper">
        <TopBar />
        
        <main className="main-content">
          <Outlet />
          
          <button className="fab-ai" aria-label="Quantum AI">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </main>
      </div>

      <PreviewModal />
      <GlobalFormModal />
    </div>
  );
};

export default Layout;
