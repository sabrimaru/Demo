import React, { useState, useEffect } from 'react';
import { ShiftType, User, Role } from '../types';
import { CloseIcon } from './icons';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: { teamMember: string; type: ShiftType; startTime?: string; endTime?: string; comments?: string }) => void;
  selectedDate: Date | null;
  currentUser: User;
  allUsers: User[];
  shiftDefinitions: {
    morning: { start: string; end: string };
    evening: { start: string; end: string };
  };
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSave, selectedDate, currentUser, allUsers, shiftDefinitions }) => {
  const [teamMember, setTeamMember] = useState(currentUser.username);
  const [shiftType, setShiftType] = useState<ShiftType>(ShiftType.Morning);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [comments, setComments] = useState('');
  
  // Find the role of the user being scheduled, not the current user.
  const selectedUser = allUsers.find(user => user.username === teamMember);
  const isCustomShiftUser = selectedUser?.role === Role.Administrator || selectedUser?.role === Role.Assistant;

  useEffect(() => {
    if (isOpen) {
      setTeamMember(currentUser.username);
      setShiftType(ShiftType.Morning); // Default for Matehosts
      setStartTime('09:00'); // Default for Admins/Assistants
      setEndTime('17:00');
      setComments('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !selectedDate) {
    return null;
  }

  const handleSave = () => {
    if (isCustomShiftUser) {
        onSave({ teamMember: teamMember.trim(), type: ShiftType.Custom, startTime, endTime, comments: comments.trim() });
    } else {
        onSave({ teamMember: teamMember.trim(), type: shiftType, comments: comments.trim() });
    }
    onClose();
  };
  
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
          const hour = String(h).padStart(2, '0');
          const minute = String(m).padStart(2, '0');
          timeOptions.push(`${hour}:${minute}`);
      }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 transform transition-all"
        onClick={handleModalContentClick}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Agregar Turno</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Cerrar modal"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
            Agendando para: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedDate.toLocaleDateString('es-419', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="teamMember" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Miembro del Equipo
              </label>
              <select
                id="teamMember"
                value={teamMember}
                onChange={(e) => setTeamMember(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                {allUsers.map(user => (
                    <option key={user.username} value={user.username}>
                        {user.username}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Turno</span>
              {isCustomShiftUser ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <div>
                        <label htmlFor="startTime" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hora de Inicio</label>
                        <select
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            {timeOptions.map(time => <option key={`start-${time}`} value={time}>{time}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hora de Fin</label>
                        <select
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            {timeOptions.map(time => <option key={`end-${time}`} value={time}>{time}</option>)}
                        </select>
                    </div>
                  </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShiftType(ShiftType.Morning)}
                    className={`p-4 rounded-lg text-left transition-all border-2 ${
                      shiftType === ShiftType.Morning
                        ? 'bg-amber-100 dark:bg-amber-800/50 border-amber-500 ring-2 ring-amber-500'
                        : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:border-amber-400'
                    }`}
                  >
                    <p className="font-semibold text-gray-800 dark:text-white">☀️ Turno Mañana</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{shiftDefinitions.morning.start} - {shiftDefinitions.morning.end}</p>
                  </button>
                  <button
                    onClick={() => setShiftType(ShiftType.Evening)}
                    className={`p-4 rounded-lg text-left transition-all border-2 ${
                      shiftType === ShiftType.Evening
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 ring-2 ring-indigo-500'
                        : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:border-indigo-400'
                    }`}
                  >
                    <p className="font-semibold text-gray-800 dark:text-white">🌙 Turno Tarde</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{shiftDefinitions.evening.start} - {shiftDefinitions.evening.end}</p>
                  </button>
                </div>
              )}
            </div>
             <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentarios (Opcional)
              </label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Ej: Cubriendo a otro miembro del equipo..."
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Solicitar Turno
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;