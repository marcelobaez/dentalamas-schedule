import { useQuery } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';

export default function useSpecialistByID(id: number) {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['specialists', id],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from('specialists')
        .select(
          'id, created_at, firstName, lastName, title, email, phone, streetAddress, locations(*), specialist_working_days(*), treatments(*), specialist_treatments(*), non_working_days(*), breaks(*), specialist_blocks(*)',
          {
            count: 'exact',
          },
        )
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return { data, count };
    },
  });
}
