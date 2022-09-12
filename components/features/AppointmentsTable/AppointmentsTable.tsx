import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  CheckIcon,
  ColorSwatch,
  Group,
  Stack,
  Table,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import { IconEdit, IconCheck, IconHourglass, IconBan, IconUser } from '@tabler/icons';
import { DateTime } from 'luxon';
import { AppointmentsResponse } from '../../../types/appointment';
import { getAvatarFromNames } from '../../../utils/getAvatarName';
import AppointmentsEditModal from '../AppointmentsEditModal/AppointmentsEditModal';

interface TableProps {
  data: AppointmentsResponse[];
}

export enum AppointmentState {
  Approved = 1,
  Pending,
  Cancelled,
  Rejected,
}

const stateIcons = {
  [AppointmentState.Approved]: <IconCheck width={10} />,
  [AppointmentState.Pending]: <IconHourglass width={10} />,
  [AppointmentState.Cancelled]: <IconBan width={10} />,
  [AppointmentState.Rejected]: <IconUser width={10} />,
};

const stateColors = {
  [AppointmentState.Approved]: 'green',
  [AppointmentState.Pending]: '#CED4DA', //gray.4 in theme. TODO: find a way to change it to named index
  [AppointmentState.Cancelled]: 'red',
  [AppointmentState.Rejected]: 'black',
};

const getSwatchColorComponent = (state: AppointmentState, value: string) => {
  return (
    <Group spacing={'xs'}>
      <ColorSwatch size={20} component="button" color={stateColors[state]} sx={{ color: '#fff' }}>
        {stateIcons[state]}
      </ColorSwatch>
      <Text>{value}</Text>
    </Group>
  );
};

const mapAttendedStateToMsg = (state: null | boolean) => {
  switch (state) {
    case null:
      return 'N/D';
    case true:
      return 'SI';
    case false:
      return 'NO';
    default:
      return 'N/D';
  }
};

export default function AppointmentsTable({ data }: TableProps) {
  const theme = useMantineTheme();
  const modals = useModals();
  const isMobile = useMediaQuery('(max-width: 600px)', true, { getInitialValueInEffect: false });

  const openEditAppointmentModal = (item: AppointmentsResponse) => {
    modals.openModal({
      modalId: 'appointmentsEditModal',
      centered: true,
      size: isMobile ? '100%' : '55%',
      title: 'Editar turno',
      children: <AppointmentsEditModal data={item} />,
    });
  };

  return (
    <>
      <Table highlightOnHover sx={{ minWidth: 800 }} verticalSpacing="xs">
        <thead>
          <tr>
            <th>Turno</th>
            <th>Paciente</th>
            <th>Doctor</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Asistio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Render rows */}
          {data && data.length > 0 ? (
            data.map((item, idx) => (
              <tr key={`treat-row-${idx}`}>
                <td>
                  <Group>
                    <Text weight={500}>
                      {new Date(item.startDate).toLocaleString('es-AR', {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    <Badge radius="xs">{`${new Date(item.startDate).toLocaleString(
                      'es-AR',
                      DateTime.TIME_SIMPLE,
                    )} - ${new Date(item.endDate).toLocaleString(
                      'es-AR',
                      DateTime.TIME_SIMPLE,
                    )}`}</Badge>
                  </Group>
                </td>
                <td>
                  <Box sx={{ flex: 1 }}>
                    <Text
                      weight={500}
                      size="sm"
                    >{`${item.patients.firstName} ${item.patients.lastName}`}</Text>
                    <Text color="dimmed" size="xs">
                      {item.patients.phone}
                    </Text>
                  </Box>
                </td>
                <td>
                  <Group spacing="sm">
                    <Avatar color="pink" size={26} radius={26}>
                      {getAvatarFromNames(item.specialists.firstName, item.specialists.lastName)}
                    </Avatar>
                    <Text size="sm" weight={500}>
                      {`${item.specialists.firstName} ${item.specialists.lastName}`}
                    </Text>
                  </Group>
                </td>
                <td>
                  <Text size="sm">{item.treatments.name}</Text>
                </td>
                <td>
                  {item.appointments_states
                    ? getSwatchColorComponent(
                        item.appointments_states.id,
                        item.appointments_states.name,
                      )
                    : 'N/D'}
                </td>
                <td>{mapAttendedStateToMsg(item.attended)}</td>
                <td>
                  <Group>
                    <Tooltip label="Editar paciente">
                      <ActionIcon>
                        <IconEdit size={18} onClick={() => openEditAppointmentModal(item)} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td>
                <Text size="md">Aun no se agendaron turnos</Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}
