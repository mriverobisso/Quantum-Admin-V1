import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const GlobalContext = createContext();

const FIRESTORE_DOC = 'appState/quantum_main';

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

// Helper: persist state to Firestore (debounced)
let saveTimeout = null;
const saveToFirestore = (newState) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await setDoc(doc(db, 'appState', 'quantum_main'), newState);
    } catch (err) {
      console.error('Firestore save error:', err);
      // Fallback: save to localStorage
      localStorage.setItem('quantum_state', JSON.stringify(newState));
    }
  }, 500); // Debounce 500ms to avoid excessive writes
};

export const GlobalProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('quantum_state');
    return saved ? JSON.parse(saved) : initialMockState;
  });

  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('connecting'); // 'connecting' | 'synced' | 'offline'
  const isRemoteUpdate = useRef(false);

  const [previewModal, setPreviewModal] = useState({ isOpen: false, type: null, id: null });
  const [formModal, setFormModal] = useState({ isOpen: false, type: null, data: null });

  // ── FIRESTORE REAL-TIME LISTENER ──
  useEffect(() => {
    const docRef = doc(db, 'appState', 'quantum_main');

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.data();
        isRemoteUpdate.current = true;
        setState(remoteData);
        // Also keep localStorage as a cache
        localStorage.setItem('quantum_state', JSON.stringify(remoteData));
        setSyncStatus('synced');
      } else {
        // First time: seed Firestore with initial/local state
        const localSaved = localStorage.getItem('quantum_state');
        const seedData = localSaved ? JSON.parse(localSaved) : initialMockState;
        setDoc(docRef, seedData).catch(console.error);
        setSyncStatus('synced');
      }
      setLoading(false);
    }, (error) => {
      console.error('Firestore listener error:', error);
      setSyncStatus('offline');
      setLoading(false);
      // App will still work from localStorage
    });

    return () => unsubscribe();
  }, []);

  // ── PERSIST STATE CHANGES TO FIRESTORE ──
  useEffect(() => {
    // Apply theme
    if (state.settings?.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Skip saving to Firestore if the change came FROM Firestore
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    // Save to Firestore (debounced) + localStorage
    localStorage.setItem('quantum_state', JSON.stringify(state));
    saveToFirestore(state);
  }, [state]);

  // ── STATE MUTATION FUNCTIONS (unchanged API) ──
  const updateSetting = (key, value) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
      logs: [{ date: new Date().toISOString(), user: 'Admin', action: `Actualizó configuración: ${key}` }, ...prev.logs]
    }));
  };

  const updateItem = (collection, id, newData) => {
    setState(prev => ({
      ...prev,
      [collection]: (prev[collection] || []).map(i => i.id === id ? { ...i, ...newData } : i)
    }));
  };

  const addLog = (action) => {
    setState(prev => ({
      ...prev,
      logs: [{ date: new Date().toISOString(), user: 'Mario', action }, ...(prev.logs || [])]
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
      setState(prev => ({ ...prev, [collection]: (prev[collection] || []).filter(i => i.id !== id) }));
      addLog(`Eliminó registro ${id} de ${collection}`);
    }
  };

  const archiveItem = (collection, id) => {
    updateItem(collection, id, { status: 'archivado' });
    addLog(`Archivó registro ${id} en ${collection}`);
  };

  const duplicateItem = (collection, id) => {
    const original = (state[collection] || []).find(i => i.id === id);
    if (original) {
      const newItem = {
        ...original,
        id: `${id}_copy_${Date.now()}`,
        title: original.title ? `${original.title} - COPIA` : original.name ? `${original.name} - COPIA` : 'Copia',
      };
      setState(prev => ({ ...prev, [collection]: [...(prev[collection] || []), newItem] }));
      addLog(`Duplicó registro ${id} en ${collection}`);
    }
  };

  // ── LOADING SCREEN ──
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', backgroundColor: '#0a0a1a', color: '#fff',
        flexDirection: 'column', gap: '1rem', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ fontSize: '3rem', fontWeight: 700 }}>Q</div>
        <p style={{ color: '#888' }}>Sincronizando datos...</p>
      </div>
    );
  }

  return (
    <GlobalContext.Provider value={{ 
      state, setState, updateSetting, addLog, 
      previewModal, setPreview, closePreview, 
      formModal, openFormModal, closeFormModal,
      deleteItem, updateItem, archiveItem, duplicateItem,
      syncStatus
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
