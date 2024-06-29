import Link from 'next/link';
import { NavLink } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconCalendarEvent, IconClock2, IconHome2, IconUsers } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { menuAtom } from '../../atoms/menu';
import StethoscopeIcon from '../assets/icons/StethoscopeIcon';
import DoctorIcon from '../assets/icons/DoctorIcon';

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
      icon: <DoctorIcon width="1rem" height="1rem" />,
    },
    // {
    //   link: '/treatments',
    //   label: 'Tratamientos',
    //   icon: <StethoscopeIcon width="1rem" height="1rem" />,
    // },
  ];

  return (
    <>
      {links.map((item, idx) => (
        <NavLink
          key={`nav-link-${idx}`}
          component={Link}
          href={item.link}
          onClick={() => setOpened(false)}
          leftSection={item.icon}
          label={item.label}
          active={router.pathname === item.link}
        />
      ))}
    </>
  );
}
