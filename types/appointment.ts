import { Patient } from './patient';
import { Specialist } from './specialist';
import { Treatment } from './treatment';

interface AppointmentsState {
  id: number;
  name: string;
}

export interface AppointmentsResponse {
  id: number;
  treatments: Treatment;
  patients: Patient;
  specialists: Specialist;
  startDate: string;
  endDate: string;
  notes: string;
  attended: boolean;
  appointments_states: AppointmentsState;
}
