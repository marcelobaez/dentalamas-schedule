import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Treatment } from '../../types/treatment';

export default function useTreatments() {
  const { user, error } = useUser();
  return useQuery(
    ['treatments'],
    async () => {
      const { data, error } = await supabaseClient.from<Treatment>('treatments').select('id, name');

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
