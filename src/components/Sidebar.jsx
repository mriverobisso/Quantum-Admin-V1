import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalContext';
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
  MdSupportAgent,
  MdGroup
} from 'react-icons/md';
import './Sidebar.css';

// Module keys match what's stored in user permissions
const NAV_ITEMS = [
  { to: '/', icon: MdDashboard, label: 'Dashboard', module: 'dashboard', end: true },
  { section: 'OPERACIONES' },
  { to: '/studio', icon: MdBrush, label: 'RRSS', module: 'rrss', iconClass: 'brand-studio' },
  { to: '/design', icon: MdBrush, label: 'Diseño', module: 'design', iconStyle: { color: 'var(--text-muted)' }, iconClass: 'brand-studio' },
  { to: '/tech', icon: MdCode, label: 'Host', module: 'host', iconClass: 'brand-tech' },
  { to: '/support', icon: MdSupportAgent, label: 'Soporte', module: 'soporte', iconClass: 'brand-support' },
  { section: 'COMERCIAL' },
  { to: '/crm', icon: MdPeople, label: 'CRM', module: 'crm', iconClass: 'brand-crm' },
  { to: '/cotizador', icon: MdAttachMoney, label: 'Cotizador', module: 'cotizador', iconClass: 'brand-crm' },
  { to: '/finances', icon: MdAttachMoney, label: 'Finanzas', module: 'finanzas', iconClass: 'brand-finance' },
  { divider: true },
  { to: '/usuarios', icon: MdGroup, label: 'Usuarios', module: 'usuarios', adminOnly: true },
  { to: '/admin', icon: MdAdminPanelSettings, label: 'Administración', module: 'admin' },
  { to: '/settings', icon: MdSettings, label: 'Configuración', module: 'config' },
];

const Sidebar = ({ isCollapsed, toggleSidebar, isMobileOpen }) => {
  const navigate = useNavigate();
  const { state } = useGlobalContext();
  const currentUser = state.currentUser || {};
  const userPermissions = currentUser.permissions || {};
  const isAdmin = currentUser.role === 'Administrador';

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const canSee = (item) => {
    // Admin sees everything
    if (isAdmin || !currentUser.id) return true;
    // Admin-only items
    if (item.adminOnly) return false;
    // Check module permission
    if (item.module && userPermissions[item.module] === false) return false;
    return true;
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
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
        {NAV_ITEMS.map((item, idx) => {
          if (item.section) {
            if (isCollapsed) return null;
            return <div key={idx} className="nav-section">{item.section}</div>;
          }
          if (item.divider) {
            return <div key={idx} className="nav-divider"></div>;
          }
          if (!canSee(item)) return null;

          const Icon = item.icon;
          return (
            <NavLink 
              key={idx} 
              to={item.to} 
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} 
              end={item.end} 
              title={item.label}
            >
              <Icon className={`nav-icon ${item.iconClass || ''}`} style={item.iconStyle} /> 
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        <button className="nav-item logout-btn" onClick={handleLogout} title="Cerrar Sesión">
          <MdLogout className="nav-icon" /> {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
