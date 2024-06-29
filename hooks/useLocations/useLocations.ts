import { useQuery } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';

export default function useLocations() {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, count, error } = await supabase.from('locations').select('*');

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return { data, count };
    },
  });
}
