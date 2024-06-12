import React from 'react';
import { UnstyledButton, Group, Avatar, Text, Box } from '@mantine/core';
import classes from './User.module.css';
import { Tables } from '../../types/supabase';

interface UserProps {
  profile: Tables<'profiles'>;
}

export function User(props: UserProps) {
  return (
    <Box
      style={{
        padding: 'calc(0.5rem* var(--mantine-scale)) var(--mantine-spacing-sm)',
      }}
      hiddenFrom="sm"
    >
      <UnstyledButton className={classes.user}>
        <Group>
          <Avatar
            {...(props.profile.avatar_url ? { src: props.profile.avatar_url } : null)}
            radius="xl"
            color="darkPurple"
          />
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {props.profile.username}
            </Text>
            <Text c="dimmed" size="xs">
              {props.profile.email}
            </Text>
          </Box>
        </Group>
      </UnstyledButton>
    </Box>
  );
}
