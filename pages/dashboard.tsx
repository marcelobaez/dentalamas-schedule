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
import Head from 'next/head';
import useDashboard from '../hooks/useDashboard/useDashboard';
import StatWidget from '../components/widgets/StatWidget';
import 'dayjs/locale/es-mx';
import useAppointments from '../hooks/useAppointments/useAppointments';
import dayjs from 'dayjs';
import { DateTime } from 'luxon';
import {
  AppointmentState,
  mantineStateColors,
} from '../components/features/AppointmentsTable/AppointmentsTable.utils';
import { Patient } from '../types/patient';
import { Specialist } from '../types/specialist';
import { GetServerSidePropsContext } from 'next';
import { AppointmentStates } from '../types/appointmentState';
import { IconClock2, IconForbid, IconUser } from '@tabler/icons-react';
import { createClient } from '../utils/supabase/server-props';
import React from 'react';
import { getAvatarFromFullName } from '../utils/getAvatarName';

export default function Dashboard() {
  const { data: dashboardData, status } = useDashboard();
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    fromDate: dayjs().startOf('day').format(),
    toDate: dayjs().endOf('day').format(),
  });

  return (
    <>
      <Head>
        <title>Inicio</title>
        <meta name="description" content="Calendario de turnos" />
      </Head>
      <Grid>
        <Grid.Col span={12}>
          <Group justify="space-between">
            <Stack gap={'sm'}>
              <Title order={2}>Bienvenido/a</Title>
              <Text size="sm" c="dimmed">
                Estadisticas de la semana
              </Text>
            </Stack>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ xl: 4, md: 6, xs: 12 }}>
          <StatWidget
            title="Pacientes atendidos"
            value={dashboardData?.data.totalAttended}
            Icon={() => <IconUser />}
            color="grape.4"
            isLoading={status === 'pending'}
          />
        </Grid.Col>
        <Grid.Col span={{ xl: 4, md: 6, xs: 12 }}>
          <StatWidget
            title="Turnos aprobados"
            value={dashboardData?.data.totalApproved}
            diff={10}
            Icon={() => <IconClock2 />}
            color="blue.4"
            isLoading={status === 'pending'}
          />
        </Grid.Col>
        <Grid.Col span={{ xl: 4, md: 6, xs: 12 }}>
          <StatWidget
            title="Turnos cancelados"
            value={dashboardData?.data.totalCancelled}
            Icon={() => <IconForbid />}
            color="red.4"
            isLoading={status === 'pending'}
          />
        </Grid.Col>
        <Grid.Col span={{ xl: 8, xs: 12 }}>
          <Paper p="md" radius="md" shadow="md">
            <Title order={4}>Turnos del dia</Title>
            {isLoadingAppointments && (
              <Center style={{ height: '287px', position: 'relative' }}>
                <LoadingOverlay visible />
              </Center>
            )}
            {!isLoadingAppointments && (
              <ScrollArea>
                <Table verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Hora</Table.Th>
                      <Table.Th>Paciente</Table.Th>
                      <Table.Th>Profesional</Table.Th>
                      <Table.Th>Estado</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {appointmentsData &&
                    appointmentsData.data &&
                    appointmentsData.data.length > 0 ? (
                      appointmentsData.data?.map((row, idx) => {
                        const appointmentState = row.appointments_states as AppointmentStates;
                        return (
                          <Table.Tr key={`treat-row-${idx}`}>
                            <Table.Td>
                              <Badge fullWidth>{`${new Date(row.startDate).toLocaleString(
                                'es-AR',
                                DateTime.TIME_SIMPLE,
                              )} - ${new Date(row.endDate).toLocaleString(
                                'es-AR',
                                DateTime.TIME_SIMPLE,
                              )}`}</Badge>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="sm">
                                <div>
                                  <Text size="sm" fw={500}>
                                    {`${(row.patients as Patient).lastName}, ${
                                      (row.patients as Patient).firstName
                                    }`}
                                  </Text>
                                  <Text size="xs" color="dimmed">
                                    {(row.patients as Patient).email}
                                  </Text>
                                </div>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Text>{`${(row.specialists as Specialist).firstName} ${
                                (row.specialists as Specialist).lastName
                              }`}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={mantineStateColors[appointmentState.id as AppointmentState]}
                                fullWidth
                              >
                                {appointmentState.name}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td>
                          <Text size="md">No hay turnos agendados para hoy</Text>
                        </td>
                      </tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ xl: 4, xs: 12 }}>
          <Paper p="md" radius="md" shadow="md">
            <Title order={4} pb="md">
              Carga por profesional
            </Title>
            {isLoadingAppointments && (
              <Center style={{ height: '287px', position: 'relative' }}>
                <LoadingOverlay visible />
              </Center>
            )}
            {!isLoadingAppointments && dashboardData && (
              <Grid align="center">
                {dashboardData &&
                  dashboardData.data.workload.map((wl, idx) => (
                    <React.Fragment key={`col-name-sp-${idx}`}>
                      <Grid.Col span={{ sm: 12, lg: 6 }}>
                        <Group gap="sm">
                          <Avatar color="darkPurple" size={26} radius={26}>
                            {getAvatarFromFullName(wl.specialistName)}
                          </Avatar>
                          <Text size="sm" fw={500}>
                            {wl.specialistName}
                          </Text>
                        </Group>
                      </Grid.Col>
                      <Grid.Col span={{ sm: 12, lg: 6 }}>
                        <Progress.Root size="xl" radius="xl">
                          <Progress.Section value={wl.loadPercentage}>
                            <Progress.Label>{`${new Intl.NumberFormat('es-AR', {
                              maximumFractionDigits: 0,
                            }).format(wl.loadPercentage)}%`}</Progress.Label>
                          </Progress.Section>
                        </Progress.Root>
                      </Grid.Col>
                    </React.Fragment>
                  ))}
              </Grid>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createClient(ctx);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: data.user,
    },
  };
};
