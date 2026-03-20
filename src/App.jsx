import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RRSS from './pages/RRSS';
import Design from './pages/Design';
import Host from './pages/Host';
import Soporte from './pages/Soporte';
import CRM from './pages/CRM';
import Cotizador from './pages/Cotizador';
import Finanzas from './pages/Finanzas';
import AdminConfig from './pages/AdminConfig';
import Usuarios from './pages/Usuarios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <GlobalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          
          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
            <Route index element={<Dashboard />} />
            
            {/* Operaciones */}
            <Route path="studio" element={<RRSS />} /> 
            <Route path="design" element={<Design />} />
            <Route path="tech" element={<Host />} />
            <Route path="support" element={<Soporte />} />
            
            {/* Comercial & Finanzas */}
            <Route path="crm" element={<CRM />} />
            <Route path="cotizador" element={<Cotizador />} />
            <Route path="finances" element={<Finanzas />} />
            
            {/* Sistema */}
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="admin" element={<AdminConfig view="admin" />} />
            <Route path="settings" element={<AdminConfig view="settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
