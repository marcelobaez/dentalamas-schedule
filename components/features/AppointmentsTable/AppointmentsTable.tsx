import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  CheckIcon,
  ColorSwatch,
  createStyles,
  Group,
  ScrollArea,
  Stack,
  Table,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { openConfirmModal, useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconEdit, IconCheck, IconHourglass, IconBan, IconUser, IconTrash } from '@tabler/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useIsMobile/useIsMobile';
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
  Rescheduled = 6,
}

export const stateColors = {
  [AppointmentState.Approved]: '#69DB7C',
  [AppointmentState.Pending]: '#FFA94D',
  [AppointmentState.Cancelled]: '#FF8787',
  [AppointmentState.Rejected]: '#5C5F66',
  [AppointmentState.Rescheduled]: '#CED4DA',
};

export const mantineStateColors = {
  [AppointmentState.Approved]: 'green',
  [AppointmentState.Pending]: 'orange', //gray.4 in theme. TODO: find a way to change it to named index
  [AppointmentState.Cancelled]: 'red',
  [AppointmentState.Rejected]: 'black',
  [AppointmentState.Rescheduled]: 'gray',
};

const getSwatchColorComponent = (state: AppointmentState, value: string) => {
  return (
    <Group spacing={'xs'}>
      <ColorSwatch size={16} color={mantineStateColors[state]} sx={{ color: '#fff' }}>
        {/* {stateIcons[state]} */}
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

const mapAttendedStateToColor = (state: null | boolean) => {
  switch (state) {
    case null:
      return 'gray';
    case true:
      return 'green';
    case false:
      return 'red';
    default:
      return 'gray';
  }
};

const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',
    zIndex: 10,

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

export default function AppointmentsTable({ data }: TableProps) {
  const queryClient = useQueryClient();
  const theme = useMantineTheme();
  const modals = useModals();
  const isMobile = useIsMobile();
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);

  // Create appointment mutation
  const { mutate, isLoading: isMutating } = useMutation(
    (id) => axios.delete(`/api/appointments/${id}`),
    {
      onSuccess: (newAppointment: AppointmentsResponse, id: string) => {
        queryClient.setQueryData(['appointments'], newAppointment);
        // Show success notification
        showNotification({
          title: 'Exito!',
          message: 'Se elimino el turno correctamente',
          color: 'green',
          icon: <IconCheck />,
        });
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(['appointments']);
        modals.closeModal('appointmentsEditModal');
      },
    },
  );

  const openEditModal = (item: AppointmentsResponse) => {
    modals.openModal({
      modalId: 'appointmentsEditModal',
      centered: true,
      size: isMobile ? '100%' : '55%',
      title: 'Editar turno',
      children: <AppointmentsEditModal data={item} />,
    });
  };

  const openDeleteModal = (id: string) =>
    openConfirmModal({
      title: 'Eliminar el turno',
      children: (
        <Text size="sm">Seguro que quiere eliminar el turno? Esta accion no es reversible</Text>
      ),
      centered: true,
      labels: { confirm: 'Eliminar turno', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => mutate(id),
    });

  return (
    <ScrollArea sx={{ height: '100%' }} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table highlightOnHover sx={{ minWidth: 800 }} verticalSpacing="xs">
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
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
                    <Avatar
                      color="pink"
                      size={26}
                      radius={26}
                      sx={(th) => ({
                        position: 'initial',
                      })}
                    >
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
                <td>
                  <Badge color={mapAttendedStateToColor(item.attended)}>
                    {mapAttendedStateToMsg(item.attended)}
                  </Badge>
                </td>
                <td>
                  <Group>
                    <Tooltip label="Editar turno">
                      <ActionIcon
                        sx={(th) => ({
                          position: 'initial',
                        })}
                      >
                        <IconEdit size={18} onClick={() => openEditModal(item)} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar turno">
                      <ActionIcon onClick={() => openDeleteModal(String(item.id))} color="red">
                        <IconTrash size={18} stroke={1.5} />
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
    </ScrollArea>
  );
}
