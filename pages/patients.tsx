import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  ColorSwatch,
  Grid,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Space,
  Table,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { IconPlus } from '@tabler/icons';
import PatientsCreateModal from '../components/features/PatientsCreateModal/PatientsCreateModal';
import usePatients from '../hooks/usePatients/usePatients';

export default function Patients() {
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();
  const { data: patients, isLoading, error } = usePatients();

  if (isLoading)
    return (
      <Group position="center">
        <Paper>
          <Loader size={'xl'} />
        </Paper>
      </Group>
    );

  return (
    <Grid>
      <Grid.Col span={12}>
        <Group position="apart">
          <Text weight={600} size={'xl'}>
            Pacientes
          </Text>
          <Button leftIcon={<IconPlus />} onClick={() => setOpened(true)}>
            Nuevo paciente
          </Button>
        </Group>
      </Grid.Col>
      <Grid.Col span={12}>
        <Paper shadow="xs" p="xs">
          <Space h="md" />
          <ScrollArea>
            <Table sx={{ minWidth: 800 }} verticalSpacing="xs">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Telefono</th>
                  <th>Ultimo turno</th>
                  <th>Asistio</th>
                  {/* <th>Motivo</th> */}
                </tr>
              </thead>
              <tbody>
                {patients && patients.length > 0 ? (
                  patients.map((row, idx) => (
                    <tr key={`treat-row-${idx}`}>
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
                        <Text size="sm">{`01/01/2022`}</Text>
                      </td>
                      <td>
                        <ColorSwatch color={theme.colors.green[6]} />
                      </td>
                    </tr>
                  ))
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
          <PatientsCreateModal opened={opened} handleModalState={setOpened} />
        </Paper>
      </Grid.Col>
    </Grid>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
});
