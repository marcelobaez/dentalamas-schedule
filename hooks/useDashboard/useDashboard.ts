import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

interface DashboardParams {
  fromDate: string | null;
  toDate: string | null;
}

type Diffvalue = number | null;

const calculateDiff = (curr: Diffvalue, prev: Diffvalue) => {
  if (curr && prev) {
    return curr > 0 ? (curr / prev) * 100 - 100 : 0;
  } else {
    return 0;
  }
};

export default function useDashboard() {
  const { user, error } = useUser();
  return useQuery(
    ['dashboard'],
    async () => {
      // const fromLastWeekDate = dayjs().startOf('week').add(1, 'day').add(-1, 'week').format();
      // const toLastWeekDate = dayjs().endOf('week').add(-1, 'week').format();
      const fromDate = dayjs().startOf('week').add(1, 'day').format();
      const toDate = dayjs().endOf('week').format();

      const attendedQuery = await supabaseClient
        .from('appointments')
        .select('id, attended', { count: 'exact' })
        .is('attended', true)
        .gte('startDate', fromDate)
        .lte('endDate', toDate);

      const approvedQuery = await supabaseClient
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

      return {
        data: {
          attended: {
            count: attendedQuery.count,
            // diff: calculateDiff(attendedQuery.count, lastWattendedQuery.count),
          },
          cancelled: {
            count: cancelledQuery.count,
            // diff: calculateDiff(cancelledQuery.count, lastCancelledQuery.count),
          },
          approved: { count: approvedQuery.count },
        },
      };
    },
    {
      enabled: !!user,
    },
  );
}
