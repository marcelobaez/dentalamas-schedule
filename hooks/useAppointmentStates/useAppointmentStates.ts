import { useQuery } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';

export default function useAppointmentsStates() {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['appointmentsStates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('appointments_states').select('id, name');

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return data;
    },
  });
}
