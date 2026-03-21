import React from 'react';
import MonthCalendar from '../components/MonthCalendar';
import { useGlobalContext } from '../context/GlobalContext';
import { MdAdd } from 'react-icons/md';

const AgendaComercial = () => {
  const { state, openFormModal } = useGlobalContext();
  const { meetings = [], currentUser } = state;

  const isAdmin = currentUser?.role === 'Administrador';

  // Filter meetings based on visibility
  const visibleMeetings = meetings.filter(m => {
    if (isAdmin) return true;
    if (m.visibility === 'public') return true;
    if (m.organizerId === currentUser?.id) return true;
    return false;
  }).map(m => ({
     ...m,
     color: m.visibility === 'private' ? '#8b5cf6' : 'var(--primary-color)'
  }));

  const handleDateClick = (dateStr) => {
    openFormModal('new_meeting', { date: dateStr, startTime: '09:00', endTime: '10:00' });
  };

  const handleEventClick = (event) => {
    if (isAdmin || event.organizerId === currentUser?.id) {
       openFormModal('edit_meeting', event);
    } else {
       alert(`Reunión: ${event.title}\nHora: ${event.startTime} - ${event.endTime}`);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header module-header">
        <div>
          <h1>Agenda Comercial</h1>
          <p className="subtitle">Gestión de reuniones y citas</p>
        </div>
        <button className="btn-primary" onClick={() => openFormModal('new_meeting')}>
          <MdAdd /> Nueva Cita
        </button>
      </header>
      
      <div className="card" style={{ padding: '1.5rem' }}>
        <MonthCalendar 
          events={visibleMeetings} 
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </div>
    </div>
  );
};

export default AgendaComercial;
