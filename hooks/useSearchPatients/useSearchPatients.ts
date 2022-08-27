import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Patient } from '../../types/patient';

export default function useSearchPatients(keyword: string) {
  const { user, error } = useUser();
  return useQuery<Patient[]>(['patients', keyword], async () => {
    const { data, error } = await supabaseClient
      .from('patients')
      .select('id, firstName, lastName, phone, email');

    if (error) {
      throw new Error(`${error.message}: ${error.details}`);
    }

    return data;
  },
  
  {
    enabled: !!user
  });
}
