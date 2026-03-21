import React from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import AIChatPanel from '../components/AIChatPanel';
import { Navigate } from 'react-router-dom';

const Antu = () => {
  const { state } = useGlobalContext();
  const isAdmin = (state.currentUser?.role === 'Administrador');

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ height: 'calc(100vh - 70px)', width: '100%', overflow: 'hidden', padding: '0', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginLeft: '1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
        <div>
          <h1>ANTU Inteligencia Artificial</h1>
          <p className="subtitle">Tu asistente táctico en tiempo real.</p>
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <AIChatPanel isOpen={true} isFullScreen={true} />
      </div>
    </div>
  );
};

export default Antu;
