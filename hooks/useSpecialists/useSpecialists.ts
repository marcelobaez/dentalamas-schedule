import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Specialist } from '../../types/specialist';

export default function useSpecialists() {
  const { user, error } = useUser();
  return useQuery(
    ['specialists'],
    async () => {
      const { data, error } = await supabaseClient
        .from<Specialist>('specialists')
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
