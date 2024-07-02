import { UseQueryOptions, keepPreviousData, useQuery } from '@tanstack/react-query';
import { AppointmentsResponse } from '../../types/appointment';
import { appointmentsQuerySelect } from '../../utils/constants';
import useSupabaseBrowser from '../../utils/supabase/component';
interface AppointmentParams {
  fromDate: string | null;
  toDate: string | null;
  specialist?: string | null;
  patient?: string | null;
  treatment?: string | null;
  ascending?: boolean;
  top?: number;
  options?: Omit<
    UseQueryOptions<AppointmentsResponse, Error>,
    'queryKey' | 'queryFn' | 'initialData'
  >;
}

export default function useAppointments({
  fromDate,
  toDate,
  treatment,
  specialist,
  patient,
  ascending,
  top,
  options,
}: AppointmentParams) {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['appointments', fromDate, toDate, specialist, treatment, top, patient, ascending],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(appointmentsQuerySelect, { count: 'exact' })
        .order('startDate', { ascending })
        .throwOnError();

      if (fromDate && toDate) query = query.gte('startDate', fromDate).lte('endDate', toDate);

      if (specialist) query = query.in('specialists.id', [specialist]);

      if (patient) query = query.in('patients.id', [patient]);

      if (treatment) query = query.in('treatments.id', [treatment]);

      // if (orderBy) query.order(orderBy, { ascending: true });

      if (top) query = query.limit(top);

      const { data, count } = await query.returns<AppointmentsResponse[]>();

      return { data, count };
    },
    placeholderData: keepPreviousData,
    enabled: !options ? true : Boolean(options.enabled),
  });
}
