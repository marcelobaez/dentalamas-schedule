import {
  RingProgress,
  Text,
  Paper,
  Center,
  Group,
  Grid,
  Title,
  Stack,
  createStyles,
} from '@mantine/core';
import { DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { IconArrowUpRight, IconArrowDownRight, IconCalendar } from '@tabler/icons';
import dayjs from 'dayjs';
import Head from 'next/head';
import { useState } from 'react';
import useDashboard from '../hooks/useDashboard/useDashboard';

interface StatsRingProps {
  data: {
    label: string;
    stats: string;
    progress: number;
    color: string;
    icon: 'up' | 'down';
  }[];
}

const icons = {
  up: IconArrowUpRight,
  down: IconArrowDownRight,
};

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },
}));

export default function Dashboard() {
  const { classes } = useStyles();
  const [dateRangeValue, setRangeValue] = useState<DateRangePickerValue>([
    dayjs().startOf('week').add(1, 'day').toDate(),
    dayjs().endOf('week').toDate(),
  ]);

  const { data: dashboardData, isLoading } = useDashboard({
    fromDate: dayjs(dateRangeValue[0]).format(),
    toDate: dayjs(dateRangeValue[1]).format(),
  });

  return (
    <>
      <Head>
        <title>Inicio</title>
        <meta name="description" content="Calendario de turnos" />
      </Head>
      <Grid>
        <Grid.Col span={12}>
          <Group position="apart" align={'center'}>
            <Title order={2}>Inicio</Title>
            <DateRangePicker
              sx={(th) => ({ minWidth: '350px' })}
              icon={<IconCalendar size={16} />}
              placeholder="Elija el rango de fechas"
              value={dateRangeValue}
              onChange={(value: DateRangePickerValue) => {
                if (value[1]) setRangeValue(value);
              }}
              locale="es-mx"
            />
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Group position="apart">
            <Stack spacing={'sm'}>
              <Title order={1}>Bienvenido/a</Title>
              <Text color="dimmed" mt="md">
                Aqui podra ver las estadisticas de asistencia de sus pacientes
              </Text>
            </Stack>
          </Group>
        </Grid.Col>
        <Grid.Col span={4}>
          {dashboardData && (
            <Paper withBorder p="md" radius="md">
              <Group>
                <RingProgress
                  size={80}
                  roundCaps
                  thickness={8}
                  sections={[{ value: 50, color: 'green' }]}
                  label={
                    <Center>
                      <IconArrowUpRight size={22} stroke={1.5} />
                    </Center>
                  }
                />

                <div>
                  <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                    Pacientes atendidos
                  </Text>
                  <Text weight={700} size="xl">
                    {dashboardData.data.attendedCount}
                  </Text>
                </div>
              </Group>
            </Paper>
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          {dashboardData && (
            <Paper withBorder p="md" radius="md">
              <Group>
                <RingProgress
                  size={80}
                  roundCaps
                  thickness={8}
                  sections={[{ value: 50, color: 'blue' }]}
                  label={
                    <Center>
                      <IconArrowUpRight size={22} stroke={1.5} />
                    </Center>
                  }
                />

                <div>
                  <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                    Turnos aprobados
                  </Text>
                  <Text weight={700} size="xl">
                    {dashboardData.data.aprobedCount}
                  </Text>
                </div>
              </Group>
            </Paper>
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          {dashboardData && (
            <Paper withBorder p="md" radius="md">
              <Group>
                <RingProgress
                  size={80}
                  roundCaps
                  thickness={8}
                  sections={[{ value: 50, color: 'red' }]}
                  label={
                    <Center>
                      <IconArrowUpRight size={22} stroke={1.5} />
                    </Center>
                  }
                />

                <div>
                  <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                    Turnos cancelados
                  </Text>
                  <Text weight={700} size="xl">
                    {dashboardData.data.cancelledCount}
                  </Text>
                </div>
              </Group>
            </Paper>
          )}
        </Grid.Col>
      </Grid>
    </>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
});
