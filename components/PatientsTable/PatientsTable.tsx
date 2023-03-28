import { useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Box,
  createStyles,
  Group,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconEdit } from '@tabler/icons';
import { Patient } from '../../types/patient';
import { DateTime } from 'luxon';
import { useModals } from '@mantine/modals';
import PatientsEditModal from '../features/PatientsEditModal/PatientsEditModal';
import { useMediaQuery } from '@mantine/hooks';
import { useIsMobile } from '../../hooks/useIsMobile/useIsMobile';

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

interface TableProps {
  data: Patient[];
}

export function PatientsTable({ data }: TableProps) {
  const { classes, cx } = useStyles();
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Patient>();
  const modals = useModals();
  const isMobile = useIsMobile();

  const openEditPatientModal = (item: Patient) => {
    modals.openModal({
      modalId: 'patientsEditModal',
      centered: true,
      size: isMobile ? '100%' : '55%',
      title: 'Editar turno',
      children: <PatientsEditModal data={item} />,
    });
  };

  return (
    <ScrollArea sx={{ height: '100%' }} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table sx={{ minWidth: 800 }} verticalSpacing="xs">
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Nombre</th>
            <th>Telefono</th>
            <th>Email</th>
            <th>Creado el</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => {
              return (
                <tr key={`treat-row-${idx}`}>
                  <td>
                    <Group>
                      <Avatar radius="xl" />
                      <Box sx={{ flex: 1 }}>
                        <Text size="sm" weight={500}>
                          {`${row.lastName}, ${row.firstName}`}
                        </Text>
                        <Text color="dimmed" size="xs">
                          {row.email}
                        </Text>
                      </Box>
                    </Group>
                  </td>
                  <td>
                    <Text size="sm">{row.phone}</Text>
                  </td>
                  <td>
                    <Text size="sm">{row.email}</Text>
                  </td>
                  <td>
                    <Text size="sm">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString('es-AR', DateTime.DATETIME_MED)
                        : ''}
                    </Text>
                  </td>
                  <td>
                    <Group>
                      <Tooltip label="Editar paciente">
                        <ActionIcon>
                          <IconEdit size={18} onClick={() => openEditPatientModal(row)} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td>
                <Text size="md">Aun no se cargaron pacientes</Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </ScrollArea>
  );
}
