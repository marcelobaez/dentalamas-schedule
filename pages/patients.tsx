import { useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  createStyles,
  Grid,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { IconEdit, IconUserPlus } from '@tabler/icons';
import usePatients from '../hooks/usePatients/usePatients';
import Head from 'next/head';
import PatientsEditModal from '../components/features/PatientsEditModal/PatientsEditModal';
import { Patient } from '../types/patient';
import { openContextModal } from '@mantine/modals';
import { DateTime } from 'luxon';

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

export default function Patients() {
  // const { classes, cx } = useStyles();
  const [editModalOpened, setEditModalOpened] = useState(false);
  const { data: patients, isLoading, error } = usePatients();
  const [selection, setSelection] = useState(['']);
  const [selectedItem, setSelectedItem] = useState<Patient>();

  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  const toggleAll = () =>
    setSelection((current) =>
      current.length === patients!.length ? [] : patients!.map((item) => `${item.id}`),
    );

  const openCreateModal = () => {
    openContextModal({
      modal: 'patientsCreate',
      size: 460,
      title: 'Registrar paciente',
      innerProps: {},
    });
  };

  if (isLoading)
    return (
      <Group position="center">
        <Paper>
          <Loader size={'xl'} />
        </Paper>
      </Group>
    );

  return (
    <>
      <Head>
        <title>Pacientes</title>
        <meta name="description" content="Gestion de pacientes" />
      </Head>
      <Grid>
        <Grid.Col span={12}>
          <Group position="apart">
            <Text weight={600} size={'xl'}>
              Pacientes
            </Text>
            <Button leftIcon={<IconUserPlus size={16} />} onClick={() => openCreateModal()}>
              Nuevo paciente
            </Button>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper shadow="xs" p="xs">
            <ScrollArea>
              <Table sx={{ minWidth: 800 }} verticalSpacing="xs">
                <thead>
                  <tr>
                    {/* <th style={{ width: 40 }}>
                      <Checkbox
                        onChange={toggleAll}
                        checked={selection.length === patients!.length}
                        indeterminate={
                          selection.length > 0 && selection.length !== patients!.length
                        }
                        transitionDuration={0}
                      />
                    </th> */}
                    <th>Nombre</th>
                    <th>Telefono</th>
                    <th>Email</th>
                    <th>Creado el</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {patients && patients.length > 0 ? (
                    patients.map((row, idx) => {
                      const selected = selection.includes(`${row.id}`);
                      return (
                        <tr
                          key={`treat-row-${idx}`}
                          // className={cx({ [classes.rowSelected]: selected })}
                        >
                          {/* <td>
                            <Checkbox
                              checked={selection.includes(`${row.id}`)}
                              onChange={() => toggleRow(`${row.id}`)}
                              transitionDuration={0}
                            />
                          </td> */}
                          <td>
                            <Group>
                              <Avatar radius="xl" />
                              <Box sx={{ flex: 1 }}>
                                <Text size="sm" weight={500}>
                                  {`${row.firstName} ${row.lastName}`}
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
                              {new Date(row.created_at).toLocaleString(
                                'es-AR',
                                DateTime.DATETIME_MED,
                              )}
                            </Text>
                          </td>
                          <td>
                            <Group>
                              <Tooltip label="Editar paciente">
                                <ActionIcon>
                                  <IconEdit
                                    size={18}
                                    onClick={() => {
                                      setSelectedItem(row);
                                      setEditModalOpened(true);
                                    }}
                                  />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </td>
                          {/* <td>
                          <ColorSwatch color={theme.colors.green[6]} />
                        </td> */}
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
            {selectedItem && (
              <PatientsEditModal
                opened={editModalOpened}
                handleModalState={setEditModalOpened}
                data={selectedItem}
              />
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
});
