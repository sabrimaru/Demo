export enum ShiftType {
  Morning = 'Morning',
  Evening = 'Evening',
  Custom = 'Custom',
}

export enum ShiftStatus {
  Pending = 'Pending',
  Approved = 'Approved',
}

export interface Shift {
  id: string;
  date: string; // ISO date string 'YYYY-MM-DD' for easier state management
  teamMember: string;
  type: ShiftType;
  status: ShiftStatus;
  startTime?: string;
  endTime?: string;
  comments?: string;
}

export enum Role {
  MateHost = 'matehost',
  Assistant = 'assistant',
  Administrator = 'administrator',
}

export interface User {
  id?: string; // Document ID from Firestore
  username: string;
  role: Role;
  // Password is no longer stored in the client-side user object
}

export interface SwapRequest {
  id: string;
  shiftId1: string;
  shiftId2: string;
  status: ShiftStatus; // Should always be Pending when created
  requestedBy: string;
}

export interface VacationRequest {
  id: string;
  username: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  status: ShiftStatus; // Pending or Approved
  comments?: string;
}

export interface ShiftDefinition {
  morning: { start: string; end: string };
  evening: { start: string; end: string };
}