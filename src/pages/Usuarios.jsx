import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd, MdEdit, MdDelete, MdPerson, MdSecurity, MdSave } from 'react-icons/md';
import './GridModules.css';

const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'rrss', label: 'RRSS' },
  { key: 'design', label: 'Diseño' },
  { key: 'host', label: 'Host' },
  { key: 'soporte', label: 'Soporte' },
  { key: 'crm', label: 'CRM' },
  { key: 'cotizador', label: 'Cotizador' },
  { key: 'finanzas', label: 'Finanzas' },
  { key: 'admin', label: 'Administración' },
  { key: 'config', label: 'Configuración' },
];

const ROLES = ['Administrador', 'Diseñador', 'CM', 'Finanzas'];

const ROLE_PRESETS = {
  Administrador: { dashboard: true, rrss: true, design: true, host: true, soporte: true, crm: true, cotizador: true, finanzas: true, admin: true, config: true, usuarios: true },
  Diseñador: { dashboard: true, rrss: true, design: true, host: false, soporte: false, crm: true, cotizador: false, finanzas: false, admin: false, config: false, usuarios: false },
  CM: { dashboard: true, rrss: true, design: false, host: false, soporte: false, crm: true, cotizador: false, finanzas: false, admin: false, config: false, usuarios: false },
  Finanzas: { dashboard: true, rrss: false, design: false, host: false, soporte: false, crm: true, cotizador: true, finanzas: true, admin: false, config: false, usuarios: false },
};

const Usuarios = () => {
  const { state, setState, addLog } = useGlobalContext();
  const users = state.users || [];
  const currentUser = state.currentUser || {};
  
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'Diseñador', permissions: { ...ROLE_PRESETS.Diseñador }
  });

  // Only admin can access
  if (currentUser.role !== 'Administrador') {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <MdSecurity size={60} color="var(--status-danger)" />
        <h2 style={{ marginTop: '1rem' }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-muted)' }}>Solo los administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: { ...ROLE_PRESETS[role] || ROLE_PRESETS.Diseñador }
    }));
  };

  const handlePermissionToggle = (moduleKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [moduleKey]: !prev.permissions[moduleKey] }
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Complete todos los campos requeridos.');
      return;
    }

    if (editingUser) {
      // Update existing user
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u)
      }));
      addLog(`Editó usuario: ${formData.name} (${formData.role})`);
    } else {
      // Create new user
      const newUser = {
        id: `u_${Date.now()}`,
        ...formData
      };
      setState(prev => ({
        ...prev,
        users: [...(prev.users || []), newUser]
      }));
      addLog(`Creó nuevo usuario: ${newUser.name} (${newUser.role})`);
    }

    setShowForm(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'Diseñador', permissions: { ...ROLE_PRESETS.Diseñador } });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      permissions: { ...user.permissions }
    });
    setShowForm(true);
  };

  const handleDelete = (userId) => {
    if (userId === 'u_admin') {
      alert('No puedes eliminar al administrador principal.');
      return;
    }
    if (window.confirm('¿Eliminar este usuario?')) {
      setState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== userId)
      }));
      addLog(`Eliminó un usuario del sistema.`);
    }
  };

  const roleColors = {
    Administrador: 'var(--status-danger)',
    Diseñador: 'var(--accent-studio)',
    CM: 'var(--accent-crm)',
    Finanzas: 'var(--accent-tech)'
  };

  return (
    <div className="page-container">
      <header className="page-header module-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p className="subtitle">Crear y administrar accesos del equipo · {users.length} usuarios</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', password: '', role: 'Diseñador', permissions: { ...ROLE_PRESETS.Diseñador } }); setShowForm(true); }}>
          <MdAdd /> Crear Usuario
        </button>
      </header>

      {/* User List */}
      <div className="grid-module-layout">
        {users.map(user => (
          <div key={user.id} className="module-card" style={{ borderLeft: `4px solid ${roleColors[user.role] || 'var(--primary-color)'}` }}>
            <div className="card-top-actions">
              <button className="icon-btn edit" onClick={() => handleEdit(user)}><MdEdit /></button>
              {user.id !== 'u_admin' && <button className="icon-btn danger" onClick={() => handleDelete(user.id)}><MdDelete /></button>}
            </div>
            <div className="module-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: roleColors[user.role] || 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="card-title" style={{ marginBottom: '0.2rem' }}>{user.name}</h3>
                  <p className="card-detail">{user.email}</p>
                </div>
              </div>
              <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: `${roleColors[user.role]}20`, color: roleColors[user.role] }}>
                {user.role}
              </div>
            </div>
            <div className="module-card-footer">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {MODULES.filter(m => user.permissions?.[m.key]).map(m => (
                  <span key={m.key} style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: 'var(--bg-color)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{m.label}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h3>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Nombre Completo *</label>
                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Juan Pérez" />
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Email *</label>
                  <input type="email" className="input-field" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="correo@empresa.com" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Contraseña *</label>
                  <input type="text" className="input-field" value={formData.password} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••" />
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Rol</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {ROLES.map(role => (
                    <button 
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '20px', 
                        border: formData.role === role ? `2px solid ${roleColors[role]}` : '1px solid var(--border-color)',
                        backgroundColor: formData.role === role ? `${roleColors[role]}15` : 'var(--bg-color)',
                        color: formData.role === role ? roleColors[role] : 'var(--text-muted)',
                        fontWeight: formData.role === role ? 700 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <MdSecurity style={{ verticalAlign: 'middle' }} /> Permisos de Acceso
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Selecciona qué módulos puede ver este usuario. Los permisos se aplican automáticamente al preset del rol, pero puedes personalizarlos.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {MODULES.map(mod => (
                    <label 
                      key={mod.key}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                        padding: '0.5rem 0.75rem', borderRadius: '8px', 
                        border: '1px solid var(--border-color)',
                        backgroundColor: formData.permissions[mod.key] ? 'rgba(42,157,143,0.05)' : 'var(--bg-color)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={formData.permissions[mod.key] || false}
                        onChange={() => handlePermissionToggle(mod.key)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: formData.permissions[mod.key] ? 600 : 400 }}>{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave}><MdSave /> {editingUser ? 'Actualizar' : 'Crear Usuario'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
