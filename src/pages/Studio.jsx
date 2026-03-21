import React from 'react';
import { MdAdd, MdSettings } from 'react-icons/md';
import { useGlobalContext } from '../context/GlobalContext';
import MonthCalendar from '../components/MonthCalendar';
import './Studio.css';

const Studio = () => {
  const { state, openFormModal, setPreview } = useGlobalContext();
  const { tasks = [] } = state;
  
  const calendarTasks = tasks
    .filter(t => t.module === 'rrss' || t.module === 'Design')
    .map(t => ({
      ...t,
      date: t.dueDate,
      startTime: t.status.toUpperCase(),
      color: t.module === 'Design' ? '#10b981' : '#E1306C'
    }));

  const handleDateClick = (dateStr) => {
    // Open the new post or new design form based on preference. 
    // We'll default to new_post for Studio.
    openFormModal('new_post', { publishDate: `${dateStr}T10:00` });
  };

  const handleEventClick = (event) => {
    // We can open preview or edit. Let's open edit modal based on module:
    if (event.module === 'Design') {
      openFormModal('edit_design', event);
    } else {
      openFormModal('edit_post', event);
    }
  };
  return (
    <div className="page-container">
      <div className="page-header-container">
        <div>
          <h1>Quantum Studio</h1>
          <p className="subtitle">Gestión de Redes Sociales y Diseño</p>
        </div>
      </div>

      <div className="card section-card calendar-section">
        <div className="section-header">
          <h2>Calendario de Contenidos y Arte</h2>
          <button className="btn-primary" onClick={() => openFormModal('new_post')}><MdAdd /> Agregar Contenido</button>
        </div>
        
        <MonthCalendar 
          events={calendarTasks}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </div>

      <div className="card section-card pipeline-section">
        <div className="section-header">
          <h2>Pipeline de Contenidos</h2>
          <button className="btn-secondary"><MdSettings /> Gestionar Etapas</button>
        </div>
        
        <div className="pipeline-board">
          {['Pendiente', 'En Progreso', 'Revisión', 'Aprobado'].map((status) => (
             <div key={status} className={`pipeline-column ${status.toLowerCase().replace(' ', '-')}`}>
               <div className="column-header">
                  <div className="status-indicator"></div>
                  <h3>{status}</h3>
                  <span className="count">0</span>
               </div>
               <div className="column-content"></div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Studio;
