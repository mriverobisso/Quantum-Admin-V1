import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalContext';
import { MdClose, MdArrowForward } from 'react-icons/md';
import './PreviewModal.css';

const PreviewModal = () => {
  const { state, previewModal, closePreview } = useGlobalContext();
  const navigate = useNavigate();
  
  if (!previewModal.isOpen) return null;

  const { type, id } = previewModal;
  let data = null;
  let title = '';
  let path = '';

  if (type === 'client') {
    data = state.clients.find(c => c.id === id);
    title = 'Detalle de Cliente';
    path = `/crm/${id}`;
  } else if (type === 'task') {
    data = state.tasks.find(t => t.id === id);
    title = 'Detalle de Tarea';
    path = data?.module === 'rrss' ? `/studio?task=${id}` : `/design?task=${id}`;
  } else if (type === 'ticket') {
    data = state.tickets.find(tk => tk.id === id);
    title = 'Detalle de Ticket';
    path = `/support/${id}`;
  }

  const handleNavigate = () => {
    closePreview();
    navigate(path);
  };

  return (
    <div className="modal-overlay" onClick={closePreview}>
      <div className="modal-content preview-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={closePreview}><MdClose /></button>
        </div>
        
        <div className="modal-body">
          {data ? (
             <div className="preview-data">
               {type === 'client' && (
                  <div className="client-full-details">
                     <div className="detail-section" style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                       <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Información Base</h4>
                       <p><strong>Nombre:</strong> {data.name}</p>
                       <p><strong>RUC:</strong> {data.ruc}</p>
                       <p><strong>Antigüedad:</strong> {new Date(data.birthday).toLocaleDateString()}</p>
                       <p><strong>Servicios Relevantes:</strong> {data.services.join(', ') || 'Ninguno'}</p>
                     </div>

                     <div className="detail-section" style={{ marginBottom: '1rem' }}>
                       <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>Servicios Activos (Host / Dominios)</h4>
                       {state.hostItems.filter(h => h.clientId === id).length > 0 ? (
                          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                            {state.hostItems.filter(h => h.clientId === id).map(h => (
                               <li key={h.id}><strong>{h.domain}</strong> - {h.type} <span className={`badge ${h.status.replace(' ','-')}`}>{h.status}</span></li>
                            ))}
                          </ul>
                       ) : <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ninguno reportado.</p>}
                     </div>

                     <div className="detail-section" style={{ marginBottom: '1rem' }}>
                       <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>Historial y Operaciones</h4>
                       
                       <div style={{ display: 'flex', gap: '1rem' }}>
                           <div style={{ flex: 1 }}>
                             <strong style={{ fontSize: '0.85rem' }}>Tickets de Soporte:</strong>
                             <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                               {state.tickets.filter(t => t.clientId === id).map(t => <li key={t.id}>{t.detail} ({t.status})</li>)}
                             </ul>
                           </div>
                           <div style={{ flex: 1 }}>
                             <strong style={{ fontSize: '0.85rem' }}>Proyectos/Tareas (RRSS/Diseño):</strong>
                             <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                               {state.tasks.filter(t => t.clientId === id).map(t => <li key={t.id}>{t.title} ({t.status})</li>)}
                             </ul>
                           </div>
                       </div>
                     </div>
                     
                     <div className="detail-section">
                       <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>Bitácora de Log del Cliente</h4>
                       <ul style={{ listStyle: 'none', padding: '0.5rem', maxHeight: '120px', overflowY: 'auto', fontSize: '0.8rem', backgroundColor: 'var(--bg-color)', borderRadius: '6px' }}>
                          {state.logs.filter(l => l.action.includes(data.name) || l.action.includes(id)).map((l, idx) => (
                             <li key={idx} style={{ marginBottom: '4px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px' }}>
                                <strong style={{ color: 'var(--primary-color)' }}>{new Date(l.date).toLocaleDateString()}</strong>: {l.action}
                             </li>
                          ))}
                          {state.logs.filter(l => l.action.includes(data.name) || l.action.includes(id)).length === 0 && (
                             <li style={{ color: 'var(--text-muted)' }}>No hay eventos registrados en la bitácora aún.</li>
                          )}
                       </ul>
                     </div>
                  </div>
                )}
               {type === 'task' && (
                 <>
                   <p><strong>Tarea:</strong> {data.title}</p>
                   <p><strong>Estado:</strong> <span className={`badge ${data.status}`}>{data.status}</span></p>
                   <p><strong>Vencimiento:</strong> {new Date(data.dueDate).toLocaleString()}</p>
                   {data.assets && (
                      <div className="mt-3">
                         <p><strong>Archivos adjuntos:</strong></p>
                         <div style={{ padding: '0.6rem', border: '1px dashed var(--border-color)', borderRadius: '6px', textAlign: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                            📁 {data.assets}
                         </div>
                      </div>
                   )}
                 </>
               )}
               {type === 'ticket' && (
                 <>
                   <p><strong>Falla:</strong> {data.detail}</p>
                   <p><strong>Estado:</strong> <span className={`badge ${data.status.replace(' ', '-')}`}>{data.status}</span></p>
                   <p><strong>Reportado:</strong> {new Date(data.reportDate).toLocaleString()}</p>
                 </>
               )}
             </div>
          ) : (
            <p className="error-text">Datos no encontrados.</p>
          )}
        </div>

        <div className="modal-footer">
           <button className="btn-secondary" onClick={closePreview}>Cerrar</button>
           {data && (
             <button className="btn-primary" onClick={handleNavigate}>
               Ir a la Ficha <MdArrowForward />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
