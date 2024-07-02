import {
  Anchor,
  Box,
  Breadcrumbs,
  LoadingOverlay,
  Stack,
  Tabs,
  Timeline,
  Title,
  Text,
  Group,
  rem,
  Divider,
  Badge,
  Avatar,
  Center,
  ThemeIcon,
} from '@mantine/core';
import Link from 'next/link';
import { usePatientByID } from '../../hooks/usePatients/usePatientByID';
import PatientsEditModal from '../features/PatientsEditModal/PatientsEditModal';
import useAppointments from '../../hooks/useAppointments/useAppointments';
import dayjs from 'dayjs';
import {
  mapAttendedStateToColor,
  mapAttendedStateToMsg,
} from '../features/AppointmentsTable/AppointmentsTable.utils';
import { getAvatarFromFullName } from '../../utils/getAvatarName';
import { IconHistory } from '@tabler/icons-react';

export function PatientEditForm({ id }: { id: number }) {
  const { data, status } = usePatientByID(id);
  const { data: apData, status: apStatus } = useAppointments({
    fromDate: null,
    toDate: null,
    patient: id.toString(),
    ascending: true,
  });

  if (status === 'pending' || apStatus === 'pending')
    return (
      <Box pos="relative" w="100%" h="calc(100dvh - 96px)">
        <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      </Box>
    );

  if (status === 'error' || apStatus === 'error') return <div>Hubo un error</div>;

  const fullName = `${data.data.firstName} ${data.data.lastName}`;

  return (
    <Stack>
      <Breadcrumbs>
        <Anchor href="/patients" component={Link}>
          Pacientes
        </Anchor>
        <Anchor href={`/patients/details/${id}`} component={Link}>
          {`Detalles ${data.data.firstName}`}
        </Anchor>
      </Breadcrumbs>
      <Group>
        <Avatar radius="sm" size="xl" color="darkPurple" src={null} alt="avatar image">
          {getAvatarFromFullName(fullName)}
        </Avatar>
        <Title order={1} fz="1.35rem">
          {fullName}
        </Title>
      </Group>
      <Tabs defaultValue="patient">
        <Tabs.List>
          <Tabs.Tab value="patient">Informacion</Tabs.Tab>
          <Tabs.Tab value="timeline">Historial de visitas</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="patient">
          <PatientsEditModal data={data.data} />
        </Tabs.Panel>

        <Tabs.Panel value="timeline">
          <Box pt="md">
            <Timeline
              active={apData.data ? apData.data.length - 1 : 0}
              bulletSize={24}
              lineWidth={2}
            >
              {(!apData.data || apData.data.length === 0) && (
                <Center>
                  <Stack justify="center">
                    <Group justify="center">
                      <ThemeIcon variant="light" size={rem(40)}>
                        <IconHistory />
                      </ThemeIcon>
                    </Group>
                    <Text>El paciente no registra visitas</Text>
                  </Stack>
                </Center>
              )}
              {apData.data &&
                apData.data.map((ap, idx) => (
                  <Timeline.Item
                    key={`tl-item-${ap.id}`}
                    lineVariant={`${
                      apData.data ? (apData.data.length - 2 === idx ? 'dashed' : 'solid') : 'solid'
                    }`}
                  >
                    <Group>
                      <Stack gap={0}>
                        <Text fz={rem(16)} c="dimmed">
                          {dayjs(ap.startDate).format('MMM YYYY').toLocaleUpperCase()}
                        </Text>
                        <Group align="end">
                          <Text fz={rem(16)} fw={500} component="span" style={{ lineHeight: 1 }}>
                            {dayjs(ap.startDate).format('DD')}
                          </Text>
                          <Text c="dark" fz={rem(12)} component="span" style={{ lineHeight: 1 }}>
                            {`${dayjs(ap.startDate).format('HH:mm')} - ${dayjs(ap.endDate).format(
                              'HH:mm',
                            )}`}
                          </Text>
                        </Group>
                      </Stack>
                      <Divider orientation="vertical" />
                      <Stack gap={4}>
                        <Text c="dimmed" tt="uppercase" fz={rem(12)}>
                          Tratamiento
                        </Text>
                        <Text c="dark" fz={rem(14)}>
                          {ap.treatments.name}
                        </Text>
                      </Stack>
                      <Stack gap={4}>
                        <Text c="dimmed" tt="uppercase" fz={rem(12)}>
                          Atendido por
                        </Text>
                        <Text c="dark" fz={rem(14)}>
                          {`${ap.specialists.firstName} ${ap.specialists.lastName}`}
                        </Text>
                      </Stack>
                      <Stack gap={4}>
                        <Text c="dimmed" tt="uppercase" fz={rem(12)}>
                          Asistencia
                        </Text>
                        <Text c="dark" fz={rem(14)}>
                          <Badge color={mapAttendedStateToColor(ap.attended)}>
                            {mapAttendedStateToMsg(ap.attended)}
                          </Badge>
                        </Text>
                      </Stack>
                    </Group>
                  </Timeline.Item>
                ))}
            </Timeline>
          </Box>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
