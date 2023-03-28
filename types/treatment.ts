// export interface Treatment {
//   id: number;
//   name: string;
// }

import { Database } from './supabase';

export type Treatment = Database['public']['Tables']['treatments']['Row'];
