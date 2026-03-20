import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdNotifications, MdSearch, MdMenu } from 'react-icons/md';
import './TopBar.css';

const TopBar = ({ onMobileMenuToggle }) => {
  const [time, setTime] = useState('');
  const { state, syncStatus } = useGlobalContext();

  const currentUser = state.currentUser || {};

  const syncIndicator = {
    synced: { color: '#28a745', label: '● Sync' },
    connecting: { color: '#fd7e14', label: '◌ Conectando...' },
    offline: { color: '#dc3545', label: '○ Offline' }
  }[syncStatus || 'connecting'];

  useEffect(() => {
    const updateClock = () => {
      const options = { timeZone: 'America/Guayaquil', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      const formatter = new Intl.DateTimeFormat('es-EC', options);
      setTime(formatter.format(new Date()));
    };
    
    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const { tasks, tickets } = state;
  const allWorkItems = [...tasks, ...tickets.map(tk => ({ ...tk, status: tk.status === 'abierto' ? 'idea' : (tk.status === 'en proceso' ? 'in_progress' : 'done') }))];
  
  const counts = {
    pending: allWorkItems.filter(i => ['idea', 'backlog', 'abierto', 'pendiente'].includes(i.status?.toLowerCase())).length,
    inProgress: allWorkItems.filter(i => ['in_progress', 'produccion', 'en proceso'].includes(i.status?.toLowerCase())).length,
    done: allWorkItems.filter(i => ['done', 'aprobado', 'resuelto'].includes(i.status?.toLowerCase())).length
  };

  const initials = (currentUser.name || 'MQ').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="top-bar">
      <div className="top-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="mobile-hamburger" onClick={onMobileMenuToggle}>
          <MdMenu />
        </button>
        <div className="search-box">
          <MdSearch className="search-icon" />
          <input type="text" placeholder="Buscar clientes, tareas..." />
        </div>
      </div>

      <div className="top-center">
        <div className="counters-container">
          <div className="counter-badge pending">
             <span className="dot p"></span> Pendiente: {counts.pending}
          </div>
          <div className="counter-badge in-progress">
             <span className="dot i"></span> En curso: {counts.inProgress}
          </div>
          <div className="counter-badge done">
             <span className="dot d"></span> Listo: {counts.done}
          </div>
        </div>
      </div>

      <div className="top-right">
        <div className="clock-gmt5">
          <span>🇪🇨 {time}</span>
          <span style={{ fontSize: '0.7rem', color: syncIndicator.color, marginLeft: '0.5rem', fontWeight: 600 }}>{syncIndicator.label}</span>
        </div>
        <button className="icon-action-btn">
          <MdNotifications />
        </button>
        <div className="user-profile">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <span className="name">{currentUser.name || 'Mario Q.'}</span>
            <span className="role">{currentUser.role || 'Admin'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
