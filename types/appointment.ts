import { Patient } from './patient';
import { Specialist } from './specialist';
import { Database } from './supabase';
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
  created_at: string;
  updated_at: string;
}

export interface AppointmentUpdateRequest {
  startDate: string;
  endDate: string;
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
