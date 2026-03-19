import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd, MdCalendarMonth, MdViewWeek, MdEdit, MdDelete, MdContentCopy, MdArchive } from 'react-icons/md';
import './RRSS.css';

// Función auxiliar para colores de redes
const getNetworkColor = (net) => {
  const colors = {
    'Instagram': '#E1306C',
    'Facebook': '#1877F2',
    'LinkedIn': '#0A66C2',
    'TikTok': '#000000',
    'X': '#1DA1F2',
    'General': 'var(--text-muted)'
  };
  return colors[net] || colors['General'];
};

const RRSS = () => {
  const { state, setState, setPreview, openFormModal, deleteItem, archiveItem, duplicateItem } = useGlobalContext();
  const { tasks = [], clients = [] } = state || {};
  const [view, setView] = useState('kanban');

  // Filtrar solo tareas de RRSS (caso insensible) y no archivadas
  const rrssTasks = (tasks || []).filter(t => t.module?.toLowerCase() === 'rrss' && t.status !== 'archivado');

  // Lógica Kanban Drag&Drop
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setState(prev => {
      const newItems = (prev.tasks || []).map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      return { ...prev, tasks: newItems };
    });
  };

  return (
    <div className="page-container rrss-container">
      <header className="page-header module-header">
        <div>
          <h1>Gestión de Redes Sociales (Studio)</h1>
          <p className="subtitle">Planificación y pipeline de contenidos</p>
        </div>
        <div className="module-actions">
           <div className="view-toggle">
              <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}><MdCalendarMonth /> Mes</button>
              <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}><MdViewWeek /> Kanban</button>
           </div>
           <button className="btn-primary" onClick={() => openFormModal('new_post')}><MdAdd /> Programar Post</button>
        </div>
      </header>

      {view === 'calendar' ? (
        <div className="card section-card">
           <div className="mock-calendar-grid">
               {[...Array(30)].map((_, i) => {
                  const day = i + 1;
                  // Dummy date logic: Map tasks assigned to current month's day
                  const dayTasks = rrssTasks.filter(t => {
                     if(!t.publishDate) return false;
                     return new Date(t.publishDate).getDate() === day;
                  });

                  return (
                    <div key={day} className={`calendar-cell ${dayTasks.length > 0 ? 'has-events' : ''}`}>
                       <span className="day-number">{day}</span>
                       <div className="cell-events">
                          {dayTasks.map(t => {
                             const client = (clients || []).find(c => c.id === t.clientId);
                             return (
                               <div key={t.id} className="event-tag" onClick={() => setPreview('task', t.id)}>
                                 <div className="event-networks">
                                    {(t.networks || []).map(net => (
                                       <span key={net} className="net-dot" style={{ backgroundColor: getNetworkColor(net) }} title={net}></span>
                                    ))}
                                 </div>
                                 <span className="event-client">{client?.name || 'Varios'}</span>
                               </div>
                             );
                          })}
                       </div>
                    </div>
                  );
               })}
           </div>
        </div>
      ) : (
        <div className="kanban-board">
          {['idea', 'produccion', 'revision', 'programado'].map(col => (
             <div 
               key={col} 
               className="kanban-col"
               onDragOver={handleDragOver}
               onDrop={(e) => handleDrop(e, col)}
             >
               <h3 className="col-header">{col.toUpperCase()}</h3>
               <div className="col-body">
                  {rrssTasks.filter(t => t.status === col).map(t => {
                     const client = (clients || []).find(c => c.id === t.clientId);
                     return (
                       <div 
                         key={t.id} 
                         className="kanban-card"
                         draggable
                         onDragStart={(e) => handleDragStart(e, t.id)}
                         onClick={() => setPreview('task', t.id)}
                       >
                         <div className="card-header">
                            <span className="client-tag">{client?.name || 'Cliente'}</span>
                            <div className="net-icons">
                              {(t.networks || []).map(net => (
                                <span key={net} className="net-dot" style={{ backgroundColor: getNetworkColor(net) }}></span>
                              ))}
                            </div>
                         </div>
                         <h4 className="card-title">{t.title}</h4>
                         <p className="card-meta">📅 {t.publishDate ? new Date(t.publishDate).toLocaleString() : 'Sin Fecha'}</p>
                         <div className="card-bottom-actions" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.8rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                            <button className="icon-btn" style={{ padding: '0.3rem' }} title="Duplicar" onClick={(e) => { e.stopPropagation(); duplicateItem('tasks', t.id); }}><MdContentCopy size={16} /></button>
                            <button className="icon-btn edit" style={{ padding: '0.3rem' }} title="Editar" onClick={(e) => { e.stopPropagation(); openFormModal('edit_post', t); }}><MdEdit size={16} /></button>
                            <button className="icon-btn" style={{ padding: '0.3rem' }} title="Archivar" onClick={(e) => { e.stopPropagation(); archiveItem('tasks', t.id); }}><MdArchive size={16} /></button>
                            <button className="icon-btn danger" style={{ padding: '0.3rem' }} title="Eliminar" onClick={(e) => { e.stopPropagation(); deleteItem('tasks', t.id); }}><MdDelete size={16} /></button>
                         </div>
                       </div>
                     );
                  })}
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RRSS;
