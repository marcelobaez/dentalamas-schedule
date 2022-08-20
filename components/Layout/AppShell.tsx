import { ReactNode, useEffect, useState } from 'react';
import {
  AppShell,
  Navbar,
  useMantineTheme,
  Group,
  useMantineColorScheme,
  createStyles,
  NavLink,
} from '@mantine/core';
import Logo from './Logo';
import { IconLogout } from '@tabler/icons';
import MainNavLinks from './MainNavLinks';
import Link from 'next/link';
import { supabaseClient} from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { User } from './User';

interface AppLayoutProps {
  children: ReactNode;
}

const useStyles = createStyles((theme, _params, getRef) => {
  const icon: any = getRef('icon');
  return {
    header: {
      // paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
      }`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
      }`,
    },
  };
});

export default function AppShellLayout({ children }: AppLayoutProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  // const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { classes, cx } = useStyles();

  const { user } = useUser();
  const [profile, setData] = useState();

  useEffect(() => {
    async function loadData() {
      const { data: profileData, error } = await supabaseClient.from('profiles').select('avatar_url, username, email').eq('id', user!.id).single();
      if (error) console.log(error)
      if (!error) setData(profileData);
    }
    // Only run query once user is logged in.
    if (user) loadData();
  }, [user]);

  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      navbar={
        <Navbar hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 300 }} p="md">
          <Navbar.Section grow>
            <Group className={classes.header} position="apart">
              <Logo />
            </Group>
            <MainNavLinks />
          </Navbar.Section>
          <Navbar.Section>
            {
              profile && <User profile={profile}/>
            }
          </Navbar.Section>
          <Navbar.Section className={classes.footer}>
            <Link href="/api/auth/logout" passHref>
              <NavLink
                // onClick={(event: any) => {
                //   event.preventDefault();
                //   supabaseClient.auth.signOut();
                // }}
                icon={<IconLogout />}
                component="a"
                label="Cerrar sesion"
              />
            </Link>
          </Navbar.Section>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      })}
    >
      {children}
    </AppShell>
  );
}