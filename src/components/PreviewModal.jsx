import React from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdClose, MdEdit, MdDelete } from 'react-icons/md';
import './PreviewModal.css';

const PreviewModal = () => {
  const { state, previewModal, closePreview, openFormModal, deleteItem } = useGlobalContext();
  
  if (!previewModal.isOpen) return null;

  const { type, id } = previewModal;
  let data = null;
  let title = '';

  if (type === 'client') {
    data = (state.clients || []).find(c => c.id === id);
    title = 'Detalle de Cliente';
  } else if (type === 'task') {
    data = (state.tasks || []).find(t => t.id === id);
    title = 'Detalle de Tarea';
  } else if (type === 'ticket') {
    data = (state.tickets || []).find(tk => tk.id === id);
    title = 'Detalle de Ticket';
  }

  // Determine the edit modal type based on the data
  const getEditType = () => {
    if (type === 'client') return 'edit_client';
    if (type === 'ticket') return 'edit_ticket';
    if (type === 'task') {
      if (data?.module?.toLowerCase() === 'rrss') return 'edit_post';
      return 'edit_design';
    }
    return null;
  };

  // Determine the collection name for delete
  const getCollection = () => {
    if (type === 'client') return 'clients';
    if (type === 'ticket') return 'tickets';
    if (type === 'task') return 'tasks';
    return null;
  };

  const handleEdit = () => {
    const editType = getEditType();
    if (editType && data) {
      closePreview();
      openFormModal(editType, data);
    }
  };

  const handleDelete = () => {
    const collection = getCollection();
    if (collection && data) {
      closePreview();
      deleteItem(collection, data.id);
    }
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
                       <p><strong>Antigüedad:</strong> {data.birthday ? new Date(data.birthday).toLocaleDateString() : 'N/A'}</p>
                       <p><strong>Servicios Relevantes:</strong> {(data.services || []).join(', ') || 'Ninguno'}</p>
                     </div>

                     <div className="detail-section" style={{ marginBottom: '1rem' }}>
                       <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>Servicios Activos (Host / Dominios)</h4>
                       {(state.hostItems || []).filter(h => h.clientId === id).length > 0 ? (
                          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                            {(state.hostItems || []).filter(h => h.clientId === id).map(h => (
                               <li key={h.id}><strong>{h.domain}</strong> - {h.type} <span className={`badge ${(h.status || '').replace(' ','-')}`}>{h.status}</span></li>
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
                               {(state.tickets || []).filter(t => t.clientId === id).map(t => <li key={t.id}>{t.detail} ({t.status})</li>)}
                             </ul>
                           </div>
                           <div style={{ flex: 1 }}>
                             <strong style={{ fontSize: '0.85rem' }}>Proyectos/Tareas (RRSS/Diseño):</strong>
                             <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                               {(state.tasks || []).filter(t => t.clientId === id).map(t => <li key={t.id}>{t.title} ({t.status})</li>)}
                             </ul>
                           </div>
                       </div>
                     </div>
                     
                     <div className="detail-section">
                       <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>Bitácora de Log del Cliente</h4>
                       <ul style={{ listStyle: 'none', padding: '0.5rem', maxHeight: '120px', overflowY: 'auto', fontSize: '0.8rem', backgroundColor: 'var(--bg-color)', borderRadius: '6px' }}>
                          {(state.logs || []).filter(l => l.action.includes(data.name) || l.action.includes(id)).map((l, idx) => (
                             <li key={idx} style={{ marginBottom: '4px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px' }}>
                                <strong style={{ color: 'var(--primary-color)' }}>{new Date(l.date).toLocaleDateString()}</strong>: {l.action}
                             </li>
                          ))}
                          {(state.logs || []).filter(l => l.action.includes(data.name) || l.action.includes(id)).length === 0 && (
                             <li style={{ color: 'var(--text-muted)' }}>No hay eventos registrados en la bitácora aún.</li>
                          )}
                       </ul>
                     </div>
                  </div>
                )}
               {type === 'task' && (
                 <>
                   <p><strong>Tarea:</strong> {data.title}</p>
                   <p><strong>Módulo:</strong> <span className="badge">{data.module}</span></p>
                   <p><strong>Estado:</strong> <span className={`badge ${data.status}`}>{data.status}</span></p>
                   <p><strong>Vencimiento:</strong> {data.dueDate ? new Date(data.dueDate).toLocaleString() : 'Sin fecha'}</p>
                   {data.copy && <p><strong>Copy:</strong> {data.copy}</p>}
                   {data.networks && data.networks.length > 0 && (
                     <p><strong>Redes:</strong> {data.networks.join(', ')}</p>
                   )}
                   {data.assets && (
                      <div className="mt-3">
                         <p><strong>Vista Previa:</strong></p>
                         <div style={{ padding: '0.6rem', border: '1px dashed var(--border-color)', borderRadius: '6px', textAlign: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                            {/\.(jpg|jpeg|png|gif|webp)$/i.test(data.assets) ? (
                              <img src={data.assets} alt="Preview" style={{ maxWidth: '100%', borderRadius: '4px', display: 'block', margin: '0 auto' }} />
                            ) : (
                              <>📁 {data.assets}</>
                            )}
                         </div>
                      </div>
                   )}
                 </>
               )}
               {type === 'ticket' && (
                 <>
                   <p><strong>Falla:</strong> {data.detail}</p>
                   <p><strong>Estado:</strong> <span className={`badge ${(data.status || '').replace(' ', '-')}`}>{data.status}</span></p>
                   <p><strong>Reportado:</strong> {data.reportDate ? new Date(data.reportDate).toLocaleString() : 'N/A'}</p>
                   {data.priority && <p><strong>Prioridad:</strong> {data.priority}</p>}
                   {data.category && <p><strong>Categoría:</strong> {data.category}</p>}
                   {data.clientId && (
                     <p><strong>Cliente:</strong> {(state.clients || []).find(c => c.id === data.clientId)?.name || 'Desconocido'}</p>
                   )}
                 </>
               )}
             </div>
          ) : (
            <p className="error-text">Datos no encontrados.</p>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <button className="btn-secondary" onClick={closePreview}>Cerrar</button>
           {data && (
             <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button className="btn-primary" onClick={handleEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                 <MdEdit /> Editar
               </button>
               <button className="btn-secondary" onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--status-danger)', borderColor: 'var(--status-danger)' }}>
                 <MdDelete /> Eliminar
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
