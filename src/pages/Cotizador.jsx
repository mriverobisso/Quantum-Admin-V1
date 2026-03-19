import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAddShoppingCart, MdPictureAsPdf, MdDeleteOutline, MdAddCircleOutline } from 'react-icons/md';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Cotizador.css';

const Cotizador = () => {
  const { state, addLog, openFormModal } = useGlobalContext();
  const [items, setItems] = useState([]);
  const [clientName, setClientName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0); 
  
  const quickAdds = state.catalog || [];

  const handleAddItem = (item) => {
    setItems(prev => [...prev, { ...item, lineId: Date.now(), quantity: 1, description: '', itemDiscount: 0 }]);
  };

  const handleRemoveItem = (lineId) => {
    setItems(prev => prev.filter(i => i.lineId !== lineId));
  };
  
  const updateLine = (lineId, field, value) => {
    setItems(prev => prev.map(i => i.lineId === lineId ? { ...i, [field]: value } : i));
  };

  // Calculate totals resolving individual item discounts and quantities
  const subtotal = items.reduce((sum, item) => sum + ((item.price * (item.quantity || 1)) * (1 - (item.itemDiscount || 0)/100)), 0);
  const discountTotal = subtotal * (discount / 100);
  const total = subtotal - discountTotal;

  const handleExportPDF = () => {
    if(!clientName || items.length === 0) {
       console.error('Requisito: Ingrese un Cliente y seleccione al menos un servicio.');
       return;
    }

    const doc = new jsPDF();
    const invoiceNumber = `PF-00${state.quotes?.length + 1 || 1}`;
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
    doc.text(`RUC: ${state.settings.ruc}`, 196, 35, { align: 'right' });
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
         2: { halign: 'center' },
         3: { halign: 'center' },
         4: { halign: 'center' },
         5: { halign: 'right' }
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
    doc.text(`Documento generado por Quantum OS | ${new Date().toLocaleString()}`, 105, footerY, { align: 'center' });

    // Antu Brand Mark
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryBlue[0]-50, primaryBlue[1]-50, primaryBlue[2]);
    doc.text("ANTU", 196, footerY + 8, { align: 'right' });
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text("by Quantum", 196, footerY + 11, { align: 'right' });

    doc.save(`${invoiceNumber}-${clientName.replace(/\\s+/g, '')}.pdf`);
    addLog(`Generó Proforma ${invoiceNumber} para ${clientName} por $${total}`);
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

      <div className="cotizador-layout">
        <div className="cotizador-invoice">
          <div className="card invoice-card">
            <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h2>Proforma Actual</h2>
                 <p>NOTA DE VENTA (Sin IVA)</p>
               </div>
               <button className="btn-primary" onClick={handleExportPDF}><MdPictureAsPdf /> Exportar PDF</button>
            </div>
            
            <div className="invoice-client mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div>
                 <label>Cliente / Empresa Autorizada:</label>
                 <input type="text" className="input-field" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ej: Industrias XYZ" />
               </div>
               <div>
                 <label>Contacto (Representante):</label>
                 <input type="text" className="input-field" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Ej: Juan Pérez" />
               </div>
               <div>
                 <label>Email de Contacto:</label>
                 <input type="email" className="input-field" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="Ej: juan@industrias.com" />
               </div>
               <div>
                 <label>Notas Adicionales (Visible en PDF):</label>
                 <input type="text" className="input-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Aplica promo 30%" />
               </div>
            </div>

            <div className="invoice-items" style={{ marginTop: '1.5rem' }}>
               {items.map(item => (
                 <div key={item.lineId} className="invoice-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'stretch', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem', backgroundColor: 'var(--bg-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{item.name}</span>
                       <button className="icon-btn danger" style={{ padding: '0.3rem', fontSize: '1.2rem' }} onClick={() => handleRemoveItem(item.lineId)}><MdDeleteOutline/></button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                       <div style={{ flex: '3 1 200px' }}>
                         <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Descripción del servicio</label>
                         <input type="text" className="input-field" style={{ margin: 0, padding: '0.5rem' }} placeholder="Detalles específicos" value={item.description || ''} onChange={e => updateLine(item.lineId, 'description', e.target.value)} />
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
                 <div key={item.id} className="quick-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                       <div className="qc-info">
                         <h4 style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</h4>
                         <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>${item.price.toFixed(2)}</span>
                       </div>
                    </div>
                    <button className="btn-primary" style={{ padding: '0.4rem', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }} onClick={() => handleAddItem(item)}>
                       <MdAddShoppingCart /> Módulo
                    </button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cotizador;
