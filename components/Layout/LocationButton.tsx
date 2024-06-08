import { UnstyledButton, Group, Avatar, Text, rem, Box } from '@mantine/core';
import classes from './User.module.css';
import { IconBuilding } from '@tabler/icons-react';

export function LocationButton() {
  return (
    <Box
      style={{
        padding: 'calc(0.5rem* var(--mantine-scale)) var(--mantine-spacing-sm)',
        border: '1px solid var(--mantine-color-gray-3)',
        borderRadius: 'var(--mantine-spacing-xs)',
      }}
    >
      <UnstyledButton className={classes.user}>
        <Group>
          {/* <Avatar radius="xl" /> */}
          <IconBuilding />
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              Predigma
            </Text>

            <Text c="dimmed" size="xs">
              Feliz de Azara 1331, 5to Piso
            </Text>
          </div>

          {/* <IconChevronRight style={{ width: rem(14), height: rem(14) }} stroke={1.5} /> */}
        </Group>
      </UnstyledButton>
    </Box>
  );
}
