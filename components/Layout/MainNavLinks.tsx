import { NavLink } from '@mantine/core';
import { IconCalendarEvent, IconClock2, IconDashboard, IconUsers } from '@tabler/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MainNavLinks() {
  const router = useRouter();

  const links = [
    // { link: '/dashboard', label: 'Dashboard', icon: <IconDashboard/> },
    { link: '/calendar', label: 'Calendario', icon: <IconCalendarEvent />},
    { link: '/appointments', label: 'Turnos', icon: <IconClock2 /> },
    { link: '/patients', label: 'Pacientes', icon: <IconUsers /> },
  ];

  return (
    <>
    {
      links.map((item, idx) => (
        <Link key={`nav-link-${idx}`} href={item.link} passHref>
          <NavLink component="a" icon={item.icon} label={item.label} active={router.pathname === item.link} />
        </Link>
      ))
    }
    </>
  )
}