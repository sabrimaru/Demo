import React, { useState } from 'react';
import Calendar from './Calendar';
import ShiftModal from './ShiftModal';
import ShiftDetailsModal from './ShiftDetailsModal';
import SwapRequestsListModal from './SwapRequestsListModal';
import SettingsModal from './SettingsModal';
import RequestVacationModal from './RequestVacationModal';
import VacationRequestsListModal from './VacationRequestsListModal';
import VacationDetailsModal from './VacationDetailsModal';
import ExportModal from './ExportModal';
import { Shift, ShiftType, User, ShiftStatus, Role, SwapRequest, VacationRequest, ShiftDefinition } from '../types';
import { LogoutIcon, SwapIcon, CogIcon, DownloadIcon } from './icons';


interface SchedulerProps {
    user: User;
    onLogout: () => void;
    allUsers: User[];
    shifts: Shift[];
    onAddShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
    onUpdateShift: (shift: Shift) => Promise<void>;
    onDeleteShift: (shiftId: string) => Promise<void>;
    vacations: VacationRequest[];
    onAddVacation: (vacation: Omit<VacationRequest, 'id'>) => Promise<void>;
    onUpdateVacation: (vacation: VacationRequest) => Promise<void>;
    onDeleteVacation: (vacationId: string) => Promise<void>;
    swapRequests: SwapRequest[];
    onAddSwapRequest: (swap: Omit<SwapRequest, 'id'>) => Promise<void>;
    onApproveSwap: (swap: SwapRequest, shift1: Shift, shift2: Shift) => Promise<void>;
    onDeleteSwap: (swapId: string) => Promise<void>;
    shiftDefinitions: ShiftDefinition;
    onSetShiftDefinitions: (definitions: ShiftDefinition) => Promise<void>;
}

