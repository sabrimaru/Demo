import React from 'react';
import { SwapRequest, Shift, ShiftType } from '../types';
import { CloseIcon, CheckIcon, SwapIcon } from './icons';

interface SwapRequestsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingSwaps: SwapRequest[];
  shifts: Shift[];
  onApprove: (swapId: string) => void;
  onReject: (swapId: string) => void;
}

const SwapRequestsListModal: React.FC<SwapRequestsListModalProps> = ({ isOpen, onClose, pendingSwaps, shifts, onApprove, onReject }) => {
  if (!isOpen) {
    return null;
  }

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getShiftDetails = (shiftId: string) => shifts.find(s => s.id === shiftId);

  const getShiftTime = (shift: Shift) => {
    if (shift.type === ShiftType.Custom && shift.startTime && shift.endTime) {
        return `Personalizado (${shift.startTime} - ${shift.endTime})`;
    }
    return shift.type === ShiftType.Morning ? 'Mañana' : 'Tarde';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 transform transition-all"
        onClick={handleModalContentClick}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Solicitudes de Intercambio Pendientes</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Cerrar modal"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4 my-6 max-h-[60vh] overflow-y-auto p-1">
            {pendingSwaps.length > 0 ? (
              pendingSwaps.map(swap => {
                const shift1 = getShiftDetails(swap.shiftId1);
                const shift2 = getShiftDetails(swap.shiftId2);

                if (!shift1 || !shift2) {
                  // This case should ideally not happen if data is consistent
                  return (
                    <div key={swap.id} className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-red-700 dark:text-red-200">
                      Error: No se pudieron encontrar los detalles para la solicitud de intercambio ID: {swap.id}. Uno de los turnos puede haber sido eliminado.
                      <button onClick={() => onReject(swap.id)} className="ml-4 text-sm font-bold">Descartar</button>
                    </div>
                  );
                }

                return (
                  <div key={swap.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm flex-grow">
                        <div className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-200">
                          <span>{shift1.teamMember}</span>
                          <SwapIcon className="w-5 h-5 text-blue-500"/>
                          <span>{shift2.teamMember}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {shift1.date} ({getShiftTime(shift1)}) &harr; {shift2.date} ({getShiftTime(shift2)})
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Solicitado por: {swap.requestedBy}</p>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <button 
                          onClick={() => onReject(swap.id)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center"
                        >
                           <CloseIcon className="w-4 h-4 mr-1.5"/> Rechazar
                        </button>
                        <button
                          onClick={() => onApprove(swap.id)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors inline-flex items-center"
                        >
                            <CheckIcon className="w-4 h-4 mr-1.5"/> Aprobar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay solicitudes de intercambio pendientes.</p>
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

export default SwapRequestsListModal;