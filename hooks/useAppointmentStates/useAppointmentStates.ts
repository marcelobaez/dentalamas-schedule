import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Database } from '../../types/supabase';

export default function useAppointmentsStates() {
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();
  return useQuery(
    ['appointmentsStates'],
    async () => {
      const { data, error } = await supabaseClient.from('appointments_states').select('id, name');

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
