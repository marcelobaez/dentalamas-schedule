import {
  Text,
  Paper,
  Group,
  Grid,
  Title,
  Stack,
  Table,
  Badge,
  ScrollArea,
  Center,
  LoadingOverlay,
} from '@mantine/core';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import useDashboard from '../hooks/useDashboard/useDashboard';
import StatWidget from '../components/widgets/StatWidget';
import { icons } from '../types/dashboard';
import 'dayjs/locale/es-mx';
import useAppointments from '../hooks/useAppointments/useAppointments';
import dayjs from 'dayjs';
import { AppointmentsResponse } from '../types/appointment';
import { DateTime } from 'luxon';

export default function Dashboard() {
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboard();
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    fromDate: dayjs().startOf('day').format(),
    toDate: dayjs().endOf('day').format(),
    top: 5,
  });

  return (
    <>
      <Head>
        <title>Inicio</title>
        <meta name="description" content="Calendario de turnos" />
      </Head>
      <Grid>
        <Grid.Col span={12}>
          <Group position="apart">
            <Stack spacing={'sm'}>
              <Title order={2}>Bienvenido/a</Title>
              <Text size="sm" color="dimmed">
                Estadisticas de la semana
              </Text>
            </Stack>
          </Group>
        </Grid.Col>
        <Grid.Col xl={4} md={6} xs={12}>
          <StatWidget
            title="Pacientes atendidos"
            value={dashboardData?.data.attended.count}
            Icon={icons['user']}
            color="grape.4"
            isLoading={isLoadingDashboard}
          />
        </Grid.Col>
        <Grid.Col xl={4} md={6} xs={12}>
          <StatWidget
            title="Turnos aprobados"
            value={dashboardData?.data.approved.count}
            diff={10}
            Icon={icons['appointment']}
            color="blue.4"
            isLoading={isLoadingDashboard}
          />
        </Grid.Col>
        <Grid.Col xl={4} md={6} xs={12}>
          <StatWidget
            title="Turnos cancelados"
            value={dashboardData?.data.cancelled.count}
            Icon={icons['cancelled']}
            color="red.4"
            isLoading={isLoadingDashboard}
          />
        </Grid.Col>
        <Grid.Col xl={6} xs={12}>
          <Paper p="md" radius="md" shadow="md">
            <Title order={4}>Turnos del dia</Title>
            {isLoadingAppointments && (
              <Center sx={(th) => ({ height: '287px', position: 'relative' })}>
                <LoadingOverlay visible />
              </Center>
            )}
            {!isLoadingAppointments && (
              <ScrollArea>
                <Table verticalSpacing="xs">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Paciente</th>
                      <th>Doctor/a</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsData && appointmentsData.length > 0 ? (
                      appointmentsData.map((row, idx) => (
                        <tr key={`treat-row-${idx}`}>
                          <td>
                            <Badge fullWidth>{`${new Date(row.startDate).toLocaleString(
                              'es-AR',
                              DateTime.TIME_SIMPLE,
                            )} - ${new Date(row.endDate).toLocaleString(
                              'es-AR',
                              DateTime.TIME_SIMPLE,
                            )}`}</Badge>
                          </td>
                          <td>
                            <Group spacing="sm">
                              <div>
                                <Text size="sm" weight={500}>
                                  {`${row.patients.lastName}, ${row.patients.firstName}`}
                                </Text>
                                <Text size="xs" color="dimmed">
                                  {row.patients.email}
                                </Text>
                              </div>
                            </Group>
                          </td>
                          <td>
                            <Text>{`${row.specialists.firstName} ${row.specialists.lastName}`}</Text>
                          </td>
                          <td>
                            <Badge color="green" fullWidth>
                              {row.appointments_states.name}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td>
                          <Text size="md">No hay turnos agendados para hoy</Text>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </ScrollArea>
            )}
          </Paper>
        </Grid.Col>
        {/* <Grid.Col xl={6} xs={12}>
          <Paper p="md" radius="md" shadow="md">
            <Title order={4}>Carga de trabajo</Title>
          </Paper>
        </Grid.Col> */}
      </Grid>
    </>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
});