const Scheduler: React.FC<SchedulerProps> = ({ 
    user, onLogout, allUsers,
    shifts, onAddShift, onUpdateShift, onDeleteShift,
    vacations, onAddVacation, onUpdateVacation, onDeleteVacation,
    swapRequests, onAddSwapRequest, onApproveSwap, onDeleteSwap,
    shiftDefinitions, onSetShiftDefinitions
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSwapListModalOpen, setIsSwapListModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isRequestVacationModalOpen, setIsRequestVacationModalOpen] = useState(false);
  const [isVacationListModalOpen, setIsVacationListModalOpen] = useState(false);
  const [isVacationDetailsModalOpen, setIsVacationDetailsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedVacation, setSelectedVacation] = useState<VacationRequest | null>(null);

  const [isSwapMode, setIsSwapMode] = useState<boolean>(false);
  const [firstShiftToSwap, setFirstShiftToSwap] = useState<Shift | null>(null);


  const handleDayClick = (date: Date) => {
    if (isSwapMode) return;
    setSelectedDate(date);
    setIsAddModalOpen(true);
  };

  const cancelSwapMode = () => {
    setIsSwapMode(false);
    setFirstShiftToSwap(null);
  };

  const handleSelectSecondShiftForSwap = (secondShift: Shift) => {
      if (firstShiftToSwap) {
          const newSwapRequest: Omit<SwapRequest, 'id'> = {
              shiftId1: firstShiftToSwap.id,
              shiftId2: secondShift.id,
              status: ShiftStatus.Pending,
              requestedBy: user.username,
          };
          onAddSwapRequest(newSwapRequest);
          cancelSwapMode();
      }
  };
  
  const handleShiftClick = (shift: Shift) => {
    if (isSwapMode) {
      if (firstShiftToSwap && shift.id !== firstShiftToSwap.id && shift.status === ShiftStatus.Approved) {
        handleSelectSecondShiftForSwap(shift);
      } else if (firstShiftToSwap && shift.id === firstShiftToSwap.id) {
        cancelSwapMode();
      }
    } else {
      setSelectedShift(shift);
      setIsDetailsModalOpen(true);
    }
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedDate(null);
    setSelectedShift(null);
  };
  
  const toISODateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleAddShift = (details: { teamMember: string; type: ShiftType; startTime?: string; endTime?: string; comments?: string; }) => {
    if (selectedDate) {
      const newShift: Omit<Shift, 'id'> = {
        date: toISODateString(selectedDate),
        teamMember: details.teamMember,
        type: details.type,
        startTime: details.startTime,
        endTime: details.endTime,
        comments: details.comments,
        status: ShiftStatus.Pending,
      };
      onAddShift(newShift);
    }
  };

  const handleApproveShift = async (shiftId: string) => {
    const shiftToApprove = shifts.find(s => s.id === shiftId);
    if (shiftToApprove) {
        await onUpdateShift({ ...shiftToApprove, status: ShiftStatus.Approved });
    }
    handleCloseModals();
  };

  const handleDeleteShift = (shiftId: string) => {
    onDeleteShift(shiftId);
    handleCloseModals();
  };

  const handleInitiateSwap = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
        setFirstShiftToSwap(shift);
        setIsSwapMode(true);
        handleCloseModals();
    }
  };

  const handleApproveSwap = (swapId: string) => {
    const swap = swapRequests.find(sr => sr.id === swapId);
    if (!swap) return;

    const shift1 = shifts.find(s => s.id === swap.shiftId1);
    const shift2 = shifts.find(s => s.id === swap.shiftId2);

    if (shift1 && shift2) {
        onApproveSwap(swap, shift1, shift2);
    } else {
        // If shifts are not found, just delete the request
        onDeleteSwap(swapId);
    }
  };

  const handleRequestVacation = (details: Omit<VacationRequest, 'id' | 'status'>) => {
    const newRequest: Omit<VacationRequest, 'id'> = {
        ...details,
        status: ShiftStatus.Pending,
    };
    onAddVacation(newRequest);
    setIsRequestVacationModalOpen(false);
  };

  const handleApproveVacation = (vacationId: string) => {
    const vacationToApprove = vacations.find(v => v.id === vacationId);
    if(vacationToApprove) {
        onUpdateVacation({ ...vacationToApprove, status: ShiftStatus.Approved });
    }
  };
  
  const handleRejectVacation = (vacationId: string) => {
    onDeleteVacation(vacationId);
  };

  const handleVacationClick = (vacation: VacationRequest) => {
    setSelectedVacation(vacation);
    setIsVacationDetailsModalOpen(true);
  };

  const pendingSwapRequests = swapRequests.filter(r => r.status === ShiftStatus.Pending);
  const pendingVacationRequests = vacations.filter(v => v.status === ShiftStatus.Pending);
  const canApprove = user.role === Role.Administrator || user.role === Role.Assistant;

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                        Matehost Shifts Scheduler
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        Un calendario compartido para turnos. Haz clic en un día para agregar un turno.
                    </p>
                </div>
                <div className="flex-shrink-0 ml-auto flex items-start gap-4 flex-wrap justify-end">
                    <div className="flex items-center gap-4 mt-2">
                        <button 
                            onClick={() => setIsExportModalOpen(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Exportar a Excel
                        </button>
                        <button 
                            onClick={() => setIsRequestVacationModalOpen(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                        >
                            Solicitar Vacaciones
                        </button>
                         {canApprove && (pendingSwapRequests.length > 0 || pendingVacationRequests.length > 0) &&
                           <div className="flex items-center gap-4">
                            {pendingSwapRequests.length > 0 && (
                                <button 
                                    onClick={() => setIsSwapListModalOpen(true)}
                                    className="relative inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <SwapIcon className="w-5 h-5 mr-2" />
                                    Intercambios
                                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{pendingSwapRequests.length}</span>
                                </button>
                            )}
                             {pendingVacationRequests.length > 0 && (
                                <button 
                                    onClick={() => setIsVacationListModalOpen(true)}
                                    className="relative inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
                                >
                                    Vacaciones
                                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{pendingVacationRequests.length}</span>
                                </button>
                            )}
                           </div>
                         }
                         {canApprove && (
                            <button
                                onClick={() => setIsSettingsModalOpen(true)}
                                className="inline-flex items-center p-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                aria-label="Configuración"
                            >
                                <CogIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className='text-right'>
                        <p className="font-semibold text-gray-800 dark:text-white">Bienvenido/a, {user.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                        <button
                            onClick={onLogout}
                            className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            aria-label="Cerrar sesión"
                        >
                            <LogoutIcon className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </header>
        
        {isSwapMode && (
          <div className="sticky top-4 z-40 mb-4 p-4 bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500 rounded-lg shadow-lg flex items-center justify-between animate-fade-in-down">
              <p className="font-semibold text-blue-800 dark:text-blue-200">
                <span className="font-bold">Modo Intercambio:</span> Selecciona otro turno aprobado para solicitar un cambio.
              </p>
              <button 
                onClick={cancelSwapMode}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar Intercambio
              </button>
          </div>
        )}

        <main>
          <Calendar
            shifts={shifts}
            vacations={vacations.filter(v => v.status === ShiftStatus.Approved)}
            onDayClick={handleDayClick}
            onShiftClick={handleShiftClick}
            onVacationClick={handleVacationClick}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            isSwapMode={isSwapMode}
            firstShiftToSwapId={firstShiftToSwap?.id || null}
            allUsers={allUsers}
            user={user}
          />
        </main>
        
        <footer className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>Desarrollado con React, TypeScript y Tailwind CSS.</p>
        </footer>
      </div>

      <ShiftModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        onSave={handleAddShift}
        selectedDate={selectedDate}
        currentUser={user}
        allUsers={allUsers}
        shiftDefinitions={shiftDefinitions}
      />
      <ShiftDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        shift={selectedShift}
        currentUser={user}
        onApprove={handleApproveShift}
        onDelete={handleDeleteShift}
        onInitiateSwap={handleInitiateSwap}
      />
      <SwapRequestsListModal
        isOpen={isSwapListModalOpen}
        onClose={() => setIsSwapListModalOpen(false)}
        pendingSwaps={pendingSwapRequests}
        shifts={shifts}
        onApprove={handleApproveSwap}
        onReject={onDeleteSwap}
      />
       <RequestVacationModal
        isOpen={isRequestVacationModalOpen}
        onClose={() => setIsRequestVacationModalOpen(false)}
        onSubmit={handleRequestVacation}
        currentUser={user}
        allUsers={allUsers}
      />
      <VacationRequestsListModal
        isOpen={isVacationListModalOpen}
        onClose={() => setIsVacationListModalOpen(false)}
        requests={pendingVacationRequests}
        onApprove={handleApproveVacation}
        onReject={handleRejectVacation}
      />
       <VacationDetailsModal
        isOpen={isVacationDetailsModalOpen}
        onClose={() => setIsVacationDetailsModalOpen(false)}
        vacation={selectedVacation}
        currentUser={user}
        onUpdate={onUpdateVacation}
        onDelete={onDeleteVacation}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        users={allUsers}
        shiftDefinitions={shiftDefinitions}
        onSetShiftDefinitions={onSetShiftDefinitions}
       />
       <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        shifts={shifts.filter(s => s.status === ShiftStatus.Approved)}
        users={allUsers}
        shiftDefinitions={shiftDefinitions}
      />
    </div>
  );
};

export default Scheduler;