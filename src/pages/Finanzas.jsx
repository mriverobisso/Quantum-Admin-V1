import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd, MdAttachMoney, MdTrendingUp, MdTrendingDown, MdReceipt, MdEdit, MdDelete } from 'react-icons/md';
import './GridModules.css';

const Finanzas = () => {
  const { state, openFormModal, deleteItem } = useGlobalContext();
  const [tab, setTab] = useState('ingresos');

  // Ingresos autogenerados a partir de Host + Cotizador (Mockup)
  const quotesRevenue = state.quotes ? state.quotes.reduce((acc, q) => acc + q.total, 0) : 1250;
  const hostRevenue = state.hostItems ? state.hostItems.reduce((acc, h) => acc + h.cost, 0) : 120;
  const totalIncome = quotesRevenue + hostRevenue;

  // Egresos locales (del Contexto)
  const expenses = state.finances || [];
  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="page-container finanzas-container">
      <header className="page-header module-header">
        <div>
          <h1>Gestión Financiera</h1>
          <p className="subtitle">Tracking de caja e ingresos</p>
        </div>
        {tab === 'egresos' && (
           <button className="btn-primary" onClick={() => openFormModal('new_expense')}><MdAdd /> Registrar Egreso</button>
        )}
      </header>

      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-icon crm"><MdTrendingUp /></div>
          <div className="metric-info">
            <h3>${totalIncome.toFixed(2)}</h3>
            <p>Ingresos Totales (Mes)</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon tech" style={{ backgroundColor: 'rgba(220,53,69,0.1)', color: 'var(--status-danger)' }}><MdTrendingDown /></div>
          <div className="metric-info">
            <h3>${totalExpense.toFixed(2)}</h3>
            <p>Egresos Totales (Mes)</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon studio" style={{ backgroundColor: balance > 0 ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)', color: balance > 0 ? 'var(--status-ok)' : 'var(--status-danger)' }}><MdAttachMoney /></div>
          <div className="metric-info">
            <h3>${balance.toFixed(2)}</h3>
            <p>Balance Neto</p>
          </div>
        </div>
      </div>

      <div className="card section-card" style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}>
        <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', backgroundColor: 'var(--surface-color)', padding: '0.5rem 1.5rem 0', borderRadius: '12px 12px 0 0' }}>
          <button 
             style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: tab === 'ingresos' ? '3px solid var(--primary-color)' : '3px solid transparent', fontWeight: 'bold', color: tab === 'ingresos' ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
             onClick={() => setTab('ingresos')}
          >
            Detalle Ingresos
          </button>
          <button 
             style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: tab === 'egresos' ? '3px solid var(--primary-color)' : '3px solid transparent', fontWeight: 'bold', color: tab === 'egresos' ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
             onClick={() => setTab('egresos')}
          >
            Registro Egresos
          </button>
        </div>

        {tab === 'ingresos' && (
          <div className="grid-module-layout" style={{ marginTop: 0 }}>
             <div className="module-card">
                 <div className="module-card-body">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MdReceipt /> Cotizador de Servicios</h3>
                    <p className="card-detail">Ingresos extraídos directamente de las proformas validadas.</p>
                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                       <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-ok)' }}>${quotesRevenue.toFixed(2)}</span>
                    </div>
                 </div>
             </div>
             
             <div className="module-card">
                 <div className="module-card-body">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MdReceipt /> Módulo Host</h3>
                    <p className="card-detail">Ingresos recurrentes por ventas y renovaciones de dominios.</p>
                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                       <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-ok)' }}>${hostRevenue.toFixed(2)}</span>
                    </div>
                 </div>
             </div>
          </div>
        )}

        {tab === 'egresos' && (
          <div className="grid-module-layout" style={{ marginTop: 0 }}>
             {expenses.map(exp => (
                <div key={exp.id} className="module-card" style={{ borderLeft: '4px solid var(--status-danger)', position: 'relative' }}>
                  <div className="card-top-actions" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                     <button className="icon-btn edit" onClick={() => openFormModal('edit_expense', exp)}><MdEdit /></button>
                     <button className="icon-btn danger" onClick={() => deleteItem('finances', exp.id)}><MdDelete /></button>
                  </div>
                  <div className="module-card-body">
                    <h3 className="card-title" style={{ fontSize: '1.1rem' }}>{exp.desc}</h3>
                    <p className="card-detail code-text">{new Date(exp.date).toLocaleDateString()}</p>
                    <div style={{ marginTop: '1rem' }}>
                       <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-danger)' }}>-${exp.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
             ))}
             {expenses.length === 0 && (
                <div className="empty-grid-state" style={{ gridColumn: '1 / -1' }}>No se han registrado egresos en este periodo.</div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Finanzas;
