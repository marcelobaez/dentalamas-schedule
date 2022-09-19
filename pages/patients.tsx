import { Button, Grid, Group, LoadingOverlay, Paper, Text } from '@mantine/core';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { IconUserPlus } from '@tabler/icons';
import usePatients from '../hooks/usePatients/usePatients';
import Head from 'next/head';
import { openContextModal } from '@mantine/modals';
import { PatientsTable } from '../components/PatientsTable/PatientsTable';

export default function Patients() {
  const { data: patients, isLoading, error } = usePatients();

  const openCreateModal = () => {
    openContextModal({
      modal: 'patientsCreate',
      size: 460,
      title: 'Registrar paciente',
      centered: true,
      innerProps: {},
    });
  };

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
          <Paper shadow="xs" p="xs" sx={{ height: 'calc(100vh - 152px)', position: 'relative' }}>
            {isLoading && <LoadingOverlay visible />}
            {!isLoading && patients && <PatientsTable data={patients} />}
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
});
