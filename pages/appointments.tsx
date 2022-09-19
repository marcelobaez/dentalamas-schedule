import { useState } from 'react';
import { Group, Text, Paper, Button, Grid, Loader, Select, LoadingOverlay } from '@mantine/core';
import Head from 'next/head';
import { supabaseServerClient, withPageAuth } from '@supabase/auth-helpers-nextjs';
import { IconCalendar, IconPlus } from '@tabler/icons';
import 'dayjs/locale/es';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import useAppointments from '../hooks/useAppointments/useAppointments';
import { AppointmentsResponse } from '../types/appointment';
import AppointmentsCreateModal from '../components/features/AppointmentsCreateModal/AppointmentsCreateModal';
import AppointmentsTable from '../components/features/AppointmentsTable/AppointmentsTable';
import { useModals, openContextModal } from '@mantine/modals';
import useTreatments from '../hooks/useTreatments/useTreatments';
import useSpecialists from '../hooks/useSpecialists/useSpecialists';
import { DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import 'dayjs/locale/es-mx';
import dayjs from 'dayjs';
import { useIsMobile } from '../hooks/useIsMobile/useIsMobile';

export default function Appointments() {
  const { data: treatmentsData, isLoading: isLoadingTreatments } = useTreatments();
  const { data: specialistsData, isLoading: isLoadingSpecialist } = useSpecialists();
  const modals = useModals();
  const isMobile = useIsMobile();

  const [seletedSp, setSelectedSp] = useState<string | null>('');
  const [seletedTr, setSelectedTr] = useState<string | null>('');

  const [dateRangeValue, setRangeValue] = useState<DateRangePickerValue>([
    dayjs().startOf('week').add(1, 'day').toDate(),
    dayjs().endOf('week').toDate(),
  ]);

  // Get appointments with filters
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    fromDate: dayjs(dateRangeValue[0]).format(),
    toDate: dayjs(dateRangeValue[1]).format(),
    specialist: seletedSp,
    treatment: seletedTr,
  });

  const openCreatePatientModal = () => {
    openContextModal({
      modal: 'patientsCreate',
      size: 460,
      title: 'Registrar paciente',
      innerProps: {},
    });
  };

  const openCreateAppointmentModal = () => {
    modals.openModal({
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
            <Group position="right">
              {specialistsData && treatmentsData && (
                <>
                  <DateRangePicker
                    sx={(th) => ({ minWidth: '350px' })}
                    icon={<IconCalendar size={16} />}
                    placeholder="Elija el rango de fechas"
                    value={dateRangeValue}
                    onChange={(value: DateRangePickerValue) => {
                      if (value[1]) setRangeValue(value);
                    }}
                    locale="es-mx"
                  />
                  <Select
                    value={seletedSp}
                    onChange={setSelectedSp}
                    data={[
                      {
                        label: 'Todos los especialistas',
                        value: '',
                      },
                      ...specialistsData.map((item) => ({
                        label: `${item.firstName} ${item.lastName}`,
                        value: String(item.id),
                      })),
                    ]}
                  />
                  <Select
                    value={seletedTr}
                    onChange={setSelectedTr}
                    data={[
                      {
                        label: 'Todos los tipos',
                        value: '',
                      },
                      ...treatmentsData.map((item) => ({
                        label: item.name,
                        value: String(item.id),
                      })),
                    ]}
                  />
                </>
              )}
              <Button leftIcon={<IconPlus />} onClick={() => openCreateAppointmentModal()}>
                Nuevo turno
              </Button>
            </Group>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper shadow="xs" p="xs" sx={{ height: 'calc(100vh - 152px)', position: 'relative' }}>
            {(isLoadingAppointments || isLoadingTreatments || isLoadingSpecialist) && (
              <LoadingOverlay visible />
            )}
            {!isLoadingAppointments && appointmentsData && (
              <AppointmentsTable data={appointmentsData} />
            )}
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
    // await queryClient.prefetchQuery(['appointments', '', '', '', ''], async () => {
    //   const { data, error, count } = await supabaseServerClient(ctx)
    //     .from<AppointmentsResponse>('appointments')
    //     .select(
    //       'id, startDate, endDate, patients ( id, firstName, lastName, phone, email), treatments ( id, name ), specialists ( id, firstName, lastName ), notes, attended, appointments_states ( id, name )',
    //       { count: 'exact' },
    //     )
    //     .order('startDate', { ascending: false });

    //   if (error) throw new Error(`${error.message}: ${error.details}`);

    //   return data;
    // });

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
