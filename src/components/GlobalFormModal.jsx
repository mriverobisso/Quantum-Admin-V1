import React from 'react';
import { MdClose } from 'react-icons/md';
import { FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { useGlobalContext } from '../context/GlobalContext';
import './PreviewModal.css'; // Reusing base modal styles

const GlobalFormModal = () => {
  const { state, setState, formModal, closeFormModal, addLog, updateItem, addItem } = useGlobalContext();
  const modal = formModal;

  if (!modal || !modal.isOpen) return null;

  // Render variables
  let title = '';
  let content = null;
  const formData = modal.data || {};

  const handleClose = () => closeFormModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const formVals = Object.fromEntries(fd.entries());
    
    // Switch based on Action Type
    if (modal.type === 'new_client' || modal.type === 'edit_client') {
      // Collect selected services from checkboxes
      const serviceCheckboxes = Array.from(e.target.querySelectorAll('input[name="services"]'));
      const selectedServices = serviceCheckboxes.filter(cb => cb.checked).map(cb => cb.value);

      const clientData = {
        name: formVals.name,
        ruc: formVals.ruc,
        email: formVals.email || '',
        phone: formVals.phone || '',
        address: formVals.address || '',
        city: formVals.city || '',
        contactPerson: formVals.contactPerson || '',
        contactRole: formVals.contactRole || '',
        notes: formVals.notes || '',
        birthday: formVals.birthday,
        services: selectedServices,
      };

      if (modal.type === 'edit_client') {
        updateItem('clients', formData.id, clientData);
        addLog(`Editó cliente: ${clientData.name}`);
      } else {
        addItem('clients', clientData);
        addLog(`Creó nuevo cliente: ${clientData.name}`);
      }
      
    } else if (modal.type === 'new_host') {
      const newHost = {
        clientId: formVals.clientId,
        domain: formVals.domain,
        type: formVals.plan,
        dueDate: formVals.dueDate,
        status: 'active',
        cost: Number(formVals.cost)
      };
      
      const client = state.clients.find(c => c.id === formVals.clientId);
      if (client && !client.services?.includes('Host')) {
        updateItem('clients', formVals.clientId, { services: [...(client.services||[]), 'Host'] });
      }
      
      addItem('hostItems', newHost);
      addLog(`Registró dominio ${newHost.domain}`);
      
    } else if (modal.type === 'edit_host') {
      updateItem('hostItems', formData.id, {
        clientId: formVals.clientId,
        domain: formVals.domain,
        type: formVals.plan,
        dueDate: formVals.dueDate,
        cost: Number(formVals.cost)
      });
      
    } else if (modal.type === 'new_ticket' || modal.type === 'edit_ticket') {
      const ticketData = {
         clientId: formVals.clientId,
         detail: formVals.detail,
         priority: formVals.priority,
         category: formVals.category
      };

      if (modal.type === 'edit_ticket') {
         updateItem('tickets', formData.id, ticketData);
      } else {
         const newTicket = {
            ...ticketData,
            reportDate: new Date().toISOString(),
            status: 'abierto'
         };
         
         const client = state.clients.find(c => c.id === formVals.clientId);
         if (client && !client.services?.includes('Soporte')) {
           updateItem('clients', formVals.clientId, { services: [...(client.services||[]), 'Soporte'] });
         }
         
         addItem('tickets', newTicket);
         addLog(`Abrió ticket de soporte para falla: ${newTicket.detail}`);
      }
      
    } else if (modal.type === 'new_expense' || modal.type === 'edit_expense' || modal.type === 'new_income' || modal.type === 'edit_income') {
      const isIncome = modal.type.includes('income');
      const financeData = {
        desc: formVals.desc,
        amount: Number(formVals.amount),
        category: formVals.category || (isIncome ? 'Ingreso Manual' : 'General'),
        date: formVals.date || new Date().toISOString().split('T')[0],
        type: isIncome ? 'income' : 'expense',
        isRecurring: !!formVals.isRecurring
      };
      
      if (modal.type.startsWith('edit_')) {
         updateItem('finances', formData.id, financeData);
      } else {
         addItem('finances', financeData);
         addLog(`Registró ${isIncome ? 'ingreso' : 'egreso'}: $${financeData.amount} - ${financeData.desc}`);
      }
      
    } else if (modal.type === 'new_post' || modal.type === 'edit_post') {
      const selectedNetworks = Array.from(e.target.elements.networks)
                                    .filter(opt => opt.checked)
                                    .map(opt => opt.value);
      
      const postData = {
        title: formVals.title,
        clientId: formVals.clientId,
        copy: formVals.copy,
        publishDate: formVals.publishDate,
        networks: selectedNetworks.length > 0 ? selectedNetworks : ['General'],
        dueDate: formVals.publishDate
      };
      
      if (modal.type === 'edit_post') {
         updateItem('tasks', formData.id, postData);
      } else {
         const newPost = {
           module: 'rrss',
           status: 'idea',
           ...postData
         };
         addItem('tasks', newPost);
         addLog(`Agendó nuevo post en RRSS para cliente #${formVals.clientId}`);
      }

    } else if (modal.type === 'new_design' || modal.type === 'edit_design') {
      const designData = {
        title: formVals.title,
        objective: formVals.objective,
        clientId: formVals.clientId,
        format: formVals.format,
        dueDate: formVals.dueDate
      };
      
      if (modal.type === 'edit_design') {
         updateItem('tasks', formData.id, designData);
      } else {
         const newDesignTask = {
           module: 'Design',
           status: 'backlog',
           ...designData
         };
         addItem('tasks', newDesignTask);
         addLog(`Solicitó pieza gráfica: ${newDesignTask.title} formato ${newDesignTask.format}`);
      }
    } else if (modal.type === 'new_catalog_item' || modal.type === 'edit_catalog_item') {
      const itemData = {
        name: formVals.name,
        price: Number(formVals.price),
        description: formVals.description || ''
      };
      
      if (modal.type === 'edit_catalog_item') {
        updateItem('catalog', formData.id, itemData);
        addLog(`Editó opción de catálogo: ${itemData.name}`);
      } else {
        addItem('catalog', itemData);
        addLog(`Catálogo actualizado: Agregó opción ${itemData.name}`);
      }
    }

    handleClose();
  };

  // Content Builders
  if (modal.type === 'new_client' || modal.type === 'edit_client') {
    title = modal.type === 'new_client' ? 'Registrar Nuevo Cliente (CRM)' : 'Editar Ficha de Cliente';
    const isServiceChecked = (svc) => (formData.services || []).includes(svc);
    content = (
      <>
        <h4 style={{ color: 'var(--primary-color)', margin: '0 0 0.5rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>Datos de la Empresa</h4>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 2 }}>
            <label>Nombre / Razón Social *</label>
            <input type="text" name="name" className="input-field" defaultValue={formData.name} required />
          </div>
          <div style={{ flex: 1 }}>
            <label>RUC / CI *</label>
            <input type="text" name="ruc" className="input-field" defaultValue={formData.ruc} required />
          </div>
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Email Corporativo</label>
            <input type="email" name="email" className="input-field" defaultValue={formData.email} placeholder="info@empresa.com" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Teléfono</label>
            <input type="tel" name="phone" className="input-field" defaultValue={formData.phone} placeholder="+593 99 000 0000" />
          </div>
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 2 }}>
            <label>Dirección</label>
            <input type="text" name="address" className="input-field" defaultValue={formData.address} placeholder="Calle, Edificio, Oficina..." />
          </div>
          <div style={{ flex: 1 }}>
            <label>Ciudad</label>
            <input type="text" name="city" className="input-field" defaultValue={formData.city} placeholder="Guayaquil" />
          </div>
        </div>

        <h4 style={{ color: 'var(--primary-color)', margin: '1rem 0 0.5rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>Contacto Principal</h4>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Nombre del Contacto</label>
            <input type="text" name="contactPerson" className="input-field" defaultValue={formData.contactPerson} placeholder="Juan Pérez" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Cargo</label>
            <input type="text" name="contactRole" className="input-field" defaultValue={formData.contactRole} placeholder="Gerente General" />
          </div>
        </div>
        <div className="form-group">
          <label>Fecha de Inicio / Nacimiento *</label>
          <input type="date" name="birthday" className="input-field" defaultValue={formData.birthday} required />
        </div>

        <h4 style={{ color: 'var(--primary-color)', margin: '1rem 0 0.5rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>Servicios Contratados</h4>
        <div className="form-group">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem 0' }}>
            {['Host', 'RRSS', 'Diseño', 'Soporte', 'Cotizador'].map(svc => (
              <label key={svc} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', fontSize: '0.9rem' }}>
                <input type="checkbox" name="services" value={svc} defaultChecked={isServiceChecked(svc)} />
                {svc}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Notas Internas</label>
          <textarea name="notes" className="input-field" rows="2" defaultValue={formData.notes} placeholder="Observaciones, recordatorios..."></textarea>
        </div>
      </>
    );
  } else if (modal.type === 'new_host' || modal.type === 'edit_host') {
    title = modal.type === 'new_host' ? 'Nuevo Registro de Host' : 'Editar Registro de Host';
    content = (
      <>
        <div className="form-group">
          <label>Cliente</label>
          <select name="clientId" className="input-field" defaultValue={formData.clientId} required>
            <option value="">Seleccione un cliente...</option>
            {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Dominio</label>
          <input type="text" name="domain" className="input-field" defaultValue={formData.domain} placeholder="ej: mipagina.com" required />
        </div>
        <div className="form-group">
          <label>Plan Acordado</label>
          <input type="text" name="plan" className="input-field" defaultValue={formData.type} placeholder="ej: Hosting Básico" required />
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Costo Anual ($)</label>
            <input type="number" name="cost" className="input-field" defaultValue={formData.cost} step="0.01" required />
          </div>
          <div style={{ flex: 1 }}>
            <label>Fecha de Vencimiento</label>
            <input type="date" name="dueDate" className="input-field" defaultValue={formData.dueDate} required />
          </div>
        </div>
      </>
    );
  } else if (modal.type === 'new_ticket' || modal.type === 'edit_ticket') {
    title = modal.type === 'new_ticket' ? 'Registro de Falla / Soporte' : 'Editar Incidencia';
    content = (
      <>
        <div className="form-group">
          <label>Cliente Afectado</label>
          <select name="clientId" className="input-field" defaultValue={formData.clientId} required>
            <option value="">Seleccione un cliente...</option>
            {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Nivel de Prioridad (SLA)</label>
            <select name="priority" className="input-field" defaultValue={formData.priority || 'Medio'} required>
               <option value="Crítico">Crítico (P1)</option>
               <option value="Alta">Alta (P2)</option>
               <option value="Medio">Medio (P3)</option>
               <option value="Bajo">Bajo (P4)</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Categoría de Problema</label>
            <select name="category" className="input-field" defaultValue={formData.category || 'Técnico'} required>
               <option value="Técnico">Soporte Técnico</option>
               <option value="Servidor">Servidor / DNS</option>
               <option value="Facturación">Facturación / Pagos</option>
               <option value="Desarrollo">Desarrollo / Bugs</option>
               <option value="Diseño">Dudas de Diseño</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Detalle de la Falla</label>
          <textarea name="detail" className="input-field" rows="4" defaultValue={formData.detail} placeholder="Describa el problema reportado..." required></textarea>
        </div>
      </>
    );
  } else if (modal.type === 'new_expense' || modal.type === 'edit_expense' || modal.type === 'new_income' || modal.type === 'edit_income') {
    const isIncome = modal.type.includes('income');
    title = modal.type.startsWith('new_') ? `Registrar ${isIncome ? 'Ingreso' : 'Egreso'} Manual` : `Editar ${isIncome ? 'Ingreso' : 'Egreso'}`;
    content = (
      <>
        <div className="form-group">
          <label>Descripción del Movimiento</label>
          <input type="text" name="desc" className="input-field" defaultValue={formData.desc} placeholder={isIncome ? "Ej: Venta de equipo, Bono extra..." : "Ej: Suscripciones, Sueldos, Oficina..."} required />
        </div>
        <div className="form-group">
          <label>Categoría</label>
          <select name="category" className="input-field" defaultValue={formData.category || (isIncome ? 'Ingreso Manual' : 'General')} required>
            {isIncome ? (
              <>
                <option value="Servicios de Agencia">Servicios de Agencia</option>
                <option value="Ventas">Ventas Generales</option>
                <option value="Ingreso Manual">Ingreso Manual / Otros</option>
              </>
            ) : (
              <>
                <option value="Operativo">Operativo</option>
                <option value="Sueldos">Sueldos / Nómina</option>
                <option value="Suscripciones">Suscripciones / Software</option>
                <option value="Marketing">Marketing / Publicidad</option>
                <option value="Servicios">Servicios (Luz, Agua, Internet)</option>
                <option value="Alquiler">Alquiler / Oficina</option>
                <option value="Impuestos">Impuestos / Legal</option>
                <option value="Proveedores">Proveedores</option>
                <option value="General">General / Otros</option>
              </>
            )}
          </select>
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Monto ($)</label>
            <input type="number" name="amount" className="input-field" defaultValue={formData.amount} step="0.01" required />
          </div>
          <div style={{ flex: 1 }}>
            <label>Fecha de Registro</label>
            <input type="date" name="date" className="input-field" defaultValue={formData.date || new Date().toISOString().split('T')[0]} required />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', backgroundColor: 'var(--surface-color)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
            <input type="checkbox" name="isRecurring" defaultChecked={formData.isRecurring} style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-color)' }} />
            🔁 Registrar como recurrente (Aparecerá automáticamente cada mes a partir de su creación)
          </label>
        </div>
      </>
    );
  } else if (modal.type === 'new_post' || modal.type === 'edit_post') {
    title = modal.type === 'new_post' ? 'Programar Publicación (RRSS)' : 'Editar Publicación';
    const isNetworkSelected = (netName) => {
       return formData.networks ? formData.networks.includes(netName) : false;
    };
    content = (
      <>
        <div className="form-group">
          <label>Cliente Asociado (Obligatorio)</label>
          <select name="clientId" className="input-field" defaultValue={formData.clientId} required>
            <option value="">Selección de CRM...</option>
            {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Título / Concepto de Publicación</label>
          <input type="text" name="title" className="input-field" defaultValue={formData.title} placeholder="Ej: Carrusel promocional San Valentín" required />
        </div>
        <div className="form-group">
          <label>Redes Sociales Objetivo</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem 0' }}>
             {[
                { name: 'Instagram', color: '#E1306C', icon: <FaInstagram /> }, 
                { name: 'Facebook', color: '#1877F2', icon: <FaFacebook /> }, 
                { name: 'LinkedIn', color: '#0A66C2', icon: <FaLinkedin /> }, 
                { name: 'TikTok', color: '#000000', icon: <FaTiktok /> }, 
                { name: 'X', color: '#1DA1F2', icon: <FaXTwitter /> }
             ].map(net => (
                <label key={net.name} className="network-label" style={{ '--net-color': net.color }}>
                  <input type="checkbox" name="networks" value={net.name} defaultChecked={isNetworkSelected(net.name)} />
                  <div className="net-pill">
                     <span style={{ fontSize: '1.2rem', display: 'flex' }}>{net.icon}</span>
                     <span>{net.name}</span>
                  </div>
                </label>
             ))}
          </div>
        </div>
        <div className="form-group">
          <label>Copywriting (Texto de Publicación)</label>
          <textarea name="copy" className="input-field" rows="4" defaultValue={formData.copy} placeholder="Escribe el copy de la publicación..."></textarea>
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Fecha y Hora Exacta de Publicación</label>
            <input type="datetime-local" name="publishDate" className="input-field" defaultValue={formData.publishDate} required />
          </div>
          <div style={{ flex: 1 }}>
            <label>Subida de Archivos Complementarios</label>
            <input type="file" name="assets" className="input-field" multiple style={{ padding: '0.5rem' }} />
          </div>
        </div>
      </>
    );
  } else if (modal.type === 'new_design' || modal.type === 'edit_design') {
    title = modal.type === 'new_design' ? 'Brief Digital (Solicitar Arte)' : 'Editar Brief Digital';
    content = (
      <>
        <div className="form-group">
          <label>Cliente Solicitante</label>
          <select name="clientId" className="input-field" defaultValue={formData.clientId} required>
            <option value="">Selección de CRM...</option>
            {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Título de la Pieza (Brief)</label>
          <input type="text" name="title" className="input-field" defaultValue={formData.title} placeholder="Ej: Portada Redes Sociales o Flyer A4" required />
        </div>
        <div className="form-group">
          <label>Objetivo y Referencias (Instrucciones)</label>
          <textarea name="objective" className="input-field" rows="4" defaultValue={formData.objective} placeholder="Brindar la mayor cantidad de información y objetivos estéticos..." required></textarea>
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Formatos Requeridos</label>
            <select name="format" className="input-field" defaultValue={formData.format} required>
               <option value="1080x1080 (Post)">1080x1080 (Post Redes)</option>
               <option value="1080x1360 (Retrato)">1080x1360 (Retrato Alta Resolución)</option>
               <option value="1080x1920 (Story)">1080x1920 (Story / Reel)</option>
               <option value="Libre / Web">Libre / Material de Web</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Fecha de Entrega Límite</label>
            <input type="date" name="dueDate" className="input-field" defaultValue={formData.dueDate} required />
          </div>
        </div>
      </>
    );
  } else if (modal.type === 'new_catalog_item' || modal.type === 'edit_catalog_item') {
    title = modal.type === 'new_catalog_item' ? 'Añadir al Catálogo de Servicios' : 'Editar Servicio';
    content = (
      <>
        <div className="form-group">
          <label>Nombre del Servicio / Producto</label>
          <input type="text" name="name" className="input-field" defaultValue={formData.name} placeholder="Ej: Diseño de Logotipo" required />
        </div>
        <div className="form-group">
          <label>Descripción Predeterminada (Opcional)</label>
          <textarea name="description" className="input-field" rows="3" defaultValue={formData.description} placeholder="Aparecerá pre-cargada al cotizar este servicio..."></textarea>
        </div>
        <div className="form-group">
          <label>Precio Unitario Base ($)</label>
          <input type="number" name="price" className="input-field" defaultValue={formData.price} step="0.01" min="0" required />
        </div>
      </>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="close-btn" onClick={handleClose}><MdClose /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {content}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Registro</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlobalFormModal;
