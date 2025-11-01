
import React, { useState } from 'react';
import { User, ShiftDefinition } from '../types';
import { CloseIcon } from './icons';
import UserManagementPanel from './UserManagementModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  shiftDefinitions: ShiftDefinition;
  // Fix: Renamed prop to match parent and updated type for async operation
  onSetShiftDefinitions: (definitions: ShiftDefinition) => Promise<void>;
}

type Tab = 'shifts' | 'users';

// Fix: Updated component props to match new interface
const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, users, shiftDefinitions, onSetShiftDefinitions }) => {
  const [activeTab, setActiveTab] = useState<Tab>('shifts');
  const [localShiftDefs, setLocalShiftDefs] = useState(shiftDefinitions);

  if (!isOpen) {
    return null;
  }
  
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  // Fix: Made function async and call the correct prop
  const handleSaveSettings = async () => {
    await onSetShiftDefinitions(localShiftDefs);
    onClose();
  };

  const handleTimeChange = (shiftType: 'morning' | 'evening', boundary: 'start' | 'end', value: string) => {
    setLocalShiftDefs(prev => ({
        ...prev,
        [shiftType]: {
            ...prev[shiftType],
            [boundary]: value,
        }
    }));
  };
  
  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
      const hour = String(h).padStart(2, '0');
      timeOptions.push(`${hour}:00`);
      timeOptions.push(`${hour}:30`);
  }

  const TabButton: React.FC<{ tabId: Tab, children: React.ReactNode }> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabId
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl m-4 transform transition-all" onClick={handleModalContentClick}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configuración</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Cerrar modal">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex space-x-4 mb-6">
            <TabButton tabId="shifts">Horarios de Turnos</TabButton>
            <TabButton tabId="users">Gestión de Usuarios</TabButton>
          </div>

          <div className="min-h-[50vh]">
            {activeTab === 'shifts' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Configurar Horarios Predeterminados</h3>
                 <div className="space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-semibold text-gray-800 dark:text-white mb-3">☀️ Turno Mañana</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora de Inicio</label>
                                <select value={localShiftDefs.morning.start} onChange={(e) => handleTimeChange('morning', 'start', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500">
                                    {timeOptions.map(t => <option key={`m-s-${t}`} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora de Fin</label>
                                <select value={localShiftDefs.morning.end} onChange={(e) => handleTimeChange('morning', 'end', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500">
                                    {timeOptions.map(t => <option key={`m-e-${t}`} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-semibold text-gray-800 dark:text-white mb-3">🌙 Turno Tarde</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora de Inicio</label>
                                <select value={localShiftDefs.evening.start} onChange={(e) => handleTimeChange('evening', 'start', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500">
                                    {timeOptions.map(t => <option key={`e-s-${t}`} value={t}>{t}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora de Fin</label>
                                <select value={localShiftDefs.evening.end} onChange={(e) => handleTimeChange('evening', 'end', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500">
                                    {timeOptions.map(t => <option key={`e-e-${t}`} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            )}
            {/* Fix: Removed setUsers prop as it's no longer needed in UserManagementPanel */}
            {activeTab === 'users' && <UserManagementPanel users={users} />}
          </div>
          
          <div className="mt-8 flex justify-end space-x-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
            <button onClick={handleSaveSettings} className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
