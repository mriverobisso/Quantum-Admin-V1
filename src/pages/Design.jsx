import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd, MdUploadFile, MdEdit, MdDelete, MdCheckCircle } from 'react-icons/md';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import './RRSS.css'; // Mismas reglas de Kanban

const getDesignSemaphore = (dueDate, status) => {
  if (status === 'terminado') return 'var(--status-ok)';
  
  if (!dueDate) return 'var(--text-muted)';
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'var(--status-danger)';
  if (diffDays <= 2) return 'var(--status-warning)';
  return 'var(--text-muted)';
};

const Design = () => {
  const { state, setState, setPreview, openFormModal, addLog, deleteItem, updateItem } = useGlobalContext();
  const { tasks, clients } = state;
  const [uploadingTask, setUploadingTask] = useState(null);

  const designTasks = tasks.filter(t => t.module === 'Design');

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
      const newItems = prev.tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      return { ...prev, tasks: newItems };
    });
  };

  const handleFileChange = async (evt, taskId) => {
     const file = evt.target.files[0];
     if (!file) return;

     setUploadingTask(taskId);
     try {
        const storageRef = ref(storage, `design_arts/${taskId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
           (snapshot) => {
              // Tracking progress
           }, 
           (error) => {
              console.error("Upload error", error);
              setUploadingTask(null);
           }, 
           async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Guardar en Firestore y mover a terminado
              await updateItem('tasks', taskId, {
                 status: 'terminado',
                 assets: file.name,
                 assetsUrl: downloadURL
              });
              
              addLog(`Arte final subido para pieza gráfica #${taskId}: ${file.name}`);
              setUploadingTask(null);
           }
        );
     } catch (err) {
        console.error('Error during upload init', err);
        setUploadingTask(null);
     }
     
     // Reset input value to allow uploading same file again if it failed
     evt.target.value = '';
  };

  return (
    <div className="page-container design-container">
      <header className="page-header module-header">
        <div>
          <h1>Taller de Diseño</h1>
          <p className="subtitle">Producción de piezas gráficas</p>
        </div>
        <button className="btn-primary" onClick={() => openFormModal('new_design')}><MdAdd /> Solicitar Arte (Brief)</button>
      </header>

      <div className="kanban-board">
        {['backlog', 'en_proceso', 'terminado'].map(col => (
           <div 
             key={col} 
             className="kanban-col"
             onDragOver={handleDragOver}
             onDrop={(e) => handleDrop(e, col)}
             style={{ borderTop: col === 'terminado' ? '4px solid var(--status-ok)' : '1px solid var(--border-color)' }}
           >
             <h3 className="col-header">{col.toUpperCase().replace('_', ' ')}</h3>
             <div className="col-body">
                {designTasks.filter(t => t.status === col).map(t => {
                   const client = clients.find(c => c.id === t.clientId);
                   const borderColor = getDesignSemaphore(t.dueDate, t.status);
                   
                   return (
                     <div 
                       key={t.id} 
                       className="kanban-card"
                       draggable
                       onDragStart={(e) => handleDragStart(e, t.id)}
                       onClick={() => setPreview('task', t.id)}
                       style={{ borderLeft: `5px solid ${borderColor}` }}
                     >
                       <div className="card-header">
                          <span className="client-tag">{client?.name || 'Cliente'}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.format}</span>
                       </div>
                       <h4 className="card-title">{t.title}</h4>
                       <p className="card-meta">Límite: {new Date(t.dueDate).toLocaleDateString()}</p>
                       
                       <div className="card-bottom-actions" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.8rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginBottom: '0.4rem' }}>
                          <button className="icon-btn edit" style={{ padding: '0.3rem' }} title="Editar" onClick={(e) => { e.stopPropagation(); openFormModal('edit_design', t); }}><MdEdit size={16} /></button>
                          <button className="icon-btn danger" style={{ padding: '0.3rem' }} title="Eliminar" onClick={(e) => { e.stopPropagation(); deleteItem('tasks', t.id); }}><MdDelete size={16} /></button>
                       </div>
                       
                       {col !== 'terminado' && !t.assetsUrl && (
                         <div className="mt-2 text-center">
                            <input 
                              type="file" 
                              id={`file-${t.id}`}
                              style={{ display: 'none' }}
                              accept="image/*,.pdf,.zip,.psd,.ai,.mp4"
                              onChange={(e) => handleFileChange(e, t.id)}
                            />
                            <button 
                              className="btn-secondary" 
                              style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', borderStyle: 'dashed', opacity: uploadingTask === t.id ? 0.6 : 1, cursor: uploadingTask === t.id ? 'not-allowed' : 'pointer' }}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 if (uploadingTask) return;
                                 document.getElementById(`file-${t.id}`).click();
                              }}
                            >
                              {uploadingTask === t.id ? 'Subiendo...' : <><MdUploadFile /> Subir Arte / Mockup</>}
                            </button>
                         </div>
                       )}
                       {t.assetsUrl ? (
                         <div className="mt-2 text-center">
                           <a 
                             href={t.assetsUrl} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className="btn-secondary"
                             onClick={(e) => e.stopPropagation()}
                             style={{ display: 'block', width: '100%', fontSize: '0.8rem', padding: '0.4rem', background: 'rgba(0,160,153,0.1)', color: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', textDecoration: 'none', borderRadius: '4px' }}
                           >
                              <MdCheckCircle style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Ver / Descargar Arte
                           </a>
                           <p className="mt-2 code-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.assets}</p>
                         </div>
                       ) : (
                         t.assets && <p className="mt-2 code-text" style={{ fontSize: '0.75rem' }}>✅ {t.assets}</p>
                       )}
                     </div>
                   );
                })}
             </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default Design;
