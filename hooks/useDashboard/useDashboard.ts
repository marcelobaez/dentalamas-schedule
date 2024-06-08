import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AppointmentsResponse } from '../../types/appointment';
import useSupabaseBrowser from '../../utils/supabase/component';

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
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // const fromLastWeekDate = dayjs().startOf('week').add(1, 'day').add(-1, 'week').format();
      // const toLastWeekDate = dayjs().endOf('week').add(-1, 'week').format();
      const fromDate = dayjs().startOf('week').add(1, 'day').format();
      const toDate = dayjs().endOf('week').format();

      const allAppQuery = await supabase
        .from('appointments')
        .select('startDate, endDate, specialists ( id, firstName, lastName )', {
          count: 'exact',
        })
        .gte('startDate', fromDate)
        .lte('endDate', toDate)
        .returns<AppointmentsResponse[]>();

      const attendedQuery = await supabase
        .from('appointments')
        .select('id, attended', { count: 'exact' })
        .is('attended', true)
        .gte('startDate', fromDate)
        .lte('endDate', toDate);

      const approvedQuery = await supabase
        .from('appointments')
        .select('id, appointments_states!inner ( id, name )', { count: 'exact' })
        .in('appointments_states.id', ['1'])
        .gte('startDate', fromDate)
        .lte('endDate', toDate);

      const cancelledQuery = await supabase
        .from('appointments')
        .select('id, appointments_states!inner ( id, name )', { count: 'exact' })
        .in('appointments_states.id', ['3'])
        .gte('startDate', fromDate)
        .lte('endDate', toDate);

      const doctorOneHours = allAppQuery.data
        ?.filter((item) => item.specialists.id === 1)
        .reduce((prev, curr) => {
          const prevFrom = dayjs(curr.startDate);
          const prevTo = dayjs(curr.endDate);

          const diff = prevTo.diff(prevFrom, 'hour', true);

          return prev + diff;
        }, 0);

      const doctorOnePercentage = doctorOneHours ? (doctorOneHours * 100) / 20 : 0;

      const doctorTwoHours = allAppQuery.data
        ?.filter((item) => item.specialists.id === 2)
        .reduce((prev, curr) => {
          const prevFrom = dayjs(curr.startDate);
          const prevTo = dayjs(curr.endDate);

          const diff = prevTo.diff(prevFrom, 'hour', true);

          return prev + diff;
        }, 0);

      const doctorTwoPercentage = doctorTwoHours ? (doctorTwoHours * 100) / 17.5 : 0;

      return {
        data: {
          attended: {
            count: attendedQuery.count,
          },
          cancelled: {
            count: cancelledQuery.count,
          },
          approved: { count: approvedQuery.count },
          workload: {
            doctorOne: {
              name: 'Nayibe Talamas',
              value: doctorOnePercentage,
            },
            doctorTwo: {
              name: 'Camila Valiente',
              value: doctorTwoPercentage,
            },
          },
        },
      };
    },
  });
}
