import { useQuery } from '@tanstack/react-query';
import { RequestParams } from '../../types/api';
import useSupabaseBrowser from '../../utils/supabase/component';

export default function useSpecialists() {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['specialists'],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from('specialists')
        .select(
          'id, created_at, firstName, lastName, title, email, phone, streetAddress, locations(*), specialist_working_days(*), treatments(*), specialist_treatments(*)',
          {
            count: 'exact',
          },
        );

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return { data, count };
    },
  });
}
