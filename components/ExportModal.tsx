import React, { useState } from 'react';
import { Shift, User, ShiftDefinition, ShiftType } from '../types';
import { CloseIcon } from './icons';

// SheetJS (xlsx) is expected to be loaded from a CDN script in index.html
declare var XLSX: any;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[]; // Should already be filtered for approved
  users: User[];
  shiftDefinitions: ShiftDefinition;
}

const toISODateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, shifts, users, shiftDefinitions }) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(toISODateString(firstDayOfMonth));
  const [endDate, setEndDate] = useState(toISODateString(today));
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  const getShiftDuration = (shift: Shift): number => {
    let startStr, endStr;
    if (shift.type === ShiftType.Custom) {
      startStr = shift.startTime;
      endStr = shift.endTime;
    } else if (shift.type === ShiftType.Morning) {
      startStr = shiftDefinitions.morning.start;
      endStr = shiftDefinitions.morning.end;
    } else { // Evening
      startStr = shiftDefinitions.evening.start;
      endStr = shiftDefinitions.evening.end;
    }

    if (!startStr || !endStr) return 0;
    
    // Create date objects on a dummy date to calculate difference
    const startDate = new Date(`1970-01-01T${startStr}:00`);
    let endDate = new Date(`1970-01-01T${endStr}:00`);
    
    // Handle overnight shifts
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
  };

  const handleGenerateReport = () => {
    setError('');
    const start = new Date(startDate.replace(/-/g, '/'));
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate.replace(/-/g, '/'));
    end.setHours(23, 59, 59, 999);

    if (end < start) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    const filteredShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date.replace(/-/g, '/'));
      return shiftDate >= start && shiftDate <= end;
    });

    if (filteredShifts.length === 0) {
      setError('No hay turnos aprobados en el rango de fechas seleccionado.');
      return;
    }
    
    // Group shifts by person
    const shiftsByUser: { [key: string]: Shift[] } = {};
    for (const shift of filteredShifts) {
      if (!shiftsByUser[shift.teamMember]) {
        shiftsByUser[shift.teamMember] = [];
      }
      shiftsByUser[shift.teamMember].push(shift);
    }
    
    // Prepare data for Excel sheet
    const wb = XLSX.utils.book_new();
    const ws_data: any[][] = [];
    
    // Add Title and Date Range
    ws_data.push(["Matehost Shifts Scheduler"]);
    ws_data.push([`Reporte de Turnos para el periodo: ${start.toLocaleDateString('es-419')} - ${end.toLocaleDateString('es-419')}`]);
    ws_data.push([]); // Spacer row
    
    const merges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }  // Date range
    ];
    let currentRow = 3;

    // Sort users by name before creating the report
    const sortedUsernames = Object.keys(shiftsByUser).sort();

    for (const username of sortedUsernames) {
        ws_data.push([username]);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
        currentRow++;

        ws_data.push(["Día de la semana", "Horario del turno", "Cantidad horas turno", "Observaciones"]);
        currentRow++;
        
        // Sort shifts by date for each user
        const userShifts = shiftsByUser[username].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (const shift of userShifts) {
            const shiftDate = new Date(shift.date.replace(/-/g, '/'));
            const dayOfWeek = shiftDate.toLocaleDateString('es-419', { weekday: 'long', day: 'numeric' });
            
            const schedule = shift.type === ShiftType.Custom 
                ? `${shift.startTime} - ${shift.endTime}`
                : (shift.type === ShiftType.Morning 
                    ? `${shiftDefinitions.morning.start} - ${shiftDefinitions.morning.end}`
                    : `${shiftDefinitions.evening.start} - ${shiftDefinitions.evening.end}`);
            
            const hours = getShiftDuration(shift);

            ws_data.push([
                dayOfWeek,
                schedule,
                hours > 0 ? hours.toFixed(2) : '',
                shift.comments || ''
            ]);
            currentRow++;
        }
        ws_data.push([]); // Spacer row
        currentRow++;
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!merges'] = merges;
    
    // Optional: Set column widths for better readability
    ws['!cols'] = [
        { wch: 25 }, // Día de la semana
        { wch: 20 }, // Horario del turno
        { wch: 20 }, // Cantidad horas turno
        { wch: 40 }  // Observaciones
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Reporte de Turnos");
    XLSX.writeFile(wb, `Reporte_Turnos_${startDate}_${endDate}.xlsx`);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 transform transition-all" onClick={handleModalContentClick}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Exportar Reporte de Turnos</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Cerrar modal">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6 my-6">
             <p className="text-gray-600 dark:text-gray-300">Selecciona un rango de fechas para generar el reporte de turnos aprobados.</p>
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
             {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
            <button onClick={handleGenerateReport} className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Generar Reporte</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
