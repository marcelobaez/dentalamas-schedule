import {
  Avatar,
  Badge,
  CheckIcon,
  ColorSwatch,
  Group,
  Stack,
  Table,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { DateTime } from 'luxon';
import { AppointmentsResponse } from '../../../types/appointment';
import { getAvatarFromNames } from '../../../utils/getAvatarName';

interface TableProps {
  data: AppointmentsResponse[];
}

export default function AppointmentsTable({ data }: TableProps) {
  const theme = useMantineTheme();
  return (
    <Table striped highlightOnHover sx={{ minWidth: 800 }} verticalSpacing="xs">
      <thead>
        <tr>
          <th>Turno</th>
          <th>Paciente</th>
          <th>Doctor</th>
          <th>Motivo</th>
          <th>Estado</th>
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
                <Stack spacing="xs">
                  <Text
                    weight={500}
                    color="gray"
                    size="sm"
                  >{`${item.patients.firstName} ${item.patients.lastName}`}</Text>
                  <Text size="sm">{item.patients.phone}</Text>
                </Stack>
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
                <Group>
                  <ColorSwatch
                    size={20}
                    component="button"
                    color={theme.colors.green[6]}
                    sx={{ color: '#fff', cursor: 'pointer' }}
                  >
                    <CheckIcon width={10} />
                  </ColorSwatch>
                  <Text>Aprobado</Text>
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
  );
}
