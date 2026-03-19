import React from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd, MdComment, MdCheckCircle, MdPestControl, MdEdit, MdDelete } from 'react-icons/md';
import './GridModules.css';

const getTicketSemaphore = (reportDate, status) => {
  if (status === 'resuelto') return 'ok';
  const diffHours = Math.ceil((new Date() - new Date(reportDate)) / (1000 * 60 * 60));
  if (diffHours > 48) return 'danger';
  if (diffHours > 24) return 'warning';
  return 'ok'; 
};

const Soporte = () => {
  const { state, setState, addLog, setPreview, openFormModal, deleteItem } = useGlobalContext();
  const { tickets, clients } = state;

  const handleResolve = (ticketId) => {
    setState(prev => {
      const newItems = prev.tickets.map(t => 
        t.id === ticketId ? { ...t, status: 'resuelto' } : t
      );
      return { ...prev, tickets: newItems };
    });
    addLog(`Cerró satisfactoriamente el ticket ${ticketId}`);
  };

  return (
    <div className="page-container host-container">
      <header className="page-header module-header">
        <div>
          <h1>Mesa de Ayuda (Soporte)</h1>
          <p className="subtitle">Gestión de incidencias y SLA</p>
        </div>
        <button className="btn-primary" onClick={() => openFormModal('new_ticket')}><MdAdd /> Registrar Falla</button>
      </header>

      <div className="grid-module-layout">
        {tickets.map(item => {
          const client = clients.find(c => c.id === item.clientId);
          const colorState = getTicketSemaphore(item.reportDate, item.status);
          const diffHours = Math.ceil((new Date() - new Date(item.reportDate)) / (1000 * 60 * 60));
          
          return (
            <div key={item.id} className="module-card" style={{ borderTop: `4px solid var(--status-${colorState})` }}>
              <div className="card-top-actions">
                 <button className="icon-btn edit" title="Editar" onClick={() => openFormModal('edit_ticket', item)}><MdEdit /></button>
                 <button className="icon-btn danger" title="Eliminar" onClick={() => deleteItem('tickets', item.id)}><MdDelete /></button>
                 <button className="icon-btn" title="Detalles del Ticket" onClick={() => setPreview('ticket', item.id)}><MdComment /></button>
              </div>
              
              <div className="module-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                   <span className="code-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{item.id}</span>
                   <span className={`badge ${item.status.replace(' ', '-')}`}>{item.status}</span>
                </div>
                
                <h3 className="card-title" style={{ fontSize: '1rem', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                   <MdPestControl style={{ color: 'var(--text-muted)', marginTop: '2px' }}/>
                   {item.detail}
                </h3>
                
                <p className="mt-2" style={{ fontSize: '0.9rem' }}>
                   <strong>Reporta:</strong> <span className="clickable-text" onClick={() => setPreview('client', client?.id)}>{client?.name || 'Desconocido'}</span>
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                   {item.priority && <span className={`badge ${item.priority === 'Crítico' ? 'danger' : item.priority === 'Bajo' ? 'idea' : 'in-progress'}`}>{item.priority}</span>}
                   {item.category && <span className="badge" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>{item.category}</span>}
                </div>

                <div className="card-detail mt-2" style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '6px' }}>
                   <p style={{ margin: 0 }}><strong>Apertura:</strong> {new Date(item.reportDate).toLocaleString()}</p>
                   {item.status !== 'resuelto' && (
                      <p style={{ margin: '0.2rem 0 0 0', color: `var(--status-${colorState})`, fontWeight: 600 }}>
                        Tiempo en espera: {diffHours}h
                      </p>
                   )}
                </div>
              </div>

              {item.status !== 'resuelto' && (
                <div className="module-card-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                   <button 
                     className="btn-primary" 
                     style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--status-ok)', border: '1px solid var(--border-color)' }}
                     onClick={() => handleResolve(item.id)}
                   >
                     <MdCheckCircle /> Marcar Resuelto
                   </button>
                </div>
              )}
            </div>
          );
        })}
        {tickets.length === 0 && (
           <div className="empty-grid-state" style={{ padding: '4rem', gridColumn: '1 / -1' }}>
             <h3> Bandeja Limpia</h3>
             <p>No se perciben bloqueos reportados ni fallas generalizadas.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Soporte;
