import React from 'react';
import { VacationRequest } from '../types';
import { CloseIcon, CheckIcon } from './icons';

interface VacationRequestsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: VacationRequest[];
  onApprove: (vacationId: string) => void;
  onReject: (vacationId: string) => void;
}

const VacationRequestsListModal: React.FC<VacationRequestsListModalProps> = ({ isOpen, onClose, requests, onApprove, onReject }) => {
  if (!isOpen) {
    return null;
  }

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString.replace(/-/g, '/')).toLocaleDateString('es-419');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl m-4 transform transition-all"
        onClick={handleModalContentClick}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Solicitudes de Vacaciones Pendientes</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Cerrar modal"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4 my-6 max-h-[60vh] overflow-y-auto p-1">
            {requests.length > 0 ? (
              requests.map(req => (
                  <div key={req.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="text-sm flex-grow">
                        <p className="text-base font-semibold text-gray-800 dark:text-gray-200">{req.username}</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(req.startDate)} - {formatDate(req.endDate)}
                        </p>
                        {req.comments && <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">"{req.comments}"</p>}
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <button 
                          onClick={() => onReject(req.id)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center"
                        >
                           <CloseIcon className="w-4 h-4 mr-1.5"/> Rechazar
                        </button>
                        <button
                          onClick={() => onApprove(req.id)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors inline-flex items-center"
                        >
                            <CheckIcon className="w-4 h-4 mr-1.5"/> Aprobar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay solicitudes de vacaciones pendientes.</p>
            )}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationRequestsListModal;