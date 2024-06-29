import { useQuery } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';

export default function useTreatmentVisits() {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['treatment-visit-types'],
    queryFn: async () => {
      const { data, count, error } = await supabase.from('treatment_visit_types').select('*', {
        count: 'exact',
      });

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return { data, count };
    },
  });
}
