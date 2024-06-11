import { useQuery } from '@tanstack/react-query';
import { RequestParams } from '../../types/api';
import useSupabaseBrowser from '../../utils/supabase/component';
import { Patient } from '../../types/patient';

export default function usePatients({
  from = 0,
  to = 10,
  sortBy = 'firstName',
  ascending = false,
  searchTerm,
}: RequestParams = {}) {
  const supabase = useSupabaseBrowser();
  return useQuery({
    queryKey: ['patients', from, to, sortBy, ascending, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select(
          'id, firstName, lastName, phone, email, created_at, created_by, streetAddress, zipCode, city',
          { count: 'exact' },
        )
        .order(sortBy, { ascending })
        .range(from, to - 1)
        .throwOnError();

      if (searchTerm)
        query = query.or(
          `lastName.ilike.%${searchTerm}%, firstName.ilike.%${searchTerm}%, phone.ilike.%${searchTerm}%`,
        );

      const { data, count } = await query.returns<Patient[]>();

      return { data, count };
    },
  });
}
