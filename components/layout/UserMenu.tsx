import { Avatar, Group, Menu, UnstyledButton, Text, rem } from '@mantine/core';
import { IconChevronDown, IconLogout } from '@tabler/icons-react';
import { useState } from 'react';
import classes from './User.module.css';
import { Tables } from '../../types/supabase';
import cx from 'clsx';
import useSupabaseBrowser from '../../utils/supabase/component';
import { useRouter } from 'next/router';

interface UserProps {
  profile: Tables<'profiles'>;
}

export function UserMenu({ profile: { firstName, lastName, email, avatar_url } }: UserProps) {
  const router = useRouter();
  const supabase = useSupabaseBrowser();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  return (
    <Menu
      width={150}
      position="bottom-end"
      transitionProps={{ transition: 'pop-top-right' }}
      onClose={() => setUserMenuOpened(false)}
      onOpen={() => setUserMenuOpened(true)}
      withinPortal
    >
      <Menu.Target>
        <UnstyledButton
          visibleFrom="sm"
          className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
        >
          <Group gap={4}>
            <Avatar
              {...(avatar_url ? { src: avatar_url } : null)}
              alt={firstName || ''}
              radius="xl"
              variant="transparent"
              size={30}
              color="darkPurple"
            />
            <Text fw={500} size="sm" lh={1} mr={3}>
              {`${firstName} ${lastName}`}
            </Text>
            <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          component="a"
          href="https://mantine.dev"
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          leftSection={<IconLogout size="1rem" />}
        >
          Cerrar sesion
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
