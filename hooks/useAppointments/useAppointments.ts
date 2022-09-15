import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { AppointmentsResponse } from '../../types/appointment';
import { appointmentsQuerySelect } from '../../utils/constants';

interface AppointmentParams {
  fromDate: string | null;
  toDate: string | null;
  specialist: string | null;
  treatments: string | null;
}

export default function useAppointments({
  fromDate,
  toDate,
  treatments,
  specialist,
}: AppointmentParams) {
  const { user, error } = useUser();
  return useQuery(
    ['appointments', fromDate, toDate, specialist, treatments],
    async () => {
      const filterBySpecialist = specialist;
      const filterByTreatment = treatments;

      let query = supabaseClient
        .from('appointments')
        .select(appointmentsQuerySelect, { count: 'exact' })
        .order('startDate', { ascending: false });

      if (fromDate && toDate) query = query.gte('startDate', fromDate).lte('endDate', toDate);

      if (filterBySpecialist) query = query.in('specialists.id', [filterBySpecialist]);

      if (filterByTreatment) query = query.in('treatments.id', [filterByTreatment]);

      const { data, error } = await query;

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
