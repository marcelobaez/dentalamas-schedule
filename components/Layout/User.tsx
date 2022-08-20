import React from 'react';
import { UnstyledButton, Group, Avatar, Text, Box, useMantineTheme } from '@mantine/core';

interface UserProps {
  profile: {
    avatar_url: string;
    username: string;
    email: string;
  };
}

export function User(props: UserProps) {
  const theme = useMantineTheme();

  return (
    <Box
      sx={{
        paddingTop: theme.spacing.sm,
      }}
    >
      <UnstyledButton
        sx={{
          display: 'block',
          width: '100%',
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

          '&:hover': {
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          },
        }}
      >
        <Group>
          <Avatar
            {...(props.profile.avatar_url ? { src: props.profile.avatar_url } : null)}
            radius="xl"
          />
          <Box sx={{ flex: 1 }}>
            <Text size="sm" weight={500}>
              {props.profile.username}
            </Text>
            <Text color="dimmed" size="xs">
              {props.profile.email}
            </Text>
          </Box>

          {/* {theme.dir === 'ltr' ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />} */}
        </Group>
      </UnstyledButton>
    </Box>
  );
}
