import { useState } from 'react';
import {
  Group,
  Text,
  ScrollArea,
  Paper,
  Button,
  Space,
  Grid,
  Loader,
  Pagination,
  TextInput,
} from '@mantine/core';
import Head from 'next/head';
import { supabaseServerClient, withPageAuth } from '@supabase/auth-helpers-nextjs';
import { IconPlus } from '@tabler/icons';
import 'dayjs/locale/es';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import useAppointments from '../hooks/useAppointments/useAppointments';
import { AppointmentsResponse } from '../types/appointment';
import AppointmentsCreateModal from '../components/features/AppointmentsCreateModal/AppointmentsCreateModal';
import AppointmentsTable from '../components/features/AppointmentsTable/AppointmentsTable';
import { useMediaQuery } from '@mantine/hooks';
import { useModals, openContextModal } from '@mantine/modals';

export default function Appointments() {
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments();
  const [activePage, setPage] = useState(1);
  const modals = useModals();
  const isMobile = useMediaQuery('(max-width: 600px)', true, { getInitialValueInEffect: false });

  if (isLoadingAppointments)
    return (
      <Group position="center">
        <Paper>
          <Loader size={'xl'} />
        </Paper>
      </Group>
    );

  const openCreatePatientModal = () => {
    openContextModal({
      modal: 'patientsCreate',
      size: 460,
      title: 'Registrar paciente',
      innerProps: {},
    });
  };

  const openCreateAppointmentModal = () => {
    const id = modals.openModal({
      modalId: 'appointmentsCreateModal',
      centered: true,
      size: isMobile ? '100%' : '55%',
      title: 'Registrar turno',
      children: (
        <AppointmentsCreateModal
          onClose={() => {
            modals.closeModal('appointmentsCreateModal');
          }}
          onCreatePatient={() => openCreatePatientModal()}
        />
      ),
    });
  };

  return (
    <>
      <Head>
        <title>Turnos</title>
        <meta name="description" content="Gestion de turnos" />
      </Head>
      <Grid>
        <Grid.Col span={12}>
          <Group position="apart">
            <Text weight={600} size={'xl'}>
              Turnos
            </Text>
            <Button leftIcon={<IconPlus />} onClick={() => openCreateAppointmentModal()}>
              Nuevo turno
            </Button>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper shadow="xs" p="xs">
            <ScrollArea>
              {/* <TextInput
        placeholder="Buscar por cualquier campo"
        mb="md"
        icon={<IconSearch size={14} stroke={1.5} />}
      /> */}
              {appointmentsData && <AppointmentsTable data={appointmentsData} />}
            </ScrollArea>
            <Space h="md" />
            {/* <Pagination page={activePage} onChange={setPage} total={5} /> */}
            {/* <AppointmentsCreateModal opened={opened} onClose={() => close()} /> */}
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
  async getServerSideProps(ctx) {
    // Get appointments
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(['appointments'], async () => {
      const { data, error, count } = await supabaseServerClient(ctx)
        .from<AppointmentsResponse>('appointments')
        .select(
          'id, startDate, endDate, patients ( id, firstName, lastName, phone, email), treatments ( id, name ), specialists ( id, firstName, lastName ), notes, attended, appointments_states ( id, name )',
          { count: 'exact' },
        )
        .order('startDate', { ascending: false });

      if (error) throw new Error(`${error.message}: ${error.details}`);

      return data;
    });

    await queryClient.prefetchQuery(['treatments'], async () => {
      // Get treatments list
      const { data, error } = await supabaseServerClient(ctx).from('treatments').select('id, name');

      if (error) throw new Error(`${error.message}: ${error.details}`);

      return data;
    });

    await queryClient.prefetchQuery(['specialists'], async () => {
      // Get treatments list
      const { data, error } = await supabaseServerClient(ctx)
        .from('specialists')
        .select('id, firstName, lastName, title');

      if (error) throw new Error(`${error.message}: ${error.details}`);

      return data;
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  },
});
