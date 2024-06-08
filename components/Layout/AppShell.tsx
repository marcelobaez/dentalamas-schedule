import { ReactNode } from 'react';
import { AppShell, Group, useMantineColorScheme, NavLink, Burger, ActionIcon } from '@mantine/core';
import Logo from './Logo';
import { IconLogout, IconMoonStars, IconSun } from '@tabler/icons-react';
import MainNavLinks from './MainNavLinks';
import Link from 'next/link';
import { User } from './User';
import { useRouter } from 'next/router';
import useSupabaseBrowser from '../../utils/supabase/component';
import classes from './AppShell.module.css';
import { useProfile } from '../../hooks/useUser/useUser';
import { LocationButton } from './LocationButton';
import { useDisclosure } from '@mantine/hooks';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppShellLayout({ children }: AppLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const supabase = useSupabaseBrowser();
  const router = useRouter();

  const { data: user } = useProfile();

  return (
    <AppShell
      header={{ height: 50 }}
      navbar={{
        breakpoint: 'sm',
        width: { sm: 300 },
        collapsed: { mobile: !mobileOpened },
      }}
      className={classes.main}
      padding="md"
    >
      <AppShell.Header p="xs">
        <Group justify="space-between" align="center">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Logo />
          <ActionIcon
            onClick={() => toggleColorScheme()}
            size="sm"
            variant="transparent"
            className={classes.actionIcon}
          >
            {colorScheme === 'dark' ? <IconSun size="1rem" /> : <IconMoonStars size="1rem" />}
          </ActionIcon>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <LocationButton />
        </AppShell.Section>
        <AppShell.Section grow py="sm">
          <MainNavLinks />
        </AppShell.Section>
        <AppShell.Section className={classes.footer}>
          {user && <User profile={user} />}
          <Link href="#" passHref legacyBehavior>
            <NavLink
              leftSection={<IconLogout size="1rem" />}
              component="a"
              label="Cerrar sesion"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
            />
          </Link>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
