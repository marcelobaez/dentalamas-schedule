import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { AppointmentsResponse } from '../../types/appointment';

export default function useAppointments() {
  const { user, error} = useUser();
  return useQuery(
    ['appointments'],
    async () => {
      const { data, error, count  } = await supabaseClient
      .from<AppointmentsResponse>('appointments')
      .select(
        'startDate, endDate, patients ( firstName, lastName, phone, email), treatments ( name ), specialists ( firstName, lastName )', { count: 'exact'}
      ).order('startDate', {ascending: false});

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
