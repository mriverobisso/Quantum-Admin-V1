import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdSave } from 'react-icons/md';

const AdminConfig = ({ view = 'admin' }) => {
  const { state, updateSetting, addLog } = useGlobalContext();

  // Local state for deferred saving (Evita renderizados excesivos)
  const [formData, setFormData] = useState({
     agencyName: state.settings.agencyName || '',
     ruc: state.settings.ruc || '',
     darkMode: state.settings.darkMode || false
  });

  useEffect(() => {
     setFormData({
        agencyName: state.settings.agencyName || '',
        ruc: state.settings.ruc || '',
        darkMode: state.settings.darkMode || false
     });
  }, [state.settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveConfig = () => {
     updateSetting('darkMode', formData.darkMode);
     addLog(`Actualizó configuraciones del sistema (Modo Oscuro: ${formData.darkMode})`);
  };

  const handleSaveAdmin = () => {
     updateSetting('agencyName', formData.agencyName);
     updateSetting('ruc', formData.ruc);
     addLog(`Actualizó perfil administrativo de la Agencia (${formData.agencyName})`);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{view === 'admin' ? 'Administración Corporativa' : 'Configuración de Entorno'}</h1>
        <p className="subtitle">{view === 'admin' ? 'Gestión fiscal, Cuentas bancarias y Logs de usuarios' : 'Preferencias de sistema, Hora y Tema Visual'}</p>
      </header>

      <div className="dashboard-layout">
        {view === 'settings' ? (
          <div className="main-column card section-card">
             <h2>Ajustes Globales del Sistema</h2>
             
             <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                   <div>
                      <strong>Aparición (Modo Nocturno)</strong>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Maneja las variables globales integradas en index.css</p>
                   </div>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                      <input type="checkbox" name="darkMode" checked={formData.darkMode} onChange={handleChange} style={{ width: '18px', height: '18px' }}/>
                      {formData.darkMode ? 'Habilitado' : 'Deshabilitado'}
                   </label>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                   <div>
                      <strong>Zona Horaria Predefinida</strong>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configurado para Ecuador UTC-05:00</p>
                   </div>
                   <select className="input-field" style={{ width: '200px' }} disabled>
                      <option>América/Guayaquil (GMT-5)</option>
                   </select>
                </div>

                <div style={{ marginTop: '1rem' }}>
                   <button className="btn-primary" onClick={handleSaveConfig}><MdSave /> Guardar Configuraciones</button>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px dashed var(--border-color)' }}>
                    <h3 style={{ color: 'var(--status-danger)' }}>Acciones de Emergencia</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Si la aplicación se comporta de forma inestable o no carga algunos módulos, puede intentar restablecer el estado inicial.</p>
                    <button 
                      className="btn-secondary danger" 
                      style={{ borderColor: 'var(--status-danger)', color: 'var(--status-danger)' }}
                      onClick={() => {
                        if(window.confirm('¿Estás seguro? Se perderán todos los datos locales y se volverá a la configuración de fábrica.')) {
                           localStorage.removeItem('quantum_state');
                           window.location.reload();
                        }
                      }}
                    >
                      Restablecer Toda la Aplicación
                    </button>
                 </div>
             </div>
          </div>
        ) : (
          <>
            <div className="main-column card section-card">
               <h2>Perfil Jurídico / Comercial</h2>
               <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Razón Social / Nombre Comercial</label>
                    <input 
                      type="text" 
                      name="agencyName"
                      value={formData.agencyName} 
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>RUC Institucional</label>
                    <input 
                      type="text" 
                      name="ruc"
                      value={formData.ruc} 
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Subir Logo Claro</label>
                        <input type="file" className="input-field" />
                     </div>
                     <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Subir Logo Oscuro</label>
                        <input type="file" className="input-field" />
                     </div>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                     <button className="btn-primary" onClick={handleSaveAdmin}><MdSave /> Guardar Perfil Corporativo</button>
                  </div>
               </div>
            </div>
            
            <div className="side-column card section-card">
               <h2>Registro Global de Acciones (Logs)</h2>
               <div style={{ marginTop: '1.5rem', maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {state.logs.map((log, i) => (
                    <div key={i} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '6px', borderLeft: '3px solid var(--primary-color)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <strong style={{ fontSize: '0.85rem' }}>{log.user}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(log.date).toLocaleString()}</span>
                       </div>
                       <p style={{ margin: 0, fontSize: '0.85rem' }}>{log.action}</p>
                    </div>
                  ))}
                  {state.logs.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No hay actividad registrada bajo este Tenant.</p>}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminConfig;
