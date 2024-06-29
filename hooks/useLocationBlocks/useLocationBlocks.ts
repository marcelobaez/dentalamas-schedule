import { useQuery } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';

export default function useLocationBusinessHours(locationId: string) {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['blocks', locationId],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from('location_working_hours')
        .select('*')
        .eq('location_id', locationId);

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return { data, count };
    },
    enabled: Boolean(locationId),
  });
}
