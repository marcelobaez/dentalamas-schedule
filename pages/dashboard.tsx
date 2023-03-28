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
  Progress,
  Avatar,
} from '@mantine/core';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import useDashboard from '../hooks/useDashboard/useDashboard';
import StatWidget from '../components/widgets/StatWidget';
import { icons } from '../types/dashboard';
import 'dayjs/locale/es-mx';
import useAppointments from '../hooks/useAppointments/useAppointments';
import dayjs from 'dayjs';
import { AppointmentsResponse } from '../types/appointment';
import { DateTime } from 'luxon';
import {
  AppointmentState,
  mantineStateColors,
} from '../components/features/AppointmentsTable/AppointmentsTable';
import { Patient } from '../types/patient';
import { Specialist } from '../types/specialist';
import { GetServerSidePropsContext } from 'next';
import { AppointmentStates } from '../types/appointmentState';

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
        <Grid.Col xl={8} xs={12}>
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
                      appointmentsData.map((row, idx) => {
                        const appointmentState = row.appointments_states as AppointmentStates;
                        return (
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
                                    {`${(row.patients as Patient).lastName}, ${
                                      (row.patients as Patient).firstName
                                    }`}
                                  </Text>
                                  <Text size="xs" color="dimmed">
                                    {(row.patients as Patient).email}
                                  </Text>
                                </div>
                              </Group>
                            </td>
                            <td>
                              <Text>{`${(row.specialists as Specialist).firstName} ${
                                (row.specialists as Specialist).lastName
                              }`}</Text>
                            </td>
                            <td>
                              <Badge
                                color={mantineStateColors[appointmentState.id as AppointmentState]}
                                fullWidth
                              >
                                {appointmentState.name}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
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
        <Grid.Col xl={4} xs={12}>
          <Paper p="md" radius="md" shadow="md">
            <Title order={4} pb="md">
              Carga de trabajo
            </Title>
            {isLoadingAppointments && (
              <Center sx={(th) => ({ height: '287px', position: 'relative' })}>
                <LoadingOverlay visible />
              </Center>
            )}
            {!isLoadingAppointments && dashboardData && (
              <Grid align="center">
                <Grid.Col sm={12} lg={6}>
                  <Group spacing="sm">
                    <Avatar color="cyan" size={26} radius={26}>
                      NT
                    </Avatar>
                    <Text size="sm" weight={500}>
                      {dashboardData.data.workload.doctorOne.name}
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col sm={12} lg={6}>
                  <Progress
                    value={dashboardData?.data.workload.doctorOne.value}
                    label={`${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(
                      dashboardData.data.workload.doctorOne.value,
                    )}%`}
                    size="xl"
                    radius="xl"
                  />
                </Grid.Col>
                <Grid.Col sm={12} lg={6}>
                  <Group spacing="sm">
                    <Avatar color="gray" size={26} radius={26}>
                      CV
                    </Avatar>
                    <Text size="sm" weight={500}>
                      {dashboardData.data.workload.doctorTwo.name}
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col sm={12} lg={6}>
                  <Progress
                    value={dashboardData?.data.workload.doctorTwo.value}
                    label={`${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(
                      dashboardData.data.workload.doctorTwo.value,
                    )}%`}
                    size="xl"
                    radius="xl"
                  />
                </Grid.Col>
              </Grid>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };

  return {
    props: {
      initialSession: session,
    },
  };
};
