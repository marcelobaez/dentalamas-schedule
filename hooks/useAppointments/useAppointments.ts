import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { AppointmentsResponse } from '../../types/appointment';

export default function useAppointments() {
  const { user, error } = useUser();
  return useQuery(
    ['appointments'],
    async () => {
      const { data, error, count } = await supabaseClient
        .from<AppointmentsResponse>('appointments')
        .select(
          'id, startDate, endDate, patients ( id, firstName, lastName, phone, email), treatments ( id, name ), specialists ( id, firstName, lastName ), notes, attended, appointments_states ( id, name )',
          { count: 'exact' },
        )
        .order('startDate', { ascending: false });

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
