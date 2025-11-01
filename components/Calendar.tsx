import React from 'react';
import { Shift, ShiftType, ShiftStatus, User, Role, VacationRequest } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CommentIcon, PalmTreeIcon } from './icons';

interface CalendarProps {
  shifts: Shift[];
  vacations: VacationRequest[];
  onDayClick: (date: Date) => void;
  onShiftClick: (shift: Shift) => void;
  onVacationClick?: (vacation: VacationRequest) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  isSwapMode: boolean;
  firstShiftToSwapId: string | null;
  allUsers: User[];
  user: User;
}

const CalendarHeader: React.FC<{
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}> = ({ currentDate, onPrevMonth, onNextMonth }) => (
  <div className="flex items-center justify-between py-4 px-2 md:px-6">
    <button
      onClick={onPrevMonth}
      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Mes anterior"
    >
      <ChevronLeftIcon className="w-6 h-6" />
    </button>
    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white capitalize">
      {currentDate.toLocaleString('es-419', { month: 'long', year: 'numeric' })}
    </h2>
    <button
      onClick={onNextMonth}
      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Próximo mes"
    >
      <ChevronRightIcon className="w-6 h-6" />
    </button>
  </div>
);

const ShiftPill: React.FC<{ shift: Shift; onClick: (shift: Shift) => void; isFirstShift: boolean; isSwappable: boolean; allUsers: User[]; }> = ({ shift, onClick, isFirstShift, isSwappable, allUsers }) => {
    const isPending = shift.status === ShiftStatus.Pending;

    const user = allUsers.find(u => u.username === shift.teamMember);
    const role = user?.role;

    let bgColor = '';
    let textColor = '';

    switch (role) {
        case Role.MateHost: // green
            bgColor = 'bg-green-100 dark:bg-green-900';
            textColor = 'text-green-800 dark:text-green-200';
            break;
        case Role.Assistant: // yellow
            bgColor = 'bg-yellow-100 dark:bg-yellow-900';
            textColor = 'text-yellow-800 dark:text-yellow-200';
            break;
        case Role.Administrator: // red
            bgColor = 'bg-red-100 dark:bg-red-900';
            textColor = 'text-red-800 dark:text-red-200';
            break;
        default: // Fallback for safety
            bgColor = 'bg-gray-100 dark:bg-gray-700';
            textColor = 'text-gray-800 dark:text-gray-200';
    }

    const icon = shift.type === ShiftType.Morning ? '☀️' : shift.type === ShiftType.Evening ? '🌙' : '⏰';
    const text = shift.type === ShiftType.Custom && shift.startTime && shift.endTime
        ? `${shift.teamMember} (${shift.startTime}-${shift.endTime})`
        : shift.teamMember;

    const pendingClasses = isPending ? 'opacity-70 border-2 border-dashed border-gray-400 dark:border-gray-500' : 'border-2 border-transparent';
    const swapClasses = isFirstShift ? 'ring-4 ring-offset-1 ring-blue-500 dark:ring-blue-400 shadow-lg scale-105 z-10' : '';
    const swappableClasses = isSwappable ? 'hover:ring-2 hover:ring-blue-400' : '';


    const handlePillClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering onDayClick
        onClick(shift);
    }

    return (
        <div 
            className={`text-xs px-2 py-1 rounded-md flex items-center mb-1 overflow-hidden cursor-pointer hover:shadow-md transition-all relative ${bgColor} ${textColor} ${pendingClasses} ${swapClasses} ${swappableClasses}`}
            onClick={handlePillClick}
            role="button"
            aria-label={`Turno para ${shift.teamMember}, ${shift.status}`}
        >
            <span className="mr-1.5">{icon}</span>
            <span className="font-medium truncate">{text}</span>
            {shift.comments && <CommentIcon className="w-3.5 h-3.5 ml-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
            {isPending && <span className="ml-auto text-xs font-semibold animate-pulse">...</span>}
        </div>
    );
};

const VacationPill: React.FC<{ vacation: VacationRequest, onClick?: () => void }> = ({ vacation, onClick }) => (
  <div 
    className={`text-xs px-2 py-1 rounded-md flex items-center mb-1 overflow-hidden bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    aria-label={onClick ? `Vacaciones para ${vacation.username}, ver detalles` : `Vacaciones para ${vacation.username}`}
  >
    <PalmTreeIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
    <span className="font-medium truncate">{vacation.username} (Vacaciones)</span>
  </div>
);

const Calendar: React.FC<CalendarProps> = ({ shifts, vacations, onDayClick, onShiftClick, onVacationClick, currentDate, setCurrentDate, isSwapMode, firstShiftToSwapId, allUsers, user }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const toISODateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Add blank days for the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-start-${i}`} className="border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"></div>);
    }

    const canManageVacations = user.role === Role.Administrator || user.role === Role.Assistant;

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const isoDate = toISODateString(date);
      const isToday = date.getTime() === today.getTime();
      const shiftsForDay = shifts.filter(s => s.date === isoDate);
      const vacationsForDay = vacations.filter(v => {
        const vStart = new Date(v.startDate.replace(/-/g, '/'));
        vStart.setHours(0, 0, 0, 0);
        const vEnd = new Date(v.endDate.replace(/-/g, '/'));
        vEnd.setHours(0, 0, 0, 0);
        return date >= vStart && date <= vEnd;
      });

      const dayClickHandler = isSwapMode ? () => {} : () => onDayClick(date);

      days.push(
        <div
          key={isoDate}
          className={`relative min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors group ${isSwapMode ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'}`}
          onClick={dayClickHandler}
        >
          <span className={`flex items-center justify-center h-7 w-7 rounded-full text-sm font-semibold ${
              isToday ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {day}
          </span>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
            {vacationsForDay.map(vacation => (
              <VacationPill 
                key={vacation.id} 
                vacation={vacation} 
                onClick={canManageVacations && onVacationClick ? () => onVacationClick(vacation) : undefined}
              />
            ))}
            {shiftsForDay.map(shift => (
              <ShiftPill 
                key={shift.id} 
                shift={shift} 
                onClick={onShiftClick}
                isFirstShift={shift.id === firstShiftToSwapId}
                isSwappable={isSwapMode && shift.status === ShiftStatus.Approved && shift.id !== firstShiftToSwapId}
                allUsers={allUsers}
              />
            ))}
          </div>
        </div>
      );
    }
    return days;
  };
  
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden ${isSwapMode ? 'cursor-crosshair' : ''}`}>
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <div className="grid grid-cols-7 border-t border-gray-200 dark:border-gray-700">
        {weekdays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-3 border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {day}
          </div>
        ))}
        {generateCalendarDays()}
      </div>
    </div>
  );
};

export default Calendar;