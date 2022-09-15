import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';

interface DashboardParams {
  fromDate: string | null;
  toDate: string | null;
}

export default function useDashboard({ fromDate, toDate }: DashboardParams) {
  const { user, error } = useUser();
  return useQuery(
    ['dashboard', fromDate, toDate],
    async () => {
      const attendedQuery = await supabaseClient
        .from('appointments')
        .select('id, attended', { count: 'exact' })
        .is('attended', true)
        .gte('startDate', fromDate)
        .lte('endDate', toDate);

      const aprobedQuery = await supabaseClient
        .from('appointments')
        .select('id, appointments_states!inner ( id, name )', { count: 'exact' })
        .in('appointments_states.id', ['1'])
        .gte('startDate', fromDate)
        .lte('endDate', toDate);

      const cancelledQuery = await supabaseClient
        .from('appointments')
        .select('id, appointments_states!inner ( id, name )', { count: 'exact' })
        .in('appointments_states.id', ['3'])
        .gte('startDate', fromDate)
        .lte('endDate', toDate);

      if (attendedQuery.error || aprobedQuery.error) {
        throw new Error('Hubo un error obteniendo los datos');
      }

      return {
        data: {
          attendedCount: attendedQuery.count,
          aprobedCount: aprobedQuery.count,
          cancelledCount: cancelledQuery.count,
        },
      };
    },
    {
      enabled: !!user,
    },
  );
}
