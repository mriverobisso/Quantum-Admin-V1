import React from 'react';
import { MdClose } from 'react-icons/md';
import { FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { useGlobalContext } from '../context/GlobalContext';
import './PreviewModal.css'; // Reusing base modal styles

const GlobalFormModal = () => {
  const { state, setState, formModal, closeFormModal, addLog, updateItem } = useGlobalContext();
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
      const clientData = {
        name: formVals.name,
        ruc: formVals.ruc,
        birthday: formVals.birthday,
      };

      if (modal.type === 'edit_client') {
        updateItem('clients', formData.id, clientData);
      } else {
        const newClient = {
          id: `c_${Date.now()}`,
          ...clientData,
          services: []
        };
        setState(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
        addLog(`Creó nuevo cliente: ${newClient.name}`);
      }
      
    } else if (modal.type === 'new_host') {
      const newHost = {
        id: `h_${Date.now()}`,
        clientId: formVals.clientId,
        domain: formVals.domain,
        type: formVals.plan,
        dueDate: formVals.dueDate,
        status: 'active',
        cost: Number(formVals.cost)
      };
      
      setState(prev => {
        // Automatically add 'Host' service tag to client if not present
        const updatedClients = prev.clients.map(c => {
          if (c.id === formVals.clientId && !c.services.includes('Host')) {
            return { ...c, services: [...c.services, 'Host'] };
          }
          return c;
        });
        return { ...prev, clients: updatedClients, hostItems: [...prev.hostItems, newHost] };
      });
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
            id: `tk_${Date.now()}`,
            ...ticketData,
            reportDate: new Date().toISOString(),
            status: 'abierto'
         };
         setState(prev => {
           const updatedClients = prev.clients.map(c => {
             if (c.id === formVals.clientId && !c.services.includes('Soporte')) {
               return { ...c, services: [...c.services, 'Soporte'] };
             }
             return c;
           });
           return { ...prev, clients: updatedClients, tickets: [...prev.tickets, newTicket] };
         });
         addLog(`Abrió ticket de soporte para falla: ${newTicket.detail}`);
      }
      
    } else if (modal.type === 'new_expense' || modal.type === 'edit_expense') {
      const expenseData = {
        desc: formVals.desc,
        amount: Number(formVals.amount),
        date: formVals.date || new Date().toISOString().split('T')[0]
      };
      
      if (modal.type === 'edit_expense') {
         updateItem('finances', formData.id, expenseData);
      } else {
         const newExpense = {
           id: Date.now(),
           ...expenseData
         };
         setState(prev => ({ ...prev, finances: [...(prev.finances||[]), newExpense] }));
         addLog(`Registró egreso: $${newExpense.amount} - ${newExpense.desc}`);
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
           id: `t_${Date.now()}`,
           module: 'RRSS',
           status: 'idea',
           ...postData
         };
         setState(prev => ({ ...prev, tasks: [...prev.tasks, newPost] }));
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
           id: `t_${Date.now()}`,
           module: 'Design',
           status: 'backlog',
           ...designData
         };
         setState(prev => ({ ...prev, tasks: [...prev.tasks, newDesignTask] }));
         addLog(`Solicitó pieza gráfica: ${newDesignTask.title} formato ${newDesignTask.format}`);
      }
    } else if (modal.type === 'new_catalog_item') {
      const newItem = {
        id: Date.now(),
        name: formVals.name,
        price: Number(formVals.price)
      };
      setState(prev => ({ ...prev, catalog: [...(prev.catalog || []), newItem] }));
      addLog(`Catálogo actualizado: Agregó opción ${newItem.name} ($${newItem.price})`);
    }

    handleClose();
  };

  // Content Builders
  if (modal.type === 'new_client' || modal.type === 'edit_client') {
    title = modal.type === 'new_client' ? 'Añadir Nuevo Cliente (CRM)' : 'Editar Info de Cliente';
    content = (
      <>
        <div className="form-group">
          <label>Nombre / Razón Social</label>
          <input type="text" name="name" className="input-field" defaultValue={formData.name} required />
        </div>
        <div className="form-group">
          <label>RUC / CI</label>
          <input type="text" name="ruc" className="input-field" defaultValue={formData.ruc} required />
        </div>
        <div className="form-group">
          <label>Fecha de Nacimiento / Creación</label>
          <input type="date" name="birthday" className="input-field" defaultValue={formData.birthday} required />
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
  } else if (modal.type === 'new_expense' || modal.type === 'edit_expense') {
    title = modal.type === 'new_expense' ? 'Registrar Egreso Manual' : 'Editar Egreso';
    content = (
      <>
        <div className="form-group">
          <label>Descripción del Gasto</label>
          <input type="text" name="desc" className="input-field" defaultValue={formData.desc} placeholder="Ej: Suscripciones, Sueldos, Oficina..." required />
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Monto ($)</label>
            <input type="number" name="amount" className="input-field" defaultValue={formData.amount} step="0.01" required />
          </div>
          <div style={{ flex: 1 }}>
            <label>Fecha de Gasto</label>
            <input type="date" name="date" className="input-field" defaultValue={formData.date || new Date().toISOString().split('T')[0]} required />
          </div>
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
  } else if (modal.type === 'new_catalog_item') {
    title = 'Añadir al Catálogo de Servicios';
    content = (
      <>
        <div className="form-group">
          <label>Nombre del Servicio / Producto</label>
          <input type="text" name="name" className="input-field" placeholder="Ej: Diseño de Logotipo" required />
        </div>
        <div className="form-group">
          <label>Precio Unitario Base ($)</label>
          <input type="number" name="price" className="input-field" step="0.01" min="0" required />
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
