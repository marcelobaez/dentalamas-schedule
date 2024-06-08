import { Button, Grid, Group, Text, Title } from '@mantine/core';
import Head from 'next/head';
import { openContextModal } from '@mantine/modals';
import { PatientsTable } from '../components/features/PatientsTable/PatientsTable';
import { GetServerSidePropsContext } from 'next';
import { IconUserPlus } from '@tabler/icons-react';
import { createClient } from '../utils/supabase/server-props';

export default function Patients() {
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
          <Group justify="space-between">
            <Title order={3}>Pacientes</Title>
            <Button leftSection={<IconUserPlus size={16} />} onClick={() => openCreateModal()}>
              Nuevo paciente
            </Button>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <PatientsTable />
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
