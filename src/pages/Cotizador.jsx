import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAddShoppingCart, MdPictureAsPdf, MdDeleteOutline, MdAddCircleOutline, MdEdit, MdAssignment, MdViewKanban, MdVisibility } from 'react-icons/md';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Cotizador.css';

const KANBAN_STAGES = ['Enviada', 'Ajustes', 'Cerrada', 'Descartada'];

const Cotizador = () => {
  const { state, setState, addLog, openFormModal, deleteItem, updateItem, addItem, setPreview } = useGlobalContext();
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' or 'kanban'
  
  // Generator State
  const [items, setItems] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0); 
  
  const quickAdds = state.catalog || [];
  const clients = state.clients || [];
  const quotes = state.quotes || [];
  const selectedClient = clients.find(c => c.id === selectedClientId);
  
  // Auto-derived from CRM
  const clientName = selectedClient?.name || '';
  const contactName = selectedClient?.contactPerson || '';
  const contactEmail = selectedClient?.email || '';

  const handleAddItem = (item) => {
    setItems(prev => [...prev, { ...item, lineId: Date.now(), quantity: 1, description: '', itemDiscount: 0 }]);
  };

  const handleRemoveItem = (lineId) => {
    setItems(prev => prev.filter(i => i.lineId !== lineId));
  };
  
  const updateLine = (lineId, field, value) => {
    setItems(prev => prev.map(i => i.lineId === lineId ? { ...i, [field]: value } : i));
  };

  const handleEditCatalogItem = (item) => {
    openFormModal('edit_catalog_item', item);
  };

  const handleDeleteCatalogItem = (id) => {
    deleteItem('catalog', id);
  };

  // Calculate totals resolving individual item discounts and quantities
  const subtotal = items.reduce((sum, item) => sum + ((item.price * (item.quantity || 1)) * (1 - (item.itemDiscount || 0)/100)), 0);
  const discountTotal = subtotal * (discount / 100);
  const total = subtotal - discountTotal;

  const handleExportPDF = () => {
    if(!selectedClientId || items.length === 0) {
       alert('Seleccione un cliente del CRM y al menos un servicio del catálogo.');
       return;
    }

    const doc = new jsPDF();
    const invoiceNumber = `PF-${Date.now().toString().slice(-4)}`;
    const primaryBlue = [37, 117, 252];
    const textGray = [80, 80, 80];
    const lightBorder = [220, 220, 220];

    // Top Right Header Config (Right Aligned)
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 10);
    doc.text(`Proforma ${invoiceNumber}`, 196, 10, { align: 'right' });

    // Logo Text (Top Left)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(80, 80, 80);
    doc.text("QUANTUM", 14, 30);

    // Agency Details (Top Right)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text("Grupo Quantum", 196, 25, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`Representante: Mario Rivero Bisso`, 196, 30, { align: 'right' });
    doc.setFont("helvetica", "normal");
    doc.text(`RUC: ${state.settings?.ruc || 'N/A'}`, 196, 35, { align: 'right' });
    doc.text(`hola@grupoquantum.ec`, 196, 40, { align: 'right' });
    doc.text(`+593 99 819 0428`, 196, 45, { align: 'right' });
    doc.text(`Alborada 14va. - Guayaquil, Ecuador`, 196, 50, { align: 'right' });

    // Separator Line
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setLineWidth(0.6);
    doc.line(14, 55, 196, 55);

    // Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(`COTIZACIÓN ${invoiceNumber}`, 14, 65);

    // Client Details
    doc.setFontSize(11);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Cliente: ", 14, 75);
    doc.setFont("helvetica", "normal");
    doc.text(clientName, 30, 75);

    doc.setFont("helvetica", "bold");
    doc.text("Contacto: ", 14, 82);
    doc.setFont("helvetica", "normal");
    doc.text(contactName || "N/A", 32, 82);

    doc.setFont("helvetica", "bold");
    doc.text("Fecha: ", 105, 75);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 120, 75);

    doc.setFont("helvetica", "bold");
    doc.text("Email: ", 105, 82);
    doc.setFont("helvetica", "normal");
    doc.text(contactEmail || "N/A", 118, 82);

    // Table Generation
    const tableData = items.map(i => {
       const lineTotal = (i.price * (i.quantity || 1)) * (1 - (i.itemDiscount || 0)/100);
       return [
         i.name,
         i.description || '',
         i.quantity || 1,
         `$${i.price.toFixed(2)}`,
         `${i.itemDiscount || 0}%`,
         `$${lineTotal.toFixed(2)}`
       ];
    });

    autoTable(doc, {
      startY: 95,
      head: [['Servicio', 'Descripción', 'Cant.', 'P. Unit.', 'Desc.', 'Subtotal']],
      body: tableData,
      theme: 'plain',
      styles: {
         fontSize: 10,
         cellPadding: 4,
         textColor: textGray
      },
      headStyles: {
         textColor: [150, 150, 150],
         fontStyle: 'bold'
      },
      columnStyles: {
         0: { cellWidth: 35 },
         1: { cellWidth: 70 },
         2: { halign: 'center', cellWidth: 15 },
         3: { halign: 'center', cellWidth: 20 },
         4: { halign: 'center', cellWidth: 15 },
         5: { halign: 'right', cellWidth: 25 }
      },
      didDrawCell: (data) => {
         // Create row bottom border
         if (data.row.section === 'body' || data.row.section === 'head') {
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.1);
            doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
         }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Totals Section
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal:`, 160, finalY, { align: 'right' });
    doc.text(`$${subtotal.toFixed(2)}`, 196, finalY, { align: 'right' });

    if (discount > 0) {
      doc.text(`Desc. Global (${discount}%):`, 160, finalY + 6, { align: 'right' });
      doc.text(`-$${discountTotal.toFixed(2)}`, 196, finalY + 6, { align: 'right' });
    }

    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setLineWidth(0.6);
    doc.line(14, finalY + 12, 196, finalY + 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(`TOTAL:`, 160, finalY + 22, { align: 'right' });
    doc.text(`$${total.toFixed(2)}`, 196, finalY + 22, { align: 'right' });

    // Notes Section
    if (notes) {
       doc.setDrawColor(255, 165, 0); // Orange vertical line
       doc.setLineWidth(1.5);
       doc.line(14, finalY + 30, 14, finalY + 40);
       
       doc.setFontSize(11);
       doc.setTextColor(40, 40, 40);
       doc.setFont("helvetica", "bold");
       doc.text("Notas: ", 18, finalY + 35);
       doc.setFont("helvetica", "normal");
       doc.text(`- ${notes}`, 32, finalY + 35);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    const footerY = doc.internal.pageSize.getHeight() - 20;
    
    // Validity Note
    doc.setFont("helvetica", "italic");
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(`* La presente cotización tiene una validez de 5 días a partir de su emisión.`, 14, footerY - 5);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text(`Documento generado por Quantum OS | ${new Date().toLocaleString()}`, 105, footerY, { align: 'center' });

    // Antu Brand Mark
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryBlue[0]-50, primaryBlue[1]-50, primaryBlue[2]);
    doc.text("ANTU", 196, footerY + 8, { align: 'right' });
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text("by Quantum", 196, footerY + 11, { align: 'right' });

    doc.save(`${invoiceNumber}-${clientName.replace(/\s+/g, '')}.pdf`);
    
    // Save to History / Kanban
    const newQuote = {
      id: `q_${Date.now()}`,
      invoiceNumber,
      clientId: selectedClientId,
      clientName,
      total,
      date: new Date().toISOString(),
      status: 'Enviada',
      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
    };
    addItem('quotes', newQuote);
    addLog(`Generó y guardó Proforma ${invoiceNumber} para ${clientName} por $${total}`);
    
    // Switch to Kanban to see the new quote
    setActiveTab('kanban');
    
    // Reset Form
    setItems([]);
  };

  const handleChangeQuoteStatus = (quoteId, newStatus) => {
    updateItem('quotes', quoteId, { status: newStatus });
    addLog(`Actualizó estado de la proforma a: ${newStatus}`);
  };

  const handleDeleteQuote = (quote) => {
    if (window.confirm(`¿Seguro que deseas eliminar la proforma ${quote.invoiceNumber}?`)) {
      setState(prev => ({ ...prev, quotes: (prev.quotes || []).filter(q => q.id !== quote.id) }));
      addLog(`Eliminó proforma ${quote.invoiceNumber}`);
    }
  };

  return (
    <div className="page-container cotizador-container">
      <header className="page-header module-header">
        <div>
          <h1>Cotizador y Proformas</h1>
          <p className="subtitle">Generador interactivo de ventas B2B.</p>
        </div>
        <button className="btn-primary" onClick={() => openFormModal('new_catalog_item')}>
          <MdAddCircleOutline /> Nuevo en Catálogo
        </button>
      </header>

      {/* Tabs */}
      <div className="cotizador-tabs">
        <button 
          className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`} 
          onClick={() => setActiveTab('generator')}
        >
          <MdAssignment /> Generar Proforma
        </button>
        <button 
          className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`} 
          onClick={() => setActiveTab('kanban')}
        >
          <MdViewKanban /> Historial (Kanban)
        </button>
      </div>

      {activeTab === 'generator' && (
        <div className="cotizador-layout">
          <div className="cotizador-invoice">
            <div className="card invoice-card">
              <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h2>Proforma Actual</h2>
                   <p>NOTA DE VENTA (Sin IVA)</p>
                 </div>
                 <button className="btn-primary" onClick={handleExportPDF}><MdPictureAsPdf /> Guardar y Exportar PDF</button>
              </div>
              
              <div className="invoice-client mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div>
                   <label>Cliente del CRM (Obligatorio) *</label>
                   <select className="input-field" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} required style={{ fontWeight: selectedClientId ? 'bold' : 'normal' }}>
                     <option value="">-- Seleccionar Cliente Registrado --</option>
                     {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.ruc})</option>)}
                   </select>
                   {!selectedClientId && <p style={{ fontSize: '0.75rem', color: 'var(--status-danger)', marginTop: '0.3rem' }}>⚠ Solo clientes registrados en el CRM</p>}
                 </div>
                 <div>
                   <label>Contacto (Auto CRM):</label>
                   <input type="text" className="input-field" value={contactName} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                 </div>
                 <div>
                   <label>Email (Auto CRM):</label>
                   <input type="email" className="input-field" value={contactEmail} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                 </div>
                 <div>
                   <label>Notas Adicionales (Visible en PDF):</label>
                   <input type="text" className="input-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Aplica promo 30%" />
                 </div>
              </div>

              <div className="invoice-items" style={{ marginTop: '1.5rem' }}>
                 {items.map(item => (
                   <div key={item.lineId} className="invoice-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{item.name}</span>
                         <button className="icon-btn danger" style={{ padding: '0.3rem', fontSize: '1.2rem', background: 'none', border:'none', color: 'var(--status-danger)', cursor: 'pointer' }} onClick={() => handleRemoveItem(item.lineId)}>
                           <MdDeleteOutline/>
                         </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                         <div style={{ flex: '3 1 200px' }}>
                           <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Detalles del servicio (Capacidad, posteos, notas...)</label>
                           <textarea className="input-field" style={{ margin: 0, padding: '0.5rem', resize: 'vertical', minHeight: '40px' }} placeholder="Detalles específicos" value={item.description || ''} onChange={e => updateLine(item.lineId, 'description', e.target.value)} rows="2" />
                         </div>
                         <div style={{ flex: '1 1 80px' }}>
                           <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cant.</label>
                           <input type="number" className="input-field" style={{ margin: 0, padding: '0.5rem' }} value={item.quantity || 1} min="1" onChange={e => updateLine(item.lineId, 'quantity', Number(e.target.value))} />
                         </div>
                         <div style={{ flex: '1 1 100px' }}>
                           <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>P. Unit ($)</label>
                           <input type="number" className="input-field" style={{ margin: 0, padding: '0.5rem' }} value={item.price} step="0.01" onChange={e => updateLine(item.lineId, 'price', Number(e.target.value))} />
                         </div>
                         <div style={{ flex: '1 1 80px' }}>
                           <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Desc (%)</label>
                           <input type="number" className="input-field" style={{ margin: 0, padding: '0.5rem' }} value={item.itemDiscount || 0} min="0" max="100" onChange={e => updateLine(item.lineId, 'itemDiscount', Number(e.target.value))} />
                         </div>
                      </div>
                   </div>
                 ))}
                 {items.length === 0 && <p className="empty-items" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Selecciona ítems del catálogo para armar la proforma.</p>}
              </div>

              <div className="invoice-totals">
                 <div className="tot-row">
                   <span>Subtotal Base</span>
                   <span>${subtotal.toFixed(2)}</span>
                 </div>
                 <div className="tot-row discount-row">
                   <span>Descuento Comercial (%)</span>
                   <input 
                      type="number" 
                      min="0" max="100" 
                      className="discount-input" 
                      value={discount} 
                      onChange={e => setDiscount(Number(e.target.value))} 
                   />
                 </div>
                 <div className="tot-row format-total">
                   <span>T O T A L</span>
                   <span className="grand-total">${total.toFixed(2)}</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="cotizador-catalog">
            <div className="card section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h2>Catálogo de Servicios</h2>
              </div>
              
              <div className="quick-add-grid mt-4">
                 {quickAdds.map(item => (
                   <div key={item.id} className="quick-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                         <div className="qc-info">
                           <h4 style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</h4>
                           <span>${item.price.toFixed(2)}</span>
                         </div>
                      </div>
                      <div className="qc-actions">
                         <button className="btn-primary" style={{ padding: '0.4rem', fontSize: '0.85rem', flex: 1, justifyContent: 'center' }} onClick={() => handleAddItem(item)}>
                            <MdAddShoppingCart /> Módulo
                         </button>
                         <button className="icon-btn" onClick={() => handleEditCatalogItem(item)} title="Editar Módulo">
                            <MdEdit />
                         </button>
                         <button className="icon-btn danger" onClick={() => handleDeleteCatalogItem(item.id)} title="Eliminar Módulo">
                            <MdDeleteOutline />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'kanban' && (
        <div className="quote-kanban mt-4">
          {KANBAN_STAGES.map(stage => {
            const stageQuotes = quotes.filter(q => q.status === stage);
            return (
              <div key={stage} className="kanban-col">
                <div className="kanban-col-header">
                  <span>{stage}</span>
                  <span className="badge">{stageQuotes.length}</span>
                </div>
                <div className="kanban-col-content">
                  {stageQuotes.map(q => (
                    <div key={q.id} className="quote-kanban-card">
                       <div className="qkc-header">
                          <strong>{q.invoiceNumber}</strong>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="icon-btn" style={{border: 'none', background: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0}} onClick={() => setPreview('quote', q.id)} title="Ver Detalle"><MdVisibility size={16}/></button>
                            <button className="icon-btn danger" style={{border: 'none', background: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: 0}} onClick={() => handleDeleteQuote(q)} title="Eliminar"><MdDeleteOutline size={16}/></button>
                          </div>
                       </div>
                       <div className="qkc-client">{q.clientName}</div>
                       <div className="qkc-date">{new Date(q.date).toLocaleDateString()}</div>
                       <div className="qkc-total">${q.total?.toFixed(2)}</div>
                       
                       <div className="qkc-actions">
                          <select 
                            value={q.status} 
                            onChange={(e) => handleChangeQuoteStatus(q.id, e.target.value)}
                          >
                            {KANBAN_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                    </div>
                  ))}
                  {stageQuotes.length === 0 && <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem'}}>Sin proformas en este estado</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  );
};

export default Cotizador;
