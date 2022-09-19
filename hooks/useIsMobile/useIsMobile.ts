import { useMediaQuery } from '@mantine/hooks';

export function useIsMobile() {
  return useMediaQuery('(max-width: 600px)', true, { getInitialValueInEffect: false });
}
