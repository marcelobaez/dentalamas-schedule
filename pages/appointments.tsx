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
import { IconPlus, IconSearch } from '@tabler/icons';
import 'dayjs/locale/es';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import useAppointments from '../hooks/useAppointments/useAppointments';
import { AppointmentsResponse } from '../types/appointment';
import AppointmentsCreateModal from '../components/features/AppointmentsCreateModal/AppointmentsCreateModal';
import AppointmentsTable from '../components/features/AppointmentsTable/AppointmentsTable';

export default function Appointments() {
  const [opened, setOpened] = useState(false);
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments();
  const [activePage, setPage] = useState(1);

  if (isLoadingAppointments)
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
        <title>Turnos</title>
        <meta name="description" content="Gestion de turnos" />
      </Head>
      <Grid>
        <Grid.Col span={12}>
          <Group position="apart">
            <Text weight={600} size={'xl'}>
              Turnos
            </Text>
            <Button leftIcon={<IconPlus />} onClick={() => setOpened(true)}>
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
            <AppointmentsCreateModal opened={opened} handleModalState={setOpened} />
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
          'startDate, endDate, patients ( firstName, lastName, phone, email), treatments ( name ), specialists ( firstName, lastName )',
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
