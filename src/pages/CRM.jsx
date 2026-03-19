import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdCake } from 'react-icons/md';
import './GridModules.css';

const CRM = () => {
  const { state, setPreview, openFormModal, deleteItem } = useGlobalContext();
  const { clients } = state;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.ruc.includes(searchTerm)
  );

  return (
    <div className="page-container crm-container">
      <header className="page-header module-header">
        <div>
          <h1>Directorio CRM</h1>
          <p className="subtitle">Gestión de clientes y servicios</p>
        </div>
        <div className="module-actions">
           <div className="search-box">
              <MdSearch className="search-icon" />
              <input 
                 type="text" 
                 placeholder="Buscar cliente o RUC..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="btn-primary" onClick={() => openFormModal('new_client')}><MdAdd /> Añadir Cliente</button>
        </div>
      </header>

      <div className="grid-module-layout">
        {filteredClients.map(client => (
          <div key={client.id} className="module-card">
            <div className="card-top-actions">
               <button className="icon-btn edit" onClick={() => openFormModal('edit_client', client)}><MdEdit /></button>
               <button className="icon-btn danger" onClick={() => deleteItem('clients', client.id)}><MdDelete /></button>
            </div>
            
            <div className="module-card-body" onClick={() => setPreview('client', client.id)}>
              <div className="client-avatar">{client.name.charAt(0)}</div>
              <h3 className="card-title">{client.name}</h3>
              <p className="card-detail code-text">{client.ruc}</p>
              
              <div className="mt-2" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <MdCake /> <span style={{ fontSize: '0.85rem' }}>{client.birthday ? new Date(client.birthday).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div className="module-card-footer">
              <div className="services-tags">
                {client.services.map(s => (
                  <span key={s} className="tag-service">{s}</span>
                ))}
                {client.services.length === 0 && <span className="tag-empty">Sin servicios</span>}
              </div>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="empty-grid-state">No se encontraron clientes que coincidan.</div>
        )}
      </div>
    </div>
  );
};

export default CRM;
