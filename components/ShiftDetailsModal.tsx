import React from 'react';
import { Shift, User, Role, ShiftStatus, ShiftType } from '../types';
import { CloseIcon, CheckIcon, TrashIcon, SwapIcon, CommentIcon } from './icons';

interface ShiftDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  currentUser: User;
  onApprove: (shiftId: string) => void;
  onDelete: (shiftId: string) => void; // Used for Rejecting pending and Deleting approved
  onInitiateSwap: (shiftId: string) => void;
}

const ShiftDetailsModal: React.FC<ShiftDetailsModalProps> = ({ isOpen, onClose, shift, currentUser, onApprove, onDelete, onInitiateSwap }) => {
  if (!isOpen || !shift) {
    return null;
  }

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const canApprove = currentUser.role === Role.Administrator || currentUser.role === Role.Assistant;
  const isOwner = currentUser.username === shift.teamMember;
  const isPending = shift.status === ShiftStatus.Pending;

  const date = new Date(shift.date.replace(/-/g, '/')); // More robust date parsing

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
          <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detalles del Turno</h2>
                 <p className="text-lg text-gray-600 dark:text-gray-300">
                    {date.toLocaleDateString('es-419', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Cerrar modal"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4 my-6">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="font-medium text-gray-600 dark:text-gray-300">Miembro del Equipo:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{shift.teamMember}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="font-medium text-gray-600 dark:text-gray-300">Tipo de Turno:</span>
                {shift.type === ShiftType.Custom && shift.startTime && shift.endTime ? (
                  <span className="font-semibold px-2 py-1 rounded-md text-sm bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                      ⏰ Personalizado ({shift.startTime} - {shift.endTime})
                  </span>
                ) : (
                  <span className={`font-semibold px-2 py-1 rounded-md text-sm ${shift.type === ShiftType.Morning ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'}`}>
                      {shift.type === ShiftType.Morning ? '☀️ Mañana' : '🌙 Tarde'}
                  </span>
                )}
            </div>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="font-medium text-gray-600 dark:text-gray-300">Estado:</span>
                <span className={`font-semibold px-2 py-1 rounded-full text-xs uppercase tracking-wider ${isPending ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' : 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'}`}>
                    {shift.status === 'Pending' ? 'Pendiente' : 'Aprobado'}
                </span>
            </div>
            {shift.comments && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                        <CommentIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-gray-600 dark:text-gray-300">Comentarios:</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap pl-6">{shift.comments}</p>
                </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cerrar
            </button>

            {isPending ? (
              <>
                {/* --- ACTIONS FOR PENDING SHIFTS --- */}
                {canApprove && (
                  <>
                    <button
                        onClick={() => onDelete(shift.id)}
                        className="px-6 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center"
                    >
                       <CloseIcon className="w-4 h-4 mr-2"/> Rechazar
                    </button>
                    <button
                        onClick={() => onApprove(shift.id)}
                        className="px-6 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors inline-flex items-center"
                    >
                        <CheckIcon className="w-4 h-4 mr-2"/> Aprobar
                    </button>
                  </>
                )}
                {isOwner && !canApprove && (
                  <button
                      onClick={() => onDelete(shift.id)}
                      className="px-6 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center"
                  >
                      <TrashIcon className="w-4 h-4 mr-2"/> Cancelar Solicitud
                  </button>
                )}
              </>
            ) : (
              <>
                {/* --- ACTIONS FOR APPROVED SHIFTS --- */}
                <button
                    onClick={() => onInitiateSwap(shift.id)}
                    className="px-6 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                    <SwapIcon className="w-4 h-4 mr-2"/> Solicitar Intercambio
                </button>
                {canApprove && (
                  <button
                      onClick={() => onDelete(shift.id)}
                      className="px-6 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center"
                  >
                      <TrashIcon className="w-4 h-4 mr-2"/> Eliminar Turno
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftDetailsModal;