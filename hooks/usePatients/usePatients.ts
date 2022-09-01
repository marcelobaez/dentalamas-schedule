import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Patient } from '../../types/patient';

export default function usePatients() {
  const { user, error } = useUser();
  return useQuery<Patient[]>(
    ['patients'],
    async () => {
      const { data, error } = await supabaseClient
        .from('patients')
        .select('id, firstName, lastName, phone, email, created_at');

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
