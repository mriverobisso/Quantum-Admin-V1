import React, { useState, useMemo } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd, MdAttachMoney, MdTrendingUp, MdTrendingDown, MdReceipt, MdEdit, MdDelete, MdPictureAsPdf, MdCalendarMonth } from 'react-icons/md';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './GridModules.css';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const Finanzas = () => {
  const { state, openFormModal, deleteItem, addLog } = useGlobalContext();
  const [tab, setTab] = useState('resumen');
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // ── FINANCE DATA ──
  const allHostItems = state.hostItems || [];
  const allQuotes = state.quotes || [];
  const allFinances = state.finances || []; // Mixed manual expenses and incomes
  const allClients = state.clients || [];

  // Monthly abstract filter for recurring items
  const monthlyFinances = useMemo(() => {
    return allFinances.filter(f => {
      if (!f.date) return false;
      const d = new Date(f.date);
      const isThisMonth = d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      if (isThisMonth) return true;
      
      // Virtual chronologic expansion for recurring items created in the past
      if (f.isRecurring) {
        if (d.getFullYear() < selectedYear) return true;
        if (d.getFullYear() === selectedYear && d.getMonth() <= selectedMonth) return true;
      }
      return false;
    });
  }, [allFinances, selectedMonth, selectedYear]);

  const monthlyExpenses = monthlyFinances.filter(f => f.type !== 'income');
  const monthlyManualIncomes = monthlyFinances.filter(f => f.type === 'income');

  // Filter by selected month for non-recurring entities (Host/Quotes)
  const filterByMonth = (date) => {
    if (!date) return false;
    const d = new Date(date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  };

  const monthlyHost = useMemo(() => allHostItems.filter(h => filterByMonth(h.dueDate)), [allHostItems, selectedMonth, selectedYear]);
  
  // Income breakdown
  const hostRevenue = monthlyHost.reduce((acc, h) => acc + (h.cost || 0), 0);
  const quotesRevenue = allQuotes.filter(q => filterByMonth(q.date)).reduce((acc, q) => acc + (q.total || 0), 0);
  const manualRevenue = monthlyManualIncomes.reduce((acc, i) => acc + (i.amount || 0), 0);
  
  const effectiveQuotesRevenue = quotesRevenue > 0 ? quotesRevenue : 0;
  
  const totalIncome = hostRevenue + effectiveQuotesRevenue + manualRevenue;
  const totalExpense = monthlyExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  // Accumulated totals (Jan to selected month)
  const accumulatedData = useMemo(() => {
    let accIncome = 0;
    let accExpense = 0;
    const monthlyBreakdown = [];
    
    for (let m = 0; m <= selectedMonth; m++) {
      const mFinances = allFinances.filter(f => {
        const d = new Date(f.date);
        if (d.getMonth() === m && d.getFullYear() === selectedYear) return true;
        if (f.isRecurring && (d.getFullYear() < selectedYear || (d.getFullYear() === selectedYear && d.getMonth() <= m))) return true;
        return false;
      });
      const mExpensesTotal = mFinances.filter(f => f.type !== 'income').reduce((a, e) => a + (e.amount || 0), 0);
      const mManualIncTotal = mFinances.filter(f => f.type === 'income').reduce((a, i) => a + (i.amount || 0), 0);

      const mHosts = allHostItems.filter(h => {
        const d = new Date(h.dueDate);
        return d.getMonth() === m && d.getFullYear() === selectedYear;
      });
      const mQuotes = allQuotes.filter(q => {
        const d = new Date(q.date);
        return d.getMonth() === m && d.getFullYear() === selectedYear;
      });
      
      const mIncome = mHosts.reduce((a, h) => a + (h.cost || 0), 0) + mQuotes.reduce((a, q) => a + (q.total || 0), 0) + mManualIncTotal;
      
      accIncome += mIncome;
      accExpense += mExpensesTotal;
      
      monthlyBreakdown.push({
        month: MONTHS_ES[m],
        income: mIncome,
        expense: mExpensesTotal,
        balance: mIncome - mExpensesTotal,
        accIncome,
        accExpense,
        accBalance: accIncome - accExpense
      });
    }
    
    return { monthlyBreakdown, accIncome, accExpense, accBalance: accIncome - accExpense };
  }, [allFinances, allHostItems, allQuotes, selectedMonth, selectedYear]);

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const cats = {};
    monthlyExpenses.forEach(e => {
      const cat = e.category || 'General';
      cats[cat] = (cats[cat] || 0) + (e.amount || 0);
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [monthlyExpenses]);

  // ── PDF P&L Report ──
  const handleExportPnL = () => {
    const doc = new jsPDF();
    const primaryBlue = [37, 117, 252];
    const textGray = [80, 80, 80];

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text("REPORTE DE GANANCIAS Y PÉRDIDAS", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`${MONTHS_ES[selectedMonth]} ${selectedYear}`, 14, 30);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 37);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Grupo Quantum - Quantum OS", 196, 20, { align: 'right' });

    // Separator
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setLineWidth(0.6);
    doc.line(14, 42, 196, 42);

    // Income Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(40, 167, 69);
    doc.text("INGRESOS", 14, 52);

    autoTable(doc, {
      startY: 56,
      head: [['Concepto', 'Monto']],
      body: [
        ['Renovaciones de Hosting', `$${hostRevenue.toFixed(2)}`],
        ['Cotizaciones / Proformas', `$${effectiveQuotesRevenue.toFixed(2)}`],
        ['Ingresos Manuales / Otros', `$${manualRevenue.toFixed(2)}`],
        ['', ''],
        ['TOTAL INGRESOS', `$${totalIncome.toFixed(2)}`],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3, textColor: textGray },
      headStyles: { textColor: [150, 150, 150], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [40, 167, 69];
        }
      }
    });

    let yPos = doc.lastAutoTable.finalY + 10;

    // Expenses Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(220, 53, 69);
    doc.text("EGRESOS", 14, yPos);

    const expenseRows = monthlyExpenses.map(e => [
      e.desc,
      e.category || 'General',
      new Date(e.date).toLocaleDateString(),
      `-$${(e.amount || 0).toFixed(2)}`
    ]);
    expenseRows.push(['', '', '', '']);
    expenseRows.push(['', '', 'TOTAL EGRESOS', `-$${totalExpense.toFixed(2)}`]);

    autoTable(doc, {
      startY: yPos + 4,
      head: [['Descripción', 'Categoría', 'Fecha', 'Monto']],
      body: expenseRows.length > 2 ? expenseRows : [['Sin egresos registrados', '', '', '$0.00']],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3, textColor: textGray },
      headStyles: { textColor: [150, 150, 150], fontStyle: 'bold' },
      columnStyles: { 3: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === expenseRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [220, 53, 69];
        }
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Balance
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setLineWidth(1);
    doc.line(14, yPos - 5, 196, yPos - 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(balance >= 0 ? 40 : 220, balance >= 0 ? 167 : 53, balance >= 0 ? 69 : 69);
    doc.text(`RESULTADO NETO: ${balance >= 0 ? '' : '-'}$${Math.abs(balance).toFixed(2)}`, 14, yPos + 5);
    doc.text(balance >= 0 ? 'GANANCIA' : 'PÉRDIDA', 196, yPos + 5, { align: 'right' });

    // Accumulated
    yPos += 20;
    doc.setFontSize(11);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont("helvetica", "bold");
    doc.text("ACUMULADO ENE - " + MONTHS_ES[selectedMonth].toUpperCase(), 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`Ingresos: $${accumulatedData.accIncome.toFixed(2)}  |  Egresos: $${accumulatedData.accExpense.toFixed(2)}  |  Balance: $${accumulatedData.accBalance.toFixed(2)}`, 14, yPos + 7);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.text(`Documento generado por Quantum OS | ${new Date().toLocaleString()}`, 105, footerY, { align: 'center' });

    doc.save(`PnL-${MONTHS_ES[selectedMonth]}-${selectedYear}.pdf`);
    addLog(`Generó reporte P&L de ${MONTHS_ES[selectedMonth]} ${selectedYear}`);
  };

  const tabStyle = (t) => ({
    padding: '0.75rem 1.5rem',
    background: 'none',
    border: 'none',
    borderBottom: tab === t ? '3px solid var(--primary-color)' : '3px solid transparent',
    fontWeight: 'bold',
    color: tab === t ? 'var(--primary-color)' : 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  return (
    <div className="page-container finanzas-container">
      <header className="page-header module-header">
        <div>
          <h1>Gestión Financiera</h1>
          <p className="subtitle">Control de ingresos, egresos y reportes P&L</p>
        </div>
        <div className="module-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Month Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface-color)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <MdCalendarMonth />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
            >
              {MONTHS_ES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', outline: 'none', width: '70px' }}
            >
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {tab === 'ingresos' && (
            <button className="btn-primary" onClick={() => openFormModal('new_income')}><MdAdd /> Registrar Ingreso Automático</button>
          )}
          {tab === 'egresos' && (
            <button className="btn-primary" onClick={() => openFormModal('new_expense')}><MdAdd /> Registrar Egreso</button>
          )}
          {tab === 'reporte' && (
            <button className="btn-primary" onClick={handleExportPnL}><MdPictureAsPdf /> Exportar P&L (PDF)</button>
          )}
        </div>
      </header>

      {/* KPI Cards */}
      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-icon crm"><MdTrendingUp /></div>
          <div className="metric-info">
            <h3>${totalIncome.toFixed(2)}</h3>
            <p>Ingresos ({MONTHS_ES[selectedMonth]})</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon tech" style={{ backgroundColor: 'rgba(220,53,69,0.1)', color: 'var(--status-danger)' }}><MdTrendingDown /></div>
          <div className="metric-info">
            <h3>${totalExpense.toFixed(2)}</h3>
            <p>Egresos ({MONTHS_ES[selectedMonth]})</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon studio" style={{ backgroundColor: balance > 0 ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)', color: balance > 0 ? 'var(--status-ok)' : 'var(--status-danger)' }}><MdAttachMoney /></div>
          <div className="metric-info">
            <h3>${balance.toFixed(2)}</h3>
            <p>Balance ({MONTHS_ES[selectedMonth]})</p>
          </div>
        </div>
        <div className="metric-card" style={{ borderLeft: '3px solid var(--primary-color)' }}>
          <div className="metric-icon" style={{ backgroundColor: 'rgba(37,117,252,0.1)', color: 'var(--primary-color)' }}><MdReceipt /></div>
          <div className="metric-info">
            <h3>${accumulatedData.accBalance.toFixed(2)}</h3>
            <p>Acumulado Ene → {MONTHS_ES[selectedMonth].substring(0, 3)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', backgroundColor: 'var(--surface-color)', padding: '0.5rem 1.5rem 0', borderRadius: '12px 12px 0 0' }}>
          <button style={tabStyle('resumen')} onClick={() => setTab('resumen')}>📊 Resumen</button>
          <button style={tabStyle('ingresos')} onClick={() => setTab('ingresos')}>💰 Ingresos</button>
          <button style={tabStyle('egresos')} onClick={() => setTab('egresos')}>📉 Egresos</button>
          <button style={tabStyle('reporte')} onClick={() => setTab('reporte')}>📋 Reporte P&L</button>
        </div>

        {/* ── TAB: RESUMEN ── */}
        {tab === 'resumen' && (
          <div>
            {/* Monthly Breakdown Table */}
            <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MdCalendarMonth /> Acumulado Mensual {selectedYear}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ textAlign: 'left', padding: '0.6rem', color: 'var(--text-muted)' }}>Mes</th>
                      <th style={{ textAlign: 'right', padding: '0.6rem', color: 'var(--status-ok)' }}>Ingresos</th>
                      <th style={{ textAlign: 'right', padding: '0.6rem', color: 'var(--status-danger)' }}>Egresos</th>
                      <th style={{ textAlign: 'right', padding: '0.6rem', color: 'var(--primary-color)' }}>Balance</th>
                      <th style={{ textAlign: 'right', padding: '0.6rem', color: 'var(--text-muted)', borderLeft: '2px solid var(--border-color)' }}>Acum. Ingresos</th>
                      <th style={{ textAlign: 'right', padding: '0.6rem', color: 'var(--text-muted)' }}>Acum. Egresos</th>
                      <th style={{ textAlign: 'right', padding: '0.6rem', fontWeight: 'bold' }}>Acum. Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accumulatedData.monthlyBreakdown.map((row, i) => (
                      <tr key={i} style={{ 
                        borderBottom: '1px solid var(--border-color)', 
                        backgroundColor: i === selectedMonth ? 'rgba(37,117,252,0.05)' : 'transparent',
                        cursor: 'pointer'
                      }} onClick={() => setSelectedMonth(i)}>
                        <td style={{ padding: '0.6rem', fontWeight: i === selectedMonth ? 700 : 400 }}>{row.month}</td>
                        <td style={{ textAlign: 'right', padding: '0.6rem', color: 'var(--status-ok)' }}>${row.income.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', padding: '0.6rem', color: row.expense > 0 ? 'var(--status-danger)' : 'var(--text-muted)' }}>${row.expense.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', padding: '0.6rem', fontWeight: 600, color: row.balance >= 0 ? 'var(--status-ok)' : 'var(--status-danger)' }}>${row.balance.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', padding: '0.6rem', color: 'var(--text-muted)', borderLeft: '2px solid var(--border-color)' }}>${row.accIncome.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', padding: '0.6rem', color: 'var(--text-muted)' }}>${row.accExpense.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', padding: '0.6rem', fontWeight: 700, color: row.accBalance >= 0 ? 'var(--status-ok)' : 'var(--status-danger)' }}>${row.accBalance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Breakdown */}
            {expenseByCategory.length > 0 && (
              <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Egresos por Categoría ({MONTHS_ES[selectedMonth]})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {expenseByCategory.map(([cat, amount]) => {
                    const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                    return (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ minWidth: '120px', fontSize: '0.85rem', fontWeight: 600 }}>{cat}</span>
                        <div style={{ flex: 1, height: '20px', backgroundColor: 'var(--bg-color)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--status-danger)', borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
                        </div>
                        <span style={{ minWidth: '80px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600 }}>${amount.toFixed(2)}</span>
                        <span style={{ minWidth: '45px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: INGRESOS ── */}
        {tab === 'ingresos' && (
          <div className="grid-module-layout" style={{ marginTop: 0 }}>
             <div className="module-card">
                 <div className="module-card-body">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MdReceipt /> Hosting & Dominios</h3>
                    <p className="card-detail">Ingresos por renovaciones de hosting en {MONTHS_ES[selectedMonth]}.</p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                      {monthlyHost.length > 0 ? monthlyHost.map(h => {
                        const client = allClients.find(c => c.id === h.clientId);
                        return (
                          <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                            <span>{h.domain} ({client?.name || 'N/A'})</span>
                            <span style={{ color: 'var(--status-ok)', fontWeight: 600 }}>${(h.cost || 0).toFixed(2)}</span>
                          </div>
                        );
                      }) : <p style={{ color: 'var(--text-muted)' }}>Sin renovaciones este mes.</p>}
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                       <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-ok)' }}>${hostRevenue.toFixed(2)}</span>
                    </div>
                 </div>
             </div>
             
             <div className="module-card">
                 <div className="module-card-body">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MdReceipt /> Cotizaciones</h3>
                    <p className="card-detail">Proformas facturadas en {MONTHS_ES[selectedMonth]}.</p>
                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                       <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-ok)' }}>${effectiveQuotesRevenue.toFixed(2)}</span>
                    </div>
                 </div>
             </div>
             
             {/* Manual Incomes Loop */}
             {monthlyManualIncomes.map(inc => (
                <div key={inc.id} className="module-card" style={{ borderLeft: '4px solid var(--status-ok)', position: 'relative' }}>
                  <div className="card-top-actions" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                     <button className="icon-btn edit" onClick={() => openFormModal('edit_income', inc)}><MdEdit /></button>
                     <button className="icon-btn danger" onClick={() => deleteItem('finances', inc.id)}><MdDelete /></button>
                  </div>
                  <div className="module-card-body">
                    <h3 className="card-title" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {inc.desc}
                      {inc.isRecurring && <span style={{ fontSize: '0.65rem', padding: '2px 6px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>🔁</span>}
                    </h3>
                    {inc.category && <span style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>{inc.category}</span>}
                    <p className="card-detail code-text" style={{ marginTop: '0.5rem' }}>Creado: {new Date(inc.date).toLocaleDateString()}</p>
                    <div style={{ marginTop: '1rem' }}>
                       <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-ok)' }}>+${(inc.amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        )}

        {/* ── TAB: EGRESOS ── */}
        {tab === 'egresos' && (
          <div className="grid-module-layout" style={{ marginTop: 0 }}>
             {monthlyExpenses.map(exp => (
                <div key={exp.id} className="module-card" style={{ borderLeft: '4px solid var(--status-danger)', position: 'relative' }}>
                  <div className="card-top-actions" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                     <button className="icon-btn edit" onClick={() => openFormModal('edit_expense', exp)}><MdEdit /></button>
                     <button className="icon-btn danger" onClick={() => deleteItem('finances', exp.id)}><MdDelete /></button>
                  </div>
                  <div className="module-card-body">
                    <h3 className="card-title" style={{ fontSize: '1.1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {exp.desc}
                      {exp.isRecurring && <span style={{ fontSize: '0.65rem', padding: '2px 6px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>🔁</span>}
                    </h3>
                    {exp.category && <span style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>{exp.category}</span>}
                    <p className="card-detail code-text" style={{ marginTop: '0.5rem' }}>Creado: {new Date(exp.date).toLocaleDateString()}</p>
                    <div style={{ marginTop: '1rem' }}>
                       <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-danger)' }}>-${(exp.amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
             ))}
             {monthlyExpenses.length === 0 && (
                <div className="empty-grid-state" style={{ gridColumn: '1 / -1' }}>No se han registrado egresos en {MONTHS_ES[selectedMonth]} {selectedYear}.</div>
             )}
          </div>
        )}

        {/* ── TAB: P&L REPORT ── */}
        {tab === 'reporte' && (
          <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: '12px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Estado de Ganancias y Pérdidas</h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{MONTHS_ES[selectedMonth]} {selectedYear}</span>
            </div>

            {/* INCOME */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--status-ok)', borderBottom: '2px solid var(--status-ok)', paddingBottom: '0.3rem', marginBottom: '0.8rem' }}>INGRESOS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span>Renovaciones de Hosting</span>
                  <span style={{ fontWeight: 600 }}>${hostRevenue.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span>Cotizaciones / Proformas</span>
                  <span style={{ fontWeight: 600 }}>${effectiveQuotesRevenue.toFixed(2)}</span>
                </div>
                {monthlyManualIncomes.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>{i.desc} {i.isRecurring && '🔁'} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({i.category})</span></span>
                    <span style={{ fontWeight: 600 }}>${(i.amount || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-ok)', marginTop: '0.8rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-color)' }}>
                <span>TOTAL INGRESOS</span>
                <span>${totalIncome.toFixed(2)}</span>
              </div>
            </div>

            {/* EXPENSES */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--status-danger)', borderBottom: '2px solid var(--status-danger)', paddingBottom: '0.3rem', marginBottom: '0.8rem' }}>EGRESOS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1rem' }}>
                {monthlyExpenses.length > 0 ? monthlyExpenses.map(e => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>{e.desc} {e.isRecurring && '🔁'} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({e.category || 'General'})</span></span>
                    <span style={{ fontWeight: 600 }}>-${(e.amount || 0).toFixed(2)}</span>
                  </div>
                )) : (
                  <span style={{ color: 'var(--text-muted)' }}>Sin egresos registrados este mes.</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-danger)', marginTop: '0.8rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-color)' }}>
                <span>TOTAL EGRESOS</span>
                <span>-${totalExpense.toFixed(2)}</span>
              </div>
            </div>

            {/* NET RESULT */}
            <div style={{ 
              padding: '1.5rem', 
              borderRadius: '12px', 
              backgroundColor: balance >= 0 ? 'rgba(40,167,69,0.08)' : 'rgba(220,53,69,0.08)', 
              border: `2px solid ${balance >= 0 ? 'var(--status-ok)' : 'var(--status-danger)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, color: balance >= 0 ? 'var(--status-ok)' : 'var(--status-danger)' }}>
                  {balance >= 0 ? '✅ GANANCIA NETA' : '⚠️ PÉRDIDA NETA'}
                </h3>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Resultado del periodo {MONTHS_ES[selectedMonth]} {selectedYear}</p>
              </div>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: balance >= 0 ? 'var(--status-ok)' : 'var(--status-danger)' }}>
                {balance >= 0 ? '' : '-'}${Math.abs(balance).toFixed(2)}
              </span>
            </div>

            {/* ACCUMULATED */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Acumulado Enero → {MONTHS_ES[selectedMonth]}</h4>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Ingresos:</span>
                  <strong style={{ color: 'var(--status-ok)', marginLeft: '0.3rem' }}>${accumulatedData.accIncome.toFixed(2)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Egresos:</span>
                  <strong style={{ color: 'var(--status-danger)', marginLeft: '0.3rem' }}>${accumulatedData.accExpense.toFixed(2)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Balance:</span>
                  <strong style={{ color: accumulatedData.accBalance >= 0 ? 'var(--status-ok)' : 'var(--status-danger)', marginLeft: '0.3rem' }}>${accumulatedData.accBalance.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finanzas;
