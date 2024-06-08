import { MRT_ColumnDef } from 'mantine-react-table';
import { useMemo } from 'react';
import { AppointmentsResponse } from '../../../../types/appointment';
import { Avatar, Badge, Box, Group, Text } from '@mantine/core';
import { DateTime } from 'luxon';
import { getAvatarFromNames } from '../../../../utils/getAvatarName';
import {
  getSwatchColorComponent,
  mapAttendedStateToColor,
  mapAttendedStateToMsg,
} from '../AppointmentsTable.utils';
import StethoscopeIcon from '../../../assets/icons/StethoscopeIcon';
import dayjs from 'dayjs';
import { DATE_FORMAT, DATE_FORMAT_WITH_TIME } from '../../../../utils/constants';

export const useAppointmentColumns = () => {
  const columns = useMemo<MRT_ColumnDef<AppointmentsResponse>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Turno',
        Cell: ({ row }) => (
          <Group wrap="nowrap">
            <Text fw={500} fz="sm">
              {dayjs(row.original.startDate).format(DATE_FORMAT)}
            </Text>
            <Badge radius="xs">{`${new Date(row.original.startDate).toLocaleString(
              'es-AR',
              DateTime.TIME_SIMPLE,
            )} - ${new Date(row.original.endDate).toLocaleString(
              'es-AR',
              DateTime.TIME_SIMPLE,
            )}`}</Badge>
          </Group>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Paciente',
        Cell: ({ row }) => (
          <Box style={{ flex: 1 }}>
            <Text
              fw={500}
              size="sm"
            >{`${row.original.patients.firstName} ${row.original.patients.lastName}`}</Text>
            <Text c="dimmed" size="xs">
              {row.original.patients.phone}
            </Text>
          </Box>
        ),
      },
      {
        accessorKey: 'specialists',
        header: 'Doctor',
        Cell: ({ row }) => (
          <Group gap="sm">
            <Avatar
              color="violet"
              size={26}
              radius={26}
              style={{
                position: 'initial',
              }}
            >
              <StethoscopeIcon width="1.1rem" height="1.1rem" />
            </Avatar>
            <Text size="sm" fw={500}>
              {`${row.original.specialists.firstName} ${row.original.specialists.lastName}`}
            </Text>
          </Group>
        ),
      },
      {
        accessorKey: 'treatments',
        header: 'Motivo',
        Cell: ({ row }) => <Text fz="sm">{row.original.treatments.name}</Text>,
      },
      {
        accessorKey: 'appointments_states',
        header: 'Estado',
        Cell: ({ row }) => (
          <span>
            {getSwatchColorComponent(
              row.original.appointments_states.id,
              row.original.appointments_states.name,
            )}
          </span>
        ),
      },
      {
        accessorKey: 'attended',
        header: 'Asistio',
        Cell: ({ row }) => (
          <Badge color={mapAttendedStateToColor(row.original.attended)}>
            {mapAttendedStateToMsg(row.original.attended)}
          </Badge>
        ),
      },
    ],
    [],
  );

  return columns;
};
