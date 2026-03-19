import React from 'react';
import { MdAdd, MdSettings } from 'react-icons/md';
import './Studio.css';

const Studio = () => {
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
          <h2>Calendario de Contenidos</h2>
          <button className="btn-primary"><MdAdd /> Agregar Contenido</button>
        </div>
        
        <div className="calendar-controls">
          <button className="icon-btn">&lt;</button>
          <strong>Enero De 2026</strong>
          <button className="icon-btn">&gt;</button>
        </div>

        <div className="calendar-grid">
          <div className="calendar-day-header">LU</div>
          <div className="calendar-day-header">MA</div>
          <div className="calendar-day-header">MI</div>
          <div className="calendar-day-header">JU</div>
          <div className="calendar-day-header">VI</div>
          <div className="calendar-day-header">SA</div>
          <div className="calendar-day-header">DO</div>
          
          {/* Mock days logic to replicate the screenshot grid shape */}
          {[...Array(4)].map((_, i) => <div key={`empty-${i}`} className="calendar-cell empty"></div>)}
          {[...Array(31)].map((_, i) => (
             <div key={`day-${i+1}`} className="calendar-cell">
               <span className="day-number">{i + 1}</span>
             </div>
          ))}
        </div>
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
