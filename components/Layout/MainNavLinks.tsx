import Link from 'next/link';
import { NavLink } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconCalendarEvent, IconClock2, IconHome2, IconUsers } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { menuAtom } from '../../atoms/menu';
import StethoscopeIcon from '../assets/icons/StethoscopeIcon';

export default function MainNavLinks() {
  const router = useRouter();
  const [, setOpened] = useAtom(menuAtom);

  const links = [
    { link: '/dashboard', label: 'Inicio', icon: <IconHome2 size="1rem" /> },
    { link: '/calendar', label: 'Calendario', icon: <IconCalendarEvent size="1rem" /> },
    { link: '/appointments', label: 'Turnos', icon: <IconClock2 size="1rem" /> },
    { link: '/patients', label: 'Pacientes', icon: <IconUsers size="1rem" /> },
    {
      link: '/specialists',
      label: 'Profesionales',
      icon: <StethoscopeIcon width="1rem" height="1rem" />,
    },
  ];

  return (
    <>
      {links.map((item, idx) => (
        <Link key={`nav-link-${idx}`} href={item.link} passHref legacyBehavior>
          <NavLink
            component="a"
            onClick={() => setOpened(false)}
            leftSection={item.icon}
            label={item.label}
            active={router.pathname === item.link}
          />
        </Link>
      ))}
    </>
  );
}
