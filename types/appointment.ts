import { Patient } from './patient';
import { Specialist } from './specialist';
import { Treatment } from './treatment';

export interface AppointmentsResponse {
  treatments: Treatment;
  patients: Patient;
  specialists: Specialist;
  startDate: string;
  endDate: string;
}
