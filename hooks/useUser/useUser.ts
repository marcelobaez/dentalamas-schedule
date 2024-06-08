import { QueryData } from '@supabase/supabase-js';
import { Profile } from '../../types/profile';
import { Tables } from '../../types/supabase';
import useSupabaseBrowser from '../../utils/supabase/component';
import { useQuery } from '@tanstack/react-query';

export function useProfile() {
  const supabase = useSupabaseBrowser();

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: () => supabase.auth.getUser(),
    staleTime: Infinity,
  });

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (userData && userData.data.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.data.user.id)
          .single();
        if (error) throw error;
        return data;
      }
    },
    enabled: Boolean(userData) && Boolean(userData?.data.user !== null),
  });
}
