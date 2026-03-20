import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalContext';
import { MdCheckCircle, MdWarning, MdInfo, MdSupportAgent, MdAttachMoney, MdOutlineDns } from 'react-icons/md';
import './Dashboard.css';

const getSemaphoreColor = (dueDate) => {
  if (!dueDate) return 'var(--text-muted)';
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'var(--status-danger)';
  if (diffDays <= 5) return 'var(--status-warning)';
  return 'var(--status-ok)';
};

const Dashboard = () => {
  const { state, setPreview } = useGlobalContext();
  const { clients, tasks, hostItems, tickets, finances, quotes, currentUser } = state;
  const navigate = useNavigate();

  // Calculo KPIs
  const openTickets = tickets.filter(t => t.status !== 'resuelto').length;
  
  const domainsExpiring = hostItems.filter(h => {
    if (!h.dueDate) return false;
    const diffDays = Math.ceil((new Date(h.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30; // Vencen en < 30 días
  }).length;

  const currentMonthRevenue = (quotes?.length ? quotes.reduce((acc, q) => acc + q.total, 0) : 0) + 
                              (hostItems?.length ? hostItems.reduce((acc, h) => acc + h.cost, 0) : 0);

  // Pendientes de la semana (próximos 7 días)
  const weekTasks = tasks.filter(t => {
     if(!t.dueDate || ['done', 'aprobado'].includes(t.status)) return false;
     const now = new Date();
     const due = new Date(t.dueDate);
     const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
     return diffDays >= 0 && diffDays <= 7;
  });

  // Alertas (Cumpleaños < 7 días, Renovaciones de Host < 30 días)
  const alerts = [];
  
  clients.forEach(c => {
    if(!c.birthday) return;
    const bday = new Date(c.birthday);
    const today = new Date();
    bday.setFullYear(today.getFullYear());
    const diffDays = Math.ceil((bday - today) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 7) {
       alerts.push({ id: `bday-${c.id}`, text: `El cliente ${c.name} cumple años en ${diffDays} días.`, type: 'info', clientId: c.id });
    }
  });

  hostItems.forEach(h => {
    if(!h.dueDate) return;
    const due = new Date(h.dueDate);
    const diffDays = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 30) {
       alerts.push({ id: `host-${h.id}`, text: `El dominio ${h.domain} vence en ${diffDays} días.`, type: 'warning', clientId: h.clientId });
    }
  });

  return (
    <div className="page-container dashboard">
      <header className="page-header">
        <div>
          <h1>Centro de Mando</h1>
          <p className="subtitle">Resumen de operaciones y alertas</p>
        </div>
      </header>

      {/* KPI Cards (Reengineered) */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => navigate('/support')}>
          <div className="metric-icon support" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
             <MdSupportAgent />
          </div>
          <div className="metric-info">
            <h3>{openTickets}</h3>
            <p>Tickets Abiertos</p>
          </div>
        </div>
        
        <div className="metric-card" onClick={() => navigate('/tech')}>
          <div className="metric-icon tech" style={{ backgroundColor: 'rgba(253, 126, 20, 0.1)', color: 'var(--status-warning)' }}>
             <MdOutlineDns />
          </div>
          <div className="metric-info">
            <h3>{domainsExpiring}</h3>
            <p>Dominios por Vencer</p>
          </div>
        </div>

        {currentUser?.role === 'Administrador' && (
          <div className="metric-card" onClick={() => navigate('/finances')}>
            <div className="metric-icon crm" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--status-ok)' }}>
               <MdAttachMoney />
            </div>
            <div className="metric-info">
              <h3>${currentMonthRevenue.toFixed(2)}</h3>
              <p>Facturación (Mes)</p>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-layout">
        <div className="main-column">
          <div className="card section-card">
            <div className="section-header">
              <h2>Tareas Críticas de la Semana ({weekTasks.length})</h2>
            </div>
            <div className="task-list">
               {weekTasks.map(t => (
                  <div key={t.id} className="task-item clickable" onClick={() => setPreview('task', t.id)} style={{ borderLeftColor: getSemaphoreColor(t.dueDate) }}>
                    <div className="task-info">
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <span className="badge" style={{ backgroundColor: 'var(--text-muted)' }}>{t.module}</span> 
                         {t.title}
                      </h4>
                      <span className="task-meta" style={{ marginTop: '0.4rem', display: 'block' }}>Vence: {new Date(t.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
               ))}
               {weekTasks.length === 0 && (
                 <div className="empty-state">No hay tareas pendientes en los próximos 7 días.</div>
               )}
            </div>
          </div>
        </div>

        <div className="side-column">
          <div className="card section-card alerts-card">
            <h2>Alertas de Seguimiento</h2>
            <div className="alert-list">
              {alerts.length > 0 ? alerts.map(a => (
                <div key={a.id} className={`alert-item ${a.type} clickable`} onClick={() => setPreview('client', a.clientId)}>
                  {a.type === 'warning' ? <MdWarning className="alert-icon" /> : <MdInfo className="alert-icon" />}
                  <p>{a.text}</p>
                </div>
              )) : (
                 <div className="alert-item success">
                    <MdCheckCircle className="alert-icon" />
                    <div>
                      <strong>Todo en orden</strong>
                      <p>No hay alertas pendientes</p>
                    </div>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
