import { Patient } from './patient';
import { Specialist } from './specialist';
import { Database } from './supabase';
import { Treatment } from './treatment';

interface AppointmentsState {
  id: number;
  name: string;
}

// type AppointmentStates = Database['public']['Tables']['appointments_states']['Row'];

// export type AppointmentsResponse = Database['public']['Tables']['appointments']['Row'] & {
//   appointments_states: AppointmentStates[];
//   treatments: Database['public']['Tables']['treatments']['Row'];
//   specialists: Database['public']['Tables']['specialists']['Row'];
//   patients: Database['public']['Tables']['patients']['Row'];
// };

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

export interface AppointmentRequest {
  startDate: Date;
  endDate: Date;
  patient_id: number;
  treatment_id: number;
  specialist_id: number;
  notes: string;
  attended: boolean | null;
}

export interface AppoinmentFormValues {
  patient: string;
  specialist: string;
  treatment: string;
  notes: string;
  attended: boolean | null;
  state: string;
}
