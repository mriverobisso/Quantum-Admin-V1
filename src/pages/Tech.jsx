import React from 'react';
import { MdAdd, MdSettings } from 'react-icons/md';
import './Tech.css';

const Tech = () => {
  return (
    <div className="page-container">
      <div className="page-header-container">
        <div>
          <h1>Quantum Tech</h1>
          <p className="subtitle">Desarrollo Web y Servicios Técnicos</p>
        </div>
      </div>

      <div className="card section-card">
        <div className="section-header">
          <h2>Servicios Técnicos</h2>
          <button className="btn-primary"><MdAdd /> Nuevo Servicio</button>
        </div>
        
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Dominio</th>
                <th>Descripción</th>
                <th>Vencimiento</th>
                <th>Días</th>
                <th>Costo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state per screenshot */}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card section-card pipeline-section mt-6">
        <div className="section-header">
          <h2>Pipeline de Desarrollo</h2>
          <div className="header-actions">
            <button className="btn-primary"><MdAdd /> Nueva Tarea</button>
            <button className="btn-secondary"><MdSettings /> Etapas</button>
          </div>
        </div>
        
        <div className="pipeline-board tech">
          {['Backlog', 'Diseño', 'Desarrollo', 'QA', 'Despliegue'].map((status) => (
             <div key={status} className="pipeline-column">
               <div className="column-header">
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

export default Tech;
