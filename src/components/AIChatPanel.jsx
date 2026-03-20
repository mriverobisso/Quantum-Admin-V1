import React, { useState, useRef, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MdClose, MdSend, MdSearch, MdAutoAwesome } from 'react-icons/md';
import './AIChatPanel.css';

const GEMINI_API_KEY = 'AIzaSyC1WV33g-WfIh99qnH0Ly6XdwuLNIJcd7w';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const QUICK_ACTIONS = [
  { label: '☀️ Briefing del día', prompt: 'Dame un briefing completo del día de hoy. Revisa mis tareas pendientes, tickets abiertos, dominios por vencer, y recomiéndame las mejores acciones a tomar priorizando lo más urgente.' },
  { label: '🌐 Estado Hosting', prompt: 'Analiza el estado de mis dominios y servicios de hosting. ¿Hay algo que venza pronto? ¿Qué acciones recomendas?' },
  { label: '📱 Plan RRSS', prompt: 'Basándote en mis posts programados y clientes, sugiere un plan de contenido para redes sociales esta semana.' },
  { label: '💰 Análisis Financiero', prompt: 'Analiza mis finanzas: ingresos vs egresos, balance, y dame recomendaciones para mejorar la rentabilidad.' },
  { label: '🔍 Buscar en Google', prompt: 'Busca en Google las últimas tendencias de marketing digital para agencias en Latinoamérica 2026.' },
];

const buildSystemPrompt = (state) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Guayaquil' });
  const timeStr = now.toLocaleTimeString('es-EC', { timeZone: 'America/Guayaquil', hour: '2-digit', minute: '2-digit' });

  const clients = (state.clients || []).map(c => `• ${c.name} (${c.ruc}) [${c.city}] — Servicios: ${(c.services || []).join(', ')} — Contacto: ${c.contactPerson || 'N/A'}`).join('\n');
  const tasks = (state.tasks || []).map(t => {
    const client = (state.clients || []).find(c => c.id === t.clientId);
    return `• [${t.status.toUpperCase()}] ${t.title} — Cliente: ${client?.name || 'N/A'} — Vence: ${t.dueDate} — Módulo: ${t.module}`;
  }).join('\n');
  const hosts = (state.hostItems || []).map(h => {
    const client = (state.clients || []).find(c => c.id === h.clientId);
    return `• ${h.domain} (${h.type}) — Cliente: ${client?.name || 'N/A'} — Vence: ${h.dueDate} — Cost: $${h.cost} — ${h.status}`;
  }).join('\n');
  const tickets = (state.tickets || []).map(tk => {
    const client = (state.clients || []).find(c => c.id === tk.clientId);
    return `• [${tk.status.toUpperCase()}] ${tk.detail} — Cliente: ${client?.name || 'N/A'} — Reportado: ${tk.reportDate}`;
  }).join('\n');
  const finances = (state.finances || []).map(f => `• ${f.desc} — $${f.amount} (${f.category || 'General'}) — ${f.date}`).join('\n');
  const totalIncome = (state.hostItems || []).reduce((a, h) => a + (h.cost || 0), 0) + (state.quotes || []).reduce((a, q) => a + (q.total || 0), 0);
  const totalExpense = (state.finances || []).reduce((a, f) => a + (f.amount || 0), 0);

  return `Eres "Quantum AI", el asistente inteligente exclusivo de la plataforma Quantum OS, operada por Grupo Quantum (Ecuador/Uruguay).

TU IDENTIDAD:
- Nombre: Quantum AI
- Eres un experto profesional en: Hosting Web, WHM/cPanel, Administración de Servidores, Marketing Digital, Redes Sociales (RRSS), WordPress, E-commerce, Diseño Gráfico, e Inteligencia Artificial.
- Respondes siempre en español, de forma precisa, profesional y accionable.
- Cuando el usuario pregunte algo técnico o de actualidad, usa Google Search para dar información actualizada y precisa.
- Siempre prioriza recomendaciones prácticas que se puedan ejecutar inmediatamente.

FECHA Y HORA ACTUAL: ${dateStr}, ${timeStr} (Ecuador, GMT-5)

CONTEXTO COMPLETO DE LA PLATAFORMA:
═══════════════════════════════════
📋 CLIENTES CRM (${(state.clients || []).length}):
${clients || '(Sin clientes registrados)'}

📌 TAREAS ACTIVAS (${(state.tasks || []).length}):
${tasks || '(Sin tareas)'}

🌐 HOSTING & DOMINIOS (${(state.hostItems || []).length}):
${hosts || '(Sin dominios)'}

🎫 TICKETS DE SOPORTE (${(state.tickets || []).length}):
${tickets || '(Sin tickets)'}

💰 FINANZAS:
Ingresos totales: $${totalIncome.toFixed(2)}
Egresos totales: $${totalExpense.toFixed(2)}
Balance: $${(totalIncome - totalExpense).toFixed(2)}
Detalle egresos:
${finances || '(Sin egresos registrados)'}

📊 COTIZACIONES: ${(state.quotes || []).length} proformas
📝 LOGS RECIENTES: ${(state.logs || []).length} acciones registradas
═══════════════════════════════════

REGLAS:
1. Si te piden un "briefing del día", analiza TODAS las tareas, tickets y dominios con fechas cercanas a hoy, y prioriza las acciones.
2. Cuando hables de clientes, menciona sus datos reales del CRM.
3. Da recomendaciones concretas y numeradas para que sean fáciles de ejecutar.
4. Si detectas algo urgente (dominios a punto de vencer, tickets abiertos sin resolver, tareas atrasadas), marca con ⚠️.
5. Sé proactivo: sugiere mejoras incluso si no te las piden.
6. Usa emojis moderadamente para hacer los mensajes más legibles.
7. Si no tienes datos suficientes para responder, dilo honestamente y sugiere qué información cargar en la plataforma.`;
};

