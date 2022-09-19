import {
  ActionIcon,
  Center,
  createStyles,
  Group,
  LoadingOverlay,
  Paper,
  Text,
} from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons';
import { WidgetData } from '../../types/dashboard';

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },

  value: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  },

  title: {
    fontWeight: 700,
    textTransform: 'uppercase',
  },
}));

const StatWidget = ({ title, value, diff, color, Icon, isLoading }: WidgetData) => {
  const { classes } = useStyles();

  return (
    <Paper p="md" radius="md" shadow="md">
      {isLoading && (
        <Center sx={(th) => ({ height: '71px', position: 'relative' })}>
          <LoadingOverlay visible />
        </Center>
      )}
      {!isLoading && (
        <>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              {title}
            </Text>
            <ActionIcon color={color} variant="transparent">
              <Icon size={22} stroke={1.5} />
            </ActionIcon>
          </Group>
          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{value}</Text>
            {/* <Text color="teal" size="sm" weight={500} className={classes.diff}>
              <span>{`${diff}%`}</span>
              <IconArrowUpRight size={16} stroke={1.5} />
            </Text> */}
          </Group>
          <Text size="xs" color="dimmed" mt={7}>
            Esta semana
          </Text>
        </>
      )}
    </Paper>
  );
};

export default StatWidget;
