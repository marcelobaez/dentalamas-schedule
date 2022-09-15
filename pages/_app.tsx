import { ReactElement, ReactNode, useState } from 'react';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { UserProvider } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import AppShellLayout from '../components/Layout/AppShell';
import { RouteTransition } from '../components/RouteTransition';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import PatientsCreateModal from '../components/features/PatientsCreateModal/PatientsCreateModal';

// import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/list/main.css';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  const [queryClient] = useState(() => new QueryClient());

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout
    ? (page: any) => page
    : (page: any) => <AppShellLayout>{page}</AppShellLayout>;

  return (
    <>
      <Head>
        <title>Dentalamas turnos</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <UserProvider supabaseClient={supabaseClient}>
              <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme }}>
                <ModalsProvider modals={{ patientsCreate: PatientsCreateModal }}>
                  <RouteTransition />
                  <NotificationsProvider position="top-center">
                    {getLayout(<Component {...pageProps} />)}
                    <ReactQueryDevtools position="bottom-right" />
                  </NotificationsProvider>
                </ModalsProvider>
              </MantineProvider>
            </UserProvider>
          </Hydrate>
        </QueryClientProvider>
      </ColorSchemeProvider>
    </>
  );
}

export default MyApp;
