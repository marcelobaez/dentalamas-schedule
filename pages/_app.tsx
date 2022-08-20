// import '../styles/globals.css'
import { ReactElement, ReactNode, useState } from "react";
import { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from '@mantine/notifications';
import { UserProvider } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import AppShellLayout from "../components/Layout/AppShell";
import { RouteTransition } from '../components/RouteTransition';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ? ((page: any) => page) : ((page: any) => (
    <AppShellLayout>
      {page}
    </AppShellLayout>
  ))

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme: "light",
          }}
        >
          <RouteTransition />
          <NotificationsProvider position="top-center">
            <UserProvider supabaseClient={supabaseClient}>
              {/* <AppShellLayout> */}
                {/* <Component {...pageProps} /> */}
                {getLayout(<Component {...pageProps} />)}
              {/* </AppShellLayout> */}
            </UserProvider>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

export default MyApp;
