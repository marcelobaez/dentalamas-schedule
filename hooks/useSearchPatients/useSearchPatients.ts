import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Patient } from '../../types/patient';
import { Database } from '../../types/supabase';

export default function useSearchPatients(keyword: string) {
  const user = useUser();
  return useQuery(
    ['patients', keyword],
    async () => {
      const supabaseClient = useSupabaseClient<Database>();
      const { data, error } = await supabaseClient
        .from('patients')
        .select('id, firstName, lastName, phone, email');

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
