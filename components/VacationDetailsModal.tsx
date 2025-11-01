import React, { useState, useEffect } from 'react';
import { VacationRequest, User, Role } from '../types';
import { CloseIcon, EditIcon, TrashIcon, CheckIcon } from './icons';

interface VacationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacation: VacationRequest | null;
  onUpdate: (vacation: VacationRequest) => void;
  onDelete: (vacationId: string) => void;
  currentUser: User;
}

const VacationDetailsModal: React.FC<VacationDetailsModalProps> = ({ isOpen, onClose, vacation, onUpdate, onDelete, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ startDate: '', endDate: '', comments: '' });
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (vacation) {
      setEditData({
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        comments: vacation.comments || ''
      });
      setIsEditing(false); // Reset editing state when a new vacation is selected
      setError('');
    }
  }, [vacation]);

  if (!isOpen || !vacation) {
    return null;
  }
  
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  const canManage = currentUser.role === Role.Administrator || currentUser.role === Role.Assistant;

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar las vacaciones de ${vacation.username}? Esta acción no se puede deshacer.`)) {
      onDelete(vacation.id);
    }
  };
  
  const handleSave = () => {
    setError('');
    const start = new Date(editData.startDate);
    const end = new Date(editData.endDate);
    if (end < start) {
        setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
        return;
    }
    onUpdate({
        ...vacation,
        startDate: editData.startDate,
        endDate: editData.endDate,
        comments: editData.comments.trim(),
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
      return new Date(dateString.replace(/-/g, '/')).toLocaleDateString('es-419', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 transform transition-all" onClick={handleModalContentClick}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detalles de Vacaciones</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Cerrar modal">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          {!isEditing ? (
            <div className="space-y-4 my-6">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Miembro del Equipo:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{vacation.username}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Periodo:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatDate(vacation.startDate)} - {formatDate(vacation.endDate)}</span>
                </div>
                 {vacation.comments && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Comentarios:</span>
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mt-1">{vacation.comments}</p>
                    </div>
                )}
            </div>
          ) : (
            <div className="space-y-6 my-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="editStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Inicio</label>
                        <input type="date" id="editStartDate" value={editData.startDate} onChange={e => setEditData({...editData, startDate: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500"/>
                    </div>
                    <div>
                        <label htmlFor="editEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Fin</label>
                        <input type="date" id="editEndDate" value={editData.endDate} onChange={e => setEditData({...editData, endDate: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="editVacationComments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comentarios (Opcional)</label>
                    <textarea 
                        id="editVacationComments"
                        value={editData.comments}
                        onChange={e => setEditData({...editData, comments: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-4">
            {isEditing ? (
                 <>
                    <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors inline-flex items-center">
                        <CheckIcon className="w-4 h-4 mr-2"/> Guardar Cambios
                    </button>
                 </>
            ) : (
                <>
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cerrar</button>
                    {canManage && (
                        <>
                            <button onClick={handleDelete} className="px-6 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center">
                                <TrashIcon className="w-4 h-4 mr-2"/> Eliminar
                            </button>
                            <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-flex items-center">
                                <EditIcon className="w-4 h-4 mr-2"/> Modificar
                            </button>
                        </>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationDetailsModal;
