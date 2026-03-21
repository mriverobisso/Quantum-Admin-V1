import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd, MdEmail, MdWarning, MdPublic, MdEdit, MdDelete, MdSync } from 'react-icons/md';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [serverAccounts, setServerAccounts] = useState(null);

  const handleSyncWHM = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/whm');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const accts = data?.data?.acct || [];
      setServerAccounts(accts);
      addLog(`Se sincronizaron ${accts.length} cuentas desde WHM.`);
    } catch (err) {
      alert(`Error de sincronización WHM:\n${err.message}\n\nNota: Los endpoints /api/ funcionan en Vercel Producción o usando 'vercel dev' de manera local.`);
    } finally {
      setIsSyncing(false);
    }
  };

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
      <header className="page-header module-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Gestión de Hosting</h1>
          <p className="subtitle">Inventario en plataforma y Cuentas CPanel en vivo</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
             className="btn-secondary" 
             onClick={handleSyncWHM}
             disabled={isSyncing}
             style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: isSyncing ? 'rgba(0,0,0,0.05)' : 'transparent' }}
          >
             <MdSync className={isSyncing ? 'spin-icon' : ''} /> 
             {isSyncing ? 'Sincronizando...' : 'Conectar WHM en vivo'}
          </button>
          <button className="btn-primary" onClick={() => openFormModal('new_host')}>
             <MdAdd /> Registro Plataforma
          </button>
        </div>
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

      {serverAccounts && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)', animation: 'msgFadeIn 0.4s ease' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <MdPublic style={{ color: 'var(--primary-color)' }} /> 
             Directorio de Cuentas Reales (Servidor) - {serverAccounts.length} cuentas
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
               <thead>
                 <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                   <th style={{ padding: '0.75rem 0.5rem' }}>Dominio</th>
                   <th style={{ padding: '0.75rem 0.5rem' }}>Usuario CPanel</th>
                   <th style={{ padding: '0.75rem 0.5rem' }}>Plan (Paquete)</th>
                   <th style={{ padding: '0.75rem 0.5rem' }}>Disco Usado</th>
                   <th style={{ padding: '0.75rem 0.5rem' }}>Cuota Disco</th>
                   <th style={{ padding: '0.75rem 0.5rem' }}>IP / Servidor</th>
                   <th style={{ padding: '0.75rem 0.5rem' }}>Estado Servidor</th>
                 </tr>
               </thead>
               <tbody>
                 {serverAccounts.map((acct, idx) => {
                   const isWarning = acct.diskused !== 'unlimited' && acct.disklimit && parseFloat(acct.diskused) / parseFloat(acct.disklimit) > 0.8;
                   
                   return (
                     <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: acct.suspended ? 'rgba(220,53,69,0.05)' : 'transparent' }}>
                       <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>{acct.domain}</td>
                       <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{acct.user}</td>
                       <td style={{ padding: '0.75rem 0.5rem' }}>{acct.plan}</td>
                       <td style={{ padding: '0.75rem 0.5rem', color: isWarning ? 'var(--status-warning)' : 'inherit', fontWeight: isWarning ? 700 : 400 }}>
                         {acct.diskused}
                       </td>
                       <td style={{ padding: '0.75rem 0.5rem' }}>{acct.disklimit}</td>
                       <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace' }}>{acct.ip}</td>
                       <td style={{ padding: '0.75rem 0.5rem' }}>
                         {acct.suspended ? (
                           <span style={{ color: 'var(--status-danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><MdWarning/> Suspendida</span>
                         ) : (
                           <span style={{ color: 'var(--status-ok)', fontWeight: 600 }}>Activa</span>
                         )}
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Host;
