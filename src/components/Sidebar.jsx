import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdBrush, 
  MdCode, 
  MdPeople, 
  MdAttachMoney,
  MdSettings, 
  MdAdminPanelSettings,
  MdLogout,
  MdMenu,
  MdSupportAgent
} from 'react-icons/md';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="logo-icon">Q</div>
          {!isCollapsed && <h2>Quantum OS</h2>}
        </div>
        <button className="burger-btn" onClick={toggleSidebar}>
          <MdMenu />
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} end title="Dashboard">
          <MdDashboard className="nav-icon" /> {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        {!isCollapsed && <div className="nav-section">OPERACIONES</div>}
        <NavLink to="/studio" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} title="RRSS">
          <MdBrush className="nav-icon brand-studio" /> {!isCollapsed && <span>RRSS</span>}
        </NavLink>
        <NavLink to="/design" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} title="Diseño">
          <MdBrush className="nav-icon brand-studio" style={{ color: 'var(--text-muted)' }} /> {!isCollapsed && <span>Diseño</span>}
        </NavLink>

        <NavLink to="/tech" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} title="Host">
          <MdCode className="nav-icon brand-tech" /> {!isCollapsed && <span>Host</span>}
        </NavLink>
        
        <NavLink to="/support" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} title="Soporte">
          <MdSupportAgent className="nav-icon brand-support" /> {!isCollapsed && <span>Soporte</span>}
        </NavLink>

        {!isCollapsed && <div className="nav-section">COMERCIAL</div>}
        <NavLink to="/crm" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} title="CRM">
          <MdPeople className="nav-icon brand-crm" /> {!isCollapsed && <span>CRM</span>}
        </NavLink>
        <NavLink to="/cotizador" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} title="Cotizador">
          <MdAttachMoney className="nav-icon brand-crm" /> {!isCollapsed && <span>Cotizador</span>}
        </NavLink>

        <NavLink to="/finances" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} title="Finanzas">
          <MdAttachMoney className="nav-icon brand-finance" /> {!isCollapsed && <span>Finanzas</span>}
        </NavLink>

        <div className="nav-divider"></div>

        <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} title="Administración">
          <MdAdminPanelSettings className="nav-icon" /> {!isCollapsed && <span>Administración</span>}
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} title="Configuración">
          <MdSettings className="nav-icon" /> {!isCollapsed && <span>Configuración</span>}
        </NavLink>

        <button className="nav-item logout-btn" onClick={handleLogout} title="Cerrar Sesión">
          <MdLogout className="nav-icon" /> {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
