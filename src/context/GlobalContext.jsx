import React, { createContext, useContext, useState, useEffect } from 'react';

const GlobalContext = createContext();

const initialMockState = {
  settings: {
    darkMode: false,
    agencyName: 'Quantum Agency',
    ruc: '1234567890001',
    logo: null
  },
  clients: [
    { id: 'c1', name: 'Empresa Alpha S.A', ruc: '0991234567001', birthday: '2026-03-25', services: ['Host', 'RRSS'] },
    { id: 'c2', name: 'Dr. John Doe', ruc: '0912345678001', birthday: '2026-08-14', services: ['Soporte'] },
  ],
  tasks: [
    { id: 't1', title: 'Post Instagram - Promo', module: 'rrss', status: 'idea', dueDate: '2026-03-20T10:00:00', clientId: 'c1', network: 'instagram' },
    { id: 't2', title: 'Banner Web', module: 'design', status: 'produccion', dueDate: '2026-03-18T15:00:00', clientId: 'c2', urgency: 'high' }
  ],
  hostItems: [
    { id: 'h1', clientId: 'c1', domain: 'empresa-alpha.com', type: 'Hosting VIP', dueDate: '2026-03-30', status: 'active', cost: 120 }
  ],
  tickets: [
    { id: 'tk1', clientId: 'c2', detail: 'Caída de servidor', reportDate: '2026-03-16T09:00:00', status: 'abierto' }
  ],
  quotes: [],
  finances: [],
  catalog: [],
  logs: []
};

export const GlobalProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('quantum_state');
    return saved ? JSON.parse(saved) : initialMockState;
  });

  const [previewModal, setPreviewModal] = useState({ isOpen: false, type: null, id: null });
  const [formModal, setFormModal] = useState({ isOpen: false, type: null, data: null });

  useEffect(() => {
    localStorage.setItem('quantum_state', JSON.stringify(state));
    
    // Apply theme
    if (state.settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [state]);

  const updateSetting = (key, value) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
      logs: [{ date: new Date().toISOString(), user: 'Admin', action: `Actualizó configuración: ${key}` }, ...prev.logs]
    }));
  };

  const addLog = (action) => {
    setState(prev => ({
      ...prev,
      logs: [{ date: new Date().toISOString(), user: 'Mario', action }, ...prev.logs]
    }));
  };

  const setPreview = (type, id) => {
    setPreviewModal({ isOpen: true, type, id });
  };
  
  const closePreview = () => setPreviewModal({ isOpen: false, type: null, id: null });

  const openFormModal = (type, data = null) => {
    setFormModal({ isOpen: true, type, data });
  };

  const closeFormModal = () => setFormModal({ isOpen: false, type: null, data: null });

  const deleteItem = (collection, id) => {
    if(window.confirm('¿Seguro que deseas eliminar este registro permanentemente?')) {
      setState(prev => ({ ...prev, [collection]: prev[collection].filter(i => i.id !== id) }));
      addLog(`Eliminó registro ${id} de ${collection}`);
    }
  };

  const archiveItem = (collection, id) => {
    updateItem(collection, id, { status: 'archivado' });
    addLog(`Archivó registro ${id} en ${collection}`);
  };

  const duplicateItem = (collection, id) => {
    const original = state[collection].find(i => i.id === id);
    if (original) {
      const newItem = {
        ...original,
        id: `${id}_copy_${Date.now()}`,
        title: original.title ? `${original.title} - COPIA` : original.name ? `${original.name} - COPIA` : 'Copia',
      };
      setState(prev => ({ ...prev, [collection]: [...prev[collection], newItem] }));
      addLog(`Duplicó registro ${id} en ${collection}`);
    }
  };

  return (
    <GlobalContext.Provider value={{ 
      state, setState, updateSetting, addLog, 
      previewModal, setPreview, closePreview, 
      formModal, openFormModal, closeFormModal,
      deleteItem, updateItem, archiveItem, duplicateItem
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
