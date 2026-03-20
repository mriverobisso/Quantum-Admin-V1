import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalContext';
import './Login.css';

const Login = ({ onLogin }) => {
  const { state, setState } = useGlobalContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const users = state.users || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Set current user in state (shared via Firestore)
      setState(prev => ({
        ...prev,
        currentUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      }));
      onLogin();
      navigate('/');
    } else {
      setError('Email o contraseña incorrectos. Solo usuarios registrados pueden acceder.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.svg" alt="Quantum" className="login-main-logo" />
          <p>Inicia sesión para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div style={{ backgroundColor: 'rgba(220,53,69,0.1)', color: 'var(--status-danger)', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn-primary w-full">Ingresar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
