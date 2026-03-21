import React, { useState } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import './MonthCalendar.css';

const MonthCalendar = ({ events = [], onDateClick, onEventClick, renderEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    // Adjust so Monday is 0
    return day === 0 ? 6 : day - 1; 
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Normalize events to a map: "YYYY-MM-DD" -> array of events
  const eventsByDate = {};
  events.forEach(ev => {
    let rawDateStr = ev.date || ev.dueDate; 
    if (!rawDateStr) return;
    
    // Convert to strict YYYY-MM-DD local time
    const d = new Date(rawDateStr);
    if (isNaN(d.getTime())) return;
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(ev);
  });

  const cells = [];
  
  // Blanks
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
  }

  // Days
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonth && today.getDate() === d;
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    
    const dayEvents = eventsByDate[dateKey] || [];

    cells.push(
      <div 
        key={`day-${d}`} 
        className={`calendar-cell ${isToday ? 'today' : ''}`}
        onClick={() => onDateClick && onDateClick(dateKey)}
      >
        <span className="day-number">{d}</span>
        <div className="day-events">
          {dayEvents.map((ev, idx) => (
            renderEvent ? renderEvent(ev, idx) : (
              <div 
                key={ev.id || idx} 
                className="calendar-event-pill"
                onClick={(e) => { e.stopPropagation(); onEventClick && onEventClick(ev); }}
                style={{ backgroundColor: ev.color || 'var(--primary-color)' }}
              >
                <div className="event-time">{ev.startTime || ''}</div>
                <div className="event-title">{ev.title}</div>
              </div>
            )
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="month-calendar">
      <div className="calendar-controls">
        <button className="icon-btn" onClick={prevMonth}><MdChevronLeft size={24} /></button>
        <strong>{monthNames[month]} {year}</strong>
        <button className="icon-btn" onClick={nextMonth}><MdChevronRight size={24} /></button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-day-header">LUN</div>
        <div className="calendar-day-header">MAR</div>
        <div className="calendar-day-header">MIÉ</div>
        <div className="calendar-day-header">JUE</div>
        <div className="calendar-day-header">VIE</div>
        <div className="calendar-day-header">SÁB</div>
        <div className="calendar-day-header">DOM</div>
        
        {cells}
      </div>
    </div>
  );
};

export default MonthCalendar;