// Simple markdown-like parsing
const parseMessage = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h4 style="margin:0.5rem 0 0.2rem">$1</h4>')
    .replace(/^## (.*$)/gm, '<h3 style="margin:0.5rem 0 0.2rem">$1</h3>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li><strong>$1.</strong> $2</li>')
    .replace(/\n/g, '<br/>');
};

const AIChatPanel = ({ isOpen, onClose }) => {
  const { state } = useGlobalContext();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola Mario! 👋 Soy **Quantum AI**, tu asistente experto. Estoy al tanto de todo lo que pasa en la plataforma. ¿En qué puedo ayudarte hoy?', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg = { role: 'user', content: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for Gemini
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const requestBody = {
        system_instruction: {
          parts: [{ text: buildSystemPrompt(state) }]
        },
        contents: history,
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      let aiText = '';
      let usedSearch = false;

      if (data.candidates && data.candidates[0]) {
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts) {
          aiText = candidate.content.parts.map(p => p.text || '').join('');
        }
        // Check if Google Search was used
        if (candidate.groundingMetadata) {
          usedSearch = true;
        }
      }

      if (!aiText) {
        aiText = 'Lo siento, no pude procesar tu solicitud en este momento. Intenta de nuevo.';
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiText, 
        time: new Date(),
        usedSearch 
      }]);
    } catch (err) {
      console.error('Gemini API error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Error de conexión con Gemini AI. Verifica tu conexión a internet e inténtalo de nuevo.', 
        time: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleQuickAction = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <div className={`ai-chat-panel ${isOpen ? 'open' : ''}`}>
      <div className="ai-chat-header">
        <div className="ai-brand">
          <div className="ai-logo">⚡</div>
          <div>
            <h3>Quantum AI</h3>
            <span className="ai-status">● Gemini Flash · En línea</span>
          </div>
        </div>
        <button className="close-chat-btn" onClick={onClose}>
          <MdClose />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="ai-quick-actions">
        {QUICK_ACTIONS.map((action, i) => (
          <button 
            key={i} 
            className="ai-quick-btn" 
            onClick={() => handleQuickAction(action.prompt)}
            disabled={isLoading}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="ai-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg ${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === 'assistant' ? '⚡' : 'MR'}
            </div>
            <div>
              {msg.usedSearch && (
                <div className="search-badge">
                  <MdSearch size={12} /> Búsqueda Google
                </div>
              )}
              <div 
                className="msg-bubble" 
                dangerouslySetInnerHTML={{ __html: parseMessage(msg.content) }}
              />
              <div className="msg-time">
                {msg.time?.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="ai-msg assistant">
            <div className="msg-avatar">⚡</div>
            <div className="msg-bubble">
              <div className="ai-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="ai-chat-input">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta a Quantum AI..."
          rows={1}
          disabled={isLoading}
        />
        <button 
          className="send-btn" 
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
        >
          <MdSend />
        </button>
      </div>
    </div>
  );
};

export default AIChatPanel;
