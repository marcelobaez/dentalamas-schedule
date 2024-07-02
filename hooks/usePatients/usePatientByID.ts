import { useQuery } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';

export function usePatientByID(id: number) {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return { data };
    },
  });
}
