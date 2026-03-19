import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdCake, MdEmail, MdPhone, MdBusiness, MdLocationOn } from 'react-icons/md';
import './GridModules.css';

const CRM = () => {
  const { state, setPreview, openFormModal, deleteItem } = useGlobalContext();
  const { clients = [], tasks = [], tickets = [], hostItems = [] } = state;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.ruc.includes(searchTerm) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get activity counts for a client
  const getActivityCount = (clientId) => {
    const taskCount = tasks.filter(t => t.clientId === clientId).length;
    const ticketCount = tickets.filter(t => t.clientId === clientId).length;
    const hostCount = hostItems.filter(h => h.clientId === clientId).length;
    return { taskCount, ticketCount, hostCount, total: taskCount + ticketCount + hostCount };
  };

  return (
    <div className="page-container crm-container">
      <header className="page-header module-header">
        <div>
          <h1>Directorio CRM</h1>
          <p className="subtitle">Gestión de clientes y servicios · {clients.length} registrados</p>
        </div>
        <div className="module-actions">
           <div className="search-box">
              <MdSearch className="search-icon" />
              <input 
                 type="text" 
                 placeholder="Buscar por nombre, RUC o email..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="btn-primary" onClick={() => openFormModal('new_client')}><MdAdd /> Registrar Cliente</button>
        </div>
      </header>

      <div className="grid-module-layout">
        {filteredClients.map(client => {
          const activity = getActivityCount(client.id);
          return (
            <div key={client.id} className="module-card">
              <div className="card-top-actions">
                 <button className="icon-btn edit" onClick={() => openFormModal('edit_client', client)}><MdEdit /></button>
                 <button className="icon-btn danger" onClick={() => deleteItem('clients', client.id)}><MdDelete /></button>
              </div>
              
              <div className="module-card-body" onClick={() => setPreview('client', client.id)}>
                <div className="client-avatar">{client.name.charAt(0)}</div>
                <h3 className="card-title">{client.name}</h3>
                <p className="card-detail code-text">{client.ruc}</p>
                
                {client.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    <MdEmail size={14} /> {client.email}
                  </div>
                )}
                {client.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <MdPhone size={14} /> {client.phone}
                  </div>
                )}
                {client.city && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <MdLocationOn size={14} /> {client.city}
                  </div>
                )}
                {client.contactPerson && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <MdBusiness size={14} /> {client.contactPerson} {client.contactRole ? `(${client.contactRole})` : ''}
                  </div>
                )}

                <div className="mt-2" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <MdCake /> <span style={{ fontSize: '0.85rem' }}>{client.birthday ? new Date(client.birthday).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="module-card-footer" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                <div className="services-tags">
                  {(client.services || []).map(s => (
                    <span key={s} className="tag-service">{s}</span>
                  ))}
                  {(!client.services || client.services.length === 0) && <span className="tag-empty">Sin servicios</span>}
                </div>
                {activity.total > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                    {activity.taskCount > 0 && <span style={{ backgroundColor: 'rgba(37,117,252,0.1)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '4px' }}>{activity.taskCount} tareas</span>}
                    {activity.ticketCount > 0 && <span style={{ backgroundColor: 'rgba(253,126,20,0.1)', color: 'var(--status-warning)', padding: '2px 6px', borderRadius: '4px' }}>{activity.ticketCount} tickets</span>}
                    {activity.hostCount > 0 && <span style={{ backgroundColor: 'rgba(40,167,69,0.1)', color: 'var(--status-ok)', padding: '2px 6px', borderRadius: '4px' }}>{activity.hostCount} hosts</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredClients.length === 0 && (
          <div className="empty-grid-state">No se encontraron clientes que coincidan.</div>
        )}
      </div>
    </div>
  );
};

export default CRM;
