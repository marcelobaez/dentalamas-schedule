import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineColorsTuple, MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import AppShellLayout from '../components/layout/AppShell';
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import PatientsCreateModal from '../components/features/PatientsCreateModal/PatientsCreateModal';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/nprogress/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-react-table/styles.css';
import React from 'react';
import { DatesProvider } from '@mantine/dates';
import 'dayjs/locale/es';
import '../styles/globals.css';
import { RouteTransition } from '../components/RouteTransition';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  dehydratedState: DehydratedState;
};

const darkPurple: MantineColorsTuple = [
  '#f2f0ff',
  '#e0dff2',
  '#bfbdde',
  '#9b98ca',
  '#7d79ba',
  '#6a65b0',
  '#605bac',
  '#504c97',
  '#464388',
  '#3b3979',
];

function MyApp({ Component, pageProps, dehydratedState }: AppPropsWithLayout) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => <AppShellLayout>{page}</AppShellLayout>);

  const theme = createTheme({
    primaryColor: 'darkPurple',
    colors: { darkPurple },
    components: {
      Drawer: {
        styles: {
          title: { fontWeight: 600, fontSize: '1.2rem' },
        },
      },
      Modal: {
        styles: {
          title: { fontWeight: 600, fontSize: '1.2rem' },
        },
      },
    },
  });

  return (
    <>
      <Head>
        <title>Dentalamas turnos</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, maximum-scale=1"
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <MantineProvider theme={theme}>
            <DatesProvider
              settings={{
                locale: 'es',
              }}
            >
              <ModalsProvider modals={{ patientsCreate: PatientsCreateModal }}>
                <RouteTransition />
                <Notifications position="top-center" />
                {getLayout(<Component {...pageProps} />)}
                <ReactQueryDevtools />
              </ModalsProvider>
            </DatesProvider>
          </MantineProvider>
        </HydrationBoundary>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
