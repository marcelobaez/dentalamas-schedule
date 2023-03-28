// export interface Patient {
//   id: number;
//   firstName: string;
//   lastName: string;
//   phone: string;
//   email: string;
//   created_at: string;
// }

import { Database } from './supabase';

export type Patient = Database['public']['Tables']['patients']['Row'];
