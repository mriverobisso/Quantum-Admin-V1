import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd, MdEmail, MdWarning, MdPublic, MdEdit, MdDelete } from 'react-icons/md';
import './GridModules.css';

const getHostSemaphore = (dueDate) => {
  if (!dueDate) return 'ok';
  const diffDays = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'danger';
  if (diffDays <= 30) return 'warning';
  return 'ok';
};

const Host = () => {
  const { state, setState, addLog, openFormModal, deleteItem } = useGlobalContext();
  const { hostItems, clients } = state;
  const [showMockToast, setShowMockToast] = useState(false);

  const handleSendEmail = (hostId, domain) => {
    setState(prev => {
      const newItems = prev.hostItems.map(h => 
        h.id === hostId ? { ...h, status: 'por renovar' } : h
      );
      return { ...prev, hostItems: newItems };
    });
    addLog(`Envió aviso automátizado de cobro para ${domain}`);
    setShowMockToast(true);
    setTimeout(() => setShowMockToast(false), 3000);
  };

  return (
    <div className="page-container host-container">
      <header className="page-header module-header">
        <div>
          <h1>Gestión de Hosting</h1>
          <p className="subtitle">Inventario y control de dominios</p>
        </div>
        <button className="btn-primary" onClick={() => openFormModal('new_host')}><MdAdd /> Registro de Host</button>
      </header>

      {showMockToast && (
        <div className="toast-notification">✅ Factura proforma de cobro enviada al cliente del dominio.</div>
      )}

      <div className="grid-module-layout">
         {hostItems.map(item => {
           const client = clients.find(c => c.id === item.clientId);
           const colorState = getHostSemaphore(item.dueDate);
           const diffDays = Math.ceil((new Date(item.dueDate) - new Date()) / (1000*60*60*24));

           return (
             <div key={item.id} className="module-card">
                <div className="card-top-actions">
                  <button 
                     className="icon-btn" 
                     title="Notificar Cobro"
                     onClick={() => handleSendEmail(item.id, item.domain)}
                  ><MdEmail /></button>
                  <button 
                     className="icon-btn edit" 
                     title="Editar"
                     onClick={() => openFormModal('edit_host', item)}
                  ><MdEdit /></button>
                  <button 
                     className="icon-btn danger" 
                     title="Eliminar"
                     onClick={() => deleteItem('hostItems', item.id)}
                  ><MdDelete /></button>
                </div>
                
                <div className="module-card-body">
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span className={`dot-large ${colorState}`}></span>
                      <span className={`badge ${item.status.replace(' ', '-')}`}>{item.status}</span>
                   </div>

                   <h3 className="card-title code-text" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                     <MdPublic style={{ verticalAlign: 'middle', marginRight: '0.3rem' }}/> 
                     {item.domain}
                   </h3>
                   <p className="card-detail" style={{ color: 'var(--text-main)', fontWeight: 600 }}>{client?.name || 'Huérfano'}</p>

                   <div className="mt-2" style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '8px', marginTop: '1rem' }}>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}><strong>Plan:</strong> {item.type}</p>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}><strong>Costo:</strong> ${item.cost}/Año</p>
                      <p style={{ margin: '0', fontSize: '0.85rem' }}><strong>Vence:</strong> {new Date(item.dueDate).toLocaleDateString()}</p>
                   </div>
                   
                   {diffDays <= 30 && diffDays >= 0 && (
                     <div className="mt-2" style={{ color: 'var(--status-warning)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MdWarning /> ¡Vence en {diffDays} días!
                     </div>
                   )}
                   {diffDays < 0 && (
                     <div className="mt-2" style={{ color: 'var(--status-danger)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MdWarning /> Vencido hace {Math.abs(diffDays)} días
                     </div>
                   )}
                </div>
             </div>
           );
         })}
         {hostItems.length === 0 && (
           <div className="empty-grid-state">El inventario de Hosts está vacío. Agregue el registro del primer dominio.</div>
         )}
      </div>
    </div>
  );
};

export default Host;
