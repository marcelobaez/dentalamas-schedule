import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Patient } from '../../types/patient';
import { Database } from '../../types/supabase';

export default function usePatients() {
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  return useQuery(
    ['patients'],
    async () => {
      const { data, error } = await supabaseClient
        .from('patients')
        .select('id, firstName, lastName, phone, email, created_at, created_by')
        .order('lastName', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return data;
    },
    {
      enabled: !!user,
    },
  );
}
