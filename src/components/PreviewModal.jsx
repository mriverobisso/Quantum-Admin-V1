import React from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdClose, MdEdit, MdDelete, MdEmail, MdPhone, MdLocationOn, MdBusiness, MdPerson } from 'react-icons/md';
import './PreviewModal.css';

const PreviewModal = () => {
  const { state, previewModal, closePreview, openFormModal, deleteItem } = useGlobalContext();
  
  if (!previewModal.isOpen) return null;

  const { type, id } = previewModal;
  let data = null;
  let title = '';

  if (type === 'client') {
    data = (state.clients || []).find(c => c.id === id);
    title = 'Ficha de Cliente';
  } else if (type === 'task') {
    data = (state.tasks || []).find(t => t.id === id);
    title = 'Detalle de Tarea';
  } else if (type === 'ticket') {
    data = (state.tickets || []).find(tk => tk.id === id);
    title = 'Detalle de Ticket';
  } else if (type === 'quote') {
    data = (state.quotes || []).find(q => q.id === id);
    title = `Detalle de Proforma ${data?.invoiceNumber || ''}`;
  }

  const getEditType = () => {
    if (type === 'client') return 'edit_client';
    if (type === 'ticket') return 'edit_ticket';
    if (type === 'task') {
      if (data?.module?.toLowerCase() === 'rrss') return 'edit_post';
      return 'edit_design';
    }
    return null;
  };

  const getCollection = () => {
    if (type === 'client') return 'clients';
    if (type === 'ticket') return 'tickets';
    if (type === 'task') return 'tasks';
    if (type === 'quote') return 'quotes';
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

  // Auto-generated client history
  const getClientHistory = (clientId) => {
    const clientTasks = (state.tasks || []).filter(t => t.clientId === clientId);
    const clientTickets = (state.tickets || []).filter(t => t.clientId === clientId);
    const clientHosts = (state.hostItems || []).filter(h => h.clientId === clientId);
    const clientLogs = (state.logs || []).filter(l => {
      const clientData = (state.clients || []).find(c => c.id === clientId);
      return l.action.includes(clientData?.name || '') || l.action.includes(clientId);
    });
    return { clientTasks, clientTickets, clientHosts, clientLogs };
  };

  const sectionStyle = { marginBottom: '1rem' };
  const sectionTitleStyle = { marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem', fontSize: '0.95rem', fontWeight: 600 };
  const infoRowStyle = { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.3rem' };

  return (
    <div className="modal-overlay" onClick={closePreview}>
      <div className="modal-content preview-modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={closePreview}><MdClose /></button>
        </div>
        
        <div className="modal-body">
          {data ? (
             <div className="preview-data">
               {type === 'client' && (() => {
                  const history = getClientHistory(id);
                  return (
                    <div className="client-full-details">
                     {/* Company Info */}
                     <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', ...sectionStyle }}>
                       <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Datos de la Empresa</h4>
                       <p style={infoRowStyle}><strong>Nombre:</strong> {data.name}</p>
                       <p style={infoRowStyle}><strong>RUC:</strong> {data.ruc}</p>
                       {data.email && <p style={infoRowStyle}><MdEmail size={15} /> {data.email}</p>}
                       {data.phone && <p style={infoRowStyle}><MdPhone size={15} /> {data.phone}</p>}
                       {data.address && <p style={infoRowStyle}><MdLocationOn size={15} /> {data.address}{data.city ? `, ${data.city}` : ''}</p>}
                       {data.birthday && <p style={infoRowStyle}><strong>Inicio:</strong> {new Date(data.birthday).toLocaleDateString()}</p>}
                     </div>

                     {/* Contact */}
                     {(data.contactPerson || data.contactRole) && (
                       <div style={sectionStyle}>
                         <h4 style={sectionTitleStyle}><MdPerson style={{ verticalAlign: 'middle' }} /> Contacto Principal</h4>
                         <p style={infoRowStyle}><MdBusiness size={15} /> {data.contactPerson || 'N/A'} {data.contactRole ? `— ${data.contactRole}` : ''}</p>
                       </div>
                     )}

                     {/* Services */}
                     <div style={sectionStyle}>
                       <h4 style={sectionTitleStyle}>Servicios Contratados</h4>
                       <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                         {(data.services || []).length > 0 ? data.services.map(s => (
                           <span key={s} style={{ padding: '0.3rem 0.7rem', backgroundColor: 'rgba(37,117,252,0.1)', color: 'var(--primary-color)', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 600 }}>{s}</span>
                         )) : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sin servicios registrados</span>}
                       </div>
                     </div>

                     {/* Notes */}
                     {data.notes && (
                       <div style={{ ...sectionStyle, backgroundColor: 'rgba(253,126,20,0.05)', padding: '0.7rem', borderRadius: '6px', borderLeft: '3px solid var(--status-warning)' }}>
                         <strong style={{ fontSize: '0.85rem' }}>Notas:</strong>
                         <p style={{ fontSize: '0.85rem', margin: '0.3rem 0 0 0' }}>{data.notes}</p>
                       </div>
                     )}

                     {/* ── AUTO-GENERATED HISTORY ── */}
                     <h4 style={{ color: 'var(--primary-color)', margin: '1.2rem 0 0.5rem 0', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.3rem', fontSize: '1rem' }}>📋 Historial de Actividad</h4>

                     {/* Host/Domains */}
                     <div style={sectionStyle}>
                       <h4 style={sectionTitleStyle}>🌐 Dominios / Hosting ({history.clientHosts.length})</h4>
                       {history.clientHosts.length > 0 ? (
                         <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                           {history.clientHosts.map(h => (
                             <li key={h.id} style={{ marginBottom: '0.3rem' }}><strong>{h.domain}</strong> — {h.type} <span className={`badge ${(h.status || '').replace(' ','-')}`} style={{ fontSize: '0.7rem' }}>{h.status}</span></li>
                           ))}
                         </ul>
                       ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin dominios registrados.</p>}
                     </div>

                     {/* RRSS Posts */}
                     <div style={sectionStyle}>
                       <h4 style={sectionTitleStyle}>📱 Redes Sociales ({history.clientTasks.filter(t => t.module?.toLowerCase() === 'rrss').length})</h4>
                       {history.clientTasks.filter(t => t.module?.toLowerCase() === 'rrss').length > 0 ? (
                         <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                           {history.clientTasks.filter(t => t.module?.toLowerCase() === 'rrss').map(t => (
                             <li key={t.id} style={{ marginBottom: '0.3rem' }}>{t.title} <span className={`badge ${t.status}`} style={{ fontSize: '0.7rem' }}>{t.status}</span> {t.networks ? `(${t.networks.join(', ')})` : ''}</li>
                           ))}
                         </ul>
                       ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin publicaciones.</p>}
                     </div>

                     {/* Design Tasks */}
                     <div style={sectionStyle}>
                       <h4 style={sectionTitleStyle}>🎨 Diseño Gráfico ({history.clientTasks.filter(t => t.module === 'Design').length})</h4>
                       {history.clientTasks.filter(t => t.module === 'Design').length > 0 ? (
                         <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                           {history.clientTasks.filter(t => t.module === 'Design').map(t => (
                             <li key={t.id} style={{ marginBottom: '0.3rem' }}>{t.title} <span className={`badge ${t.status}`} style={{ fontSize: '0.7rem' }}>{t.status}</span> {t.format ? `(${t.format})` : ''}</li>
                           ))}
                         </ul>
                       ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin piezas gráficas.</p>}
                     </div>

                     {/* Tickets */}
                     <div style={sectionStyle}>
                       <h4 style={sectionTitleStyle}>🎫 Tickets de Soporte ({history.clientTickets.length})</h4>
                       {history.clientTickets.length > 0 ? (
                         <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                           {history.clientTickets.map(t => (
                             <li key={t.id} style={{ marginBottom: '0.3rem' }}>{t.detail} <span className={`badge ${(t.status || '').replace(' ','-')}`} style={{ fontSize: '0.7rem' }}>{t.status}</span> {t.priority ? `(${t.priority})` : ''}</li>
                           ))}
                         </ul>
                       ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin tickets.</p>}
                     </div>

                     {/* Activity Log */}
                     <div style={sectionStyle}>
                       <h4 style={sectionTitleStyle}>📝 Bitácora ({history.clientLogs.length})</h4>
                       <ul style={{ listStyle: 'none', padding: '0.5rem', maxHeight: '120px', overflowY: 'auto', fontSize: '0.8rem', backgroundColor: 'var(--bg-color)', borderRadius: '6px' }}>
                          {history.clientLogs.slice(0, 20).map((l, idx) => (
                             <li key={idx} style={{ marginBottom: '4px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px' }}>
                                <strong style={{ color: 'var(--primary-color)' }}>{new Date(l.date).toLocaleDateString()}</strong>: {l.action}
                             </li>
                          ))}
                          {history.clientLogs.length === 0 && (
                             <li style={{ color: 'var(--text-muted)' }}>No hay eventos registrados aún.</li>
                          )}
                       </ul>
                     </div>
                    </div>
                  );
               })()}

               {type === 'task' && (
                 <>
                   <p><strong>Tarea:</strong> {data.title}</p>
                   <p><strong>Módulo:</strong> <span className="badge">{data.module}</span></p>
                   <p><strong>Estado:</strong> <span className={`badge ${data.status}`}>{data.status}</span></p>
                   <p><strong>Cliente:</strong> {(state.clients || []).find(c => c.id === data.clientId)?.name || 'Sin asignar'}</p>
                   <p><strong>Vencimiento:</strong> {data.dueDate ? new Date(data.dueDate).toLocaleString() : 'Sin fecha'}</p>
                   {data.copy && <p><strong>Copy:</strong> {data.copy}</p>}
                   {data.networks && data.networks.length > 0 && (
                     <p><strong>Redes:</strong> {data.networks.join(', ')}</p>
                   )}
                   {data.assets && (
                      <div className="mt-3">
                         <p><strong>Vista Previa:</strong></p>
                         <div style={{ padding: '0.6rem', border: '1px dashed var(--border-color)', borderRadius: '6px', textAlign: 'center', backgroundColor: 'var(--bg-color)' }}>
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
                   <p><strong>Cliente:</strong> {(state.clients || []).find(c => c.id === data.clientId)?.name || 'Sin asignar'}</p>
                   <p><strong>Reportado:</strong> {data.reportDate ? new Date(data.reportDate).toLocaleString() : 'N/A'}</p>
                   {data.priority && <p><strong>Prioridad:</strong> {data.priority}</p>}
                   {data.category && <p><strong>Categoría:</strong> {data.category}</p>}
                 </>
               )}
               {type === 'quote' && (
                 <>
                   <p><strong>Cliente:</strong> {data.clientName}</p>
                   <p><strong>Fecha Generación:</strong> {new Date(data.date).toLocaleString()}</p>
                   <p><strong>Estado Actual:</strong> <span className={`badge ${(data.status || '').replace(' ', '-').toLowerCase()}`}>{data.status}</span></p>
                   <p><strong>Monto Total:</strong> <span style={{color: 'var(--status-ok)', fontWeight: 'bold'}}>${data.total?.toFixed(2)}</span></p>
                   <h4 style={{ color: 'var(--primary-color)', margin: '1rem 0 0.5rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>Módulos Incluidos</h4>
                   <ul style={{ listStyle: 'none', padding: 0 }}>
                     {(data.items || []).map((item, idx) => (
                       <li key={idx} style={{ marginBottom: '0.5rem', backgroundColor: 'var(--bg-color)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                         <strong>{item.quantity}x {item.name}</strong> <span>${item.price?.toFixed(2)} c/u</span>
                       </li>
                     ))}
                   </ul>
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
               {getEditType() && (
                 <button className="btn-primary" onClick={handleEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                   <MdEdit /> Editar
                 </button>
               )}
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
