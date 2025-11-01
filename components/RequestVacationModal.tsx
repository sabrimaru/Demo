import React, { useState, useEffect } from 'react';
import { User, VacationRequest, Role } from '../types';
import { CloseIcon } from './icons';

interface RequestVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: Omit<VacationRequest, 'id' | 'status'>) => void;
  currentUser: User;
  allUsers: User[];
}

const RequestVacationModal: React.FC<RequestVacationModalProps> = ({ isOpen, onClose, onSubmit, currentUser, allUsers }) => {
  const toISODateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState(toISODateString(new Date()));
  const [endDate, setEndDate] = useState(toISODateString(new Date()));
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [selectedUsername, setSelectedUsername] = useState(currentUser.username);
  
  const canManage = currentUser.role === Role.Administrator || currentUser.role === Role.Assistant;

  useEffect(() => {
    if (isOpen) {
        // Reset state when modal opens
        setStartDate(toISODateString(new Date()));
        setEndDate(toISODateString(new Date()));
        setComments('');
        setError('');
        setSelectedUsername(currentUser.username);
    }
  }, [isOpen, currentUser.username]);

  if (!isOpen) {
    return null;
  }
  
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  const handleSubmit = () => {
    setError('');
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
        setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
        return;
    }
    onSubmit({
        username: selectedUsername,
        startDate: startDate,
        endDate: endDate,
        comments: comments.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 transform transition-all" onClick={handleModalContentClick}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Solicitar Vacaciones</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Cerrar modal">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6 my-6">
             {canManage && (
                <div>
                    <label htmlFor="vacationUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Solicitar para
                    </label>
                    <select 
                        id="vacationUser"
                        value={selectedUsername}
                        onChange={e => setSelectedUsername(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    >
                       {allUsers.map(user => (
                           <option key={user.username} value={user.username}>{user.username}</option>
                       ))}
                    </select>
                </div>
             )}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Inicio</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500"/>
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Fin</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500"/>
                </div>
             </div>
             <div>
                <label htmlFor="vacationComments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comentarios (Opcional)</label>
                <textarea 
                    id="vacationComments"
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    placeholder="Motivo de las vacaciones..."
                />
             </div>
             {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Enviar Solicitud</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestVacationModal;