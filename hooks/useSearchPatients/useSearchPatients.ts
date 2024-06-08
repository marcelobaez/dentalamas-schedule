import { useQuery } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';

export default function useSearchPatients(keyword: string) {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['patients', keyword],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, firstName, lastName, phone, email');

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return data;
    },
  });
}
