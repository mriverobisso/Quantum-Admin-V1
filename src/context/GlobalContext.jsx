import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, updateDoc, onSnapshot, collection } from 'firebase/firestore';

const GlobalContext = createContext();

const FIRESTORE_DOC = 'appState/quantum_main';

const initialMockState = {
  settings: {
    darkMode: false,
    agencyName: 'Quantum Agency',
    ruc: '1234567890001',
    logo: null
  },
  users: [
    {
      id: 'u_admin',
      name: 'Mario Rivero',
      email: 'mario@grupoquantum.uy',
      password: 'Mario1983@_',
      role: 'Administrador',
      permissions: { dashboard: true, rrss: true, design: true, host: true, soporte: true, crm: true, cotizador: true, finanzas: true, admin: true, config: true, usuarios: true }
    }
  ],
  currentUser: {
    id: 'u_admin',
    name: 'Mario Rivero',
    email: 'mario@grupoquantum.uy',
    role: 'Administrador',
    permissions: { dashboard: true, rrss: true, design: true, host: true, soporte: true, crm: true, cotizador: true, finanzas: true, admin: true, config: true, usuarios: true }
  },
  clients: [
    { id: 'c1', name: 'Empresa Alpha S.A', ruc: '0991234567001', email: 'info@empresaalpha.com', phone: '+593 4 200 0000', address: 'Av. Principal 123, Of. 4B', city: 'Guayaquil', contactPerson: 'Carlos Mendoza', contactRole: 'Gerente Comercial', birthday: '2026-03-25', services: ['Host', 'RRSS'], notes: 'Cliente premium, facturación mensual' },
    { id: 'c2', name: 'Dr. John Doe', ruc: '0912345678001', email: 'john@doe.com', phone: '+593 99 123 4567', address: 'Centro Médico Norte', city: 'Quito', contactPerson: 'John Doe', contactRole: 'Director', birthday: '2026-08-14', services: ['Soporte'], notes: '' },
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
  meetings: [
    { id: 'm1', title: 'Reunión Comercial Q2', date: '2026-03-24', startTime: '10:00', endTime: '11:00', visibility: 'public', organizerId: 'u_admin' },
    { id: 'm2', title: 'Revisión Estratégica', date: '2026-03-25', startTime: '15:00', endTime: '16:30', visibility: 'private', organizerId: 'u_admin' }
  ],
  quotes: [],
  finances: [],
  catalog: [],
  logs: []
};

// We no longer use a single macro-document, instead we sync individual collections
const COLLECTIONS = ['clients', 'tasks', 'hostItems', 'tickets', 'meetings', 'quotes', 'finances', 'catalog', 'logs', 'users'];

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

  // ── FIRESTORE REAL-TIME MULTI-COLLECTION LISTENERS ──
  useEffect(() => {
    const unsubscribes = [];
    let loadedCount = 0;

    COLLECTIONS.forEach(colName => {
      const q = collection(db, colName);
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id }));
        
        // If collection is initially empty, we might want to seed it from local
        if (items.length === 0 && initialMockState[colName]) {
          /* Only seed if completely empty (first time open) 
             We skip automatic seeding here to avoid duplicates, 
             the migration script will handle initial populating */
        }

        isRemoteUpdate.current = true;
        setState(prev => ({ ...prev, [colName]: items }));
        
        // Count initial loads and mark synced
        loadedCount++;
        if (loadedCount >= COLLECTIONS.length) {
          setSyncStatus('synced');
          setLoading(false);
        }
      }, (error) => {
        console.error(`Firestore listener error on ${colName}:`, error);
        setSyncStatus('offline');
        setLoading(false);
      });
      unsubscribes.push(unsub);
    });

    // We also need to listen to the Settings "singleton" document
    const settingsSub = onSnapshot(doc(db, 'settings', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        isRemoteUpdate.current = true;
        setState(prev => ({ ...prev, settings: docSnap.data() }));
      }
    });
    unsubscribes.push(settingsSub);

    return () => unsubscribes.forEach(fn => fn());
  }, []);

  // ── PERSIST STATE CHANGES TO FIRESTORE ──
  useEffect(() => {
    // Apply theme
    if (state.settings?.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Skip saving to localStorage if the change came FROM Firestore
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    // Keep localStorage as a purely offline/cache fallback
    localStorage.setItem('quantum_state', JSON.stringify(state));
  }, [state]);

  // ── STATE MUTATION FUNCTIONS (FIRESTORE DIRECT) ──
  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...state.settings, [key]: value };
      await setDoc(doc(db, 'settings', 'main'), newSettings, { merge: true });
      addLog(`Actualizó configuración: ${key}`);
    } catch(err) { console.error(err); }
  };

  const updateItem = async (colName, id, newData) => {
    if (!COLLECTIONS.includes(colName)) return; // Prevents writing local-only keys
    try {
      await updateDoc(doc(db, colName, id), newData);
    } catch(err) { console.error('Error updating:', err); }
  };

  const addItem = async (colName, itemData) => {
    if (!COLLECTIONS.includes(colName)) return;
    try {
      // Use the provided ID or let Firestore generate it if we used addDoc, but we want to stick to itemData.id
      const idToUse = itemData.id || `item_${Date.now()}`;
      await setDoc(doc(db, colName, idToUse), { ...itemData, id: idToUse });
    } catch(err) { console.error('Error adding:', err); }
  };

  const addLog = async (action) => {
    try {
      const logId = `log_${Date.now()}`;
      await setDoc(doc(db, 'logs', logId), {
        id: logId,
        date: new Date().toISOString(),
        user: state.currentUser?.name || 'Sistema',
        action
      });
    } catch(err) { console.error(err); }
  };

  const setPreview = (type, id) => {
    setPreviewModal({ isOpen: true, type, id });
  };
  
  const closePreview = () => setPreviewModal({ isOpen: false, type: null, id: null });

  const openFormModal = (type, data = null) => {
    setFormModal({ isOpen: true, type, data });
  };

  const closeFormModal = () => setFormModal({ isOpen: false, type: null, data: null });

  const deleteItem = async (colName, id) => {
    if (!COLLECTIONS.includes(colName)) return;
    if(window.confirm('¿Seguro que deseas eliminar este registro permanentemente?')) {
      try {
        await deleteDoc(doc(db, colName, id));
        addLog(`Eliminó registro ${id} de ${colName}`);
      } catch(err) { console.error('Error deleting:', err); }
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
      deleteItem, updateItem, addItem, archiveItem, duplicateItem,
      syncStatus
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
