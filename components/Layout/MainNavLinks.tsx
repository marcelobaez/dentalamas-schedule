import Link from 'next/link';
import { NavLink } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconCalendarEvent, IconClock2, IconHome2, IconUsers } from '@tabler/icons';
import { useAtom } from 'jotai';
import { menuAtom } from '../../atoms/menu';

export default function MainNavLinks() {
  const router = useRouter();
  const [, setOpened] = useAtom(menuAtom);

  const links = [
    { link: '/dashboard', label: 'Inicio', icon: <IconHome2 /> },
    { link: '/calendar', label: 'Calendario', icon: <IconCalendarEvent /> },
    { link: '/appointments', label: 'Turnos', icon: <IconClock2 /> },
    { link: '/patients', label: 'Pacientes', icon: <IconUsers /> },
  ];

  return (
    <>
      {links.map((item, idx) => (
        <Link key={`nav-link-${idx}`} href={item.link} passHref legacyBehavior>
          <NavLink
            component="a"
            onClick={() => setOpened(false)}
            icon={item.icon}
            label={item.label}
            active={router.pathname === item.link}
          />
        </Link>
      ))}
    </>
  );
}
