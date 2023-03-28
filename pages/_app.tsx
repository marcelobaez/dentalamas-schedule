import { ReactElement, ReactNode, useState } from 'react';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import AppShellLayout from '../components/Layout/AppShell';
import { RouteTransition } from '../components/RouteTransition';
import { DehydratedState, Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import PatientsCreateModal from '../components/features/PatientsCreateModal/PatientsCreateModal';
import { Database } from '../types/supabase';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  initialSession: Session;
  dehydratedState: DehydratedState;
};

function MyApp({ Component, pageProps, dehydratedState, initialSession }: AppPropsWithLayout) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  const [queryClient] = useState(() => new QueryClient());

  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createBrowserSupabaseClient<Database>());

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => <AppShellLayout>{page}</AppShellLayout>);

  return (
    <>
      <Head>
        <title>Dentalamas turnos</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={dehydratedState}>
            <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
              <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme }}>
                <ModalsProvider modals={{ patientsCreate: PatientsCreateModal }}>
                  <RouteTransition />
                  <NotificationsProvider position="top-center">
                    {getLayout(<Component {...pageProps} />)}
                    <ReactQueryDevtools position="bottom-right" />
                  </NotificationsProvider>
                </ModalsProvider>
              </MantineProvider>
            </SessionContextProvider>
          </Hydrate>
        </QueryClientProvider>
      </ColorSchemeProvider>
    </>
  );
}

export default MyApp;
