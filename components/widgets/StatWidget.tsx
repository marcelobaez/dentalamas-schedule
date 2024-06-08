import {
  ActionIcon,
  Center,
  // createStyles,
  Group,
  LoadingOverlay,
  Paper,
  Text,
} from '@mantine/core';
import { WidgetData } from '../../types/dashboard';

const StatWidget = ({ title, value, diff, color, Icon, isLoading }: WidgetData) => {
  return (
    <Paper p="md" radius="md" shadow="md">
      {isLoading && (
        <Center style={{ height: '71px', position: 'relative' }}>
          <LoadingOverlay visible />
        </Center>
      )}
      {!isLoading && (
        <>
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>
              {title}
            </Text>
            <ActionIcon color={color} variant="transparent">
              <Icon size={22} stroke={1.5} />
            </ActionIcon>
          </Group>
          <Group align="flex-end" gap="xs" mt={25}>
            <Text fz={32} fw={700} style={{ lineHeight: 1 }}>
              {value}
            </Text>
            {/* <Text color="teal" size="sm" weight={500} className={classes.diff}>
              <span>{`${diff}%`}</span>
              <IconArrowUpRight size={16} stroke={1.5} />
            </Text> */}
          </Group>
          <Text size="xs" c="dimmed" mt={7}>
            Esta semana
          </Text>
        </>
      )}
    </Paper>
  );
};

export default StatWidget;
