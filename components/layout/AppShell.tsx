import { ReactNode } from 'react';
import { AppShell, Group, useMantineColorScheme, NavLink, Burger, ActionIcon } from '@mantine/core';
import Logo from './Logo';
import {
  IconBuilding,
  IconLogout,
  IconMoonStars,
  IconSettings,
  IconSun,
} from '@tabler/icons-react';
import MainNavLinks from './MainNavLinks';
import { User } from './User';
import { useRouter } from 'next/router';
import useSupabaseBrowser from '../../utils/supabase/component';
import classes from './AppShell.module.css';
import { useProfile } from '../../hooks/useUser/useUser';
import { LocationButton } from './LocationButton';
import { useAtom } from 'jotai';
import { menuAtom } from '../../atoms/menu';
import { AnimatePresence } from 'framer-motion';
import { UserMenu } from './UserMenu';
import PageTransition from './PageTransition';
import DoctorIcon from '../assets/icons/DoctorIcon';
import StethoscopeIcon from '../assets/icons/StethoscopeIcon';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppShellLayout({ children }: AppLayoutProps) {
  const [opened, setOpened] = useAtom(menuAtom);
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
        collapsed: { mobile: !opened },
      }}
      className={classes.main}
      padding="md"
    >
      <AppShell.Header p="xs">
        <Group justify="space-between" align="center">
          <Burger opened={opened} onClick={() => setOpened((o) => !o)} hiddenFrom="sm" size="sm" />
          <Logo />
          <Group gap="xs">
            <ActionIcon
              onClick={() => toggleColorScheme()}
              size="sm"
              variant="transparent"
              className={classes.actionIcon}
            >
              {colorScheme === 'dark' ? <IconSun size="1.2rem" /> : <IconMoonStars size="1rem" />}
            </ActionIcon>
            {user && <UserMenu profile={user} />}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <LocationButton />
        </AppShell.Section>
        <AppShell.Section grow py="sm">
          <MainNavLinks />
        </AppShell.Section>
        <AppShell.Section>
          <NavLink
            leftSection={<IconSettings size="1rem" />}
            label="Administracion"
            href="#settings"
            childrenOffset={28}
          >
            <NavLink
              href="/locations"
              label="Sucursales"
              // leftSection={<IconBuilding size="1rem" />}
            />
            {/* <NavLink
              href="/specialists"
              label="Profesionales"
              // leftSection={<DoctorIcon width="1rem" height="1rem" />}
            /> */}
            <NavLink
              href="/treatments"
              label="Tratamientos"
              // leftSection={<StethoscopeIcon width="1rem" height="1rem" />}
            />
          </NavLink>
        </AppShell.Section>
        <AppShell.Section className={classes.footer}>
          {user && <User profile={user} />}
          <NavLink
            leftSection={<IconLogout size="1rem" />}
            component="a"
            label="Cerrar sesion"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
          />
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
          <PageTransition key={router.asPath}>{children}</PageTransition>
        </AnimatePresence>
      </AppShell.Main>
    </AppShell>
  );
}
