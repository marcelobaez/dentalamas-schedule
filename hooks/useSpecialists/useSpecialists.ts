import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Specialist } from '../../types/specialist';
import { Database } from '../../types/supabase';

export default function useSpecialists() {
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  return useQuery(
    ['specialists'],
    async () => {
      const { data, error } = await supabaseClient
        .from('specialists')
        .select('id, firstName, lastName, title');

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
