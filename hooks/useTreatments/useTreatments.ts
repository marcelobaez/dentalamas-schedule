import { useQuery } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';

export default function useTreatments() {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['treatments'],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from('treatments')
        .select('*, treatment_visit_types (*)', {
          count: 'exact',
        });

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return { data, count };
    },
  });
}
