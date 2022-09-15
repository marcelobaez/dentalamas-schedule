import { supabaseServerClient, withPageAuth } from '@supabase/auth-helpers-nextjs';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { AppointmentsResponse } from '../types/appointment';
import useAppointments from '../hooks/useAppointments/useAppointments';
import Head from 'next/head';
import {
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  createStyles,
  Grid,
  Group,
  LoadingOverlay,
  MantineTheme,
  Menu,
  Paper,
  ScrollArea,
  Select,
  Skeleton,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import FullCalendar, { DateSelectArg, DatesSetArg, EventContentArg } from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { getAvatarFromFullName } from '../utils/getAvatarName';
import useTreatments from '../hooks/useTreatments/useTreatments';
import useSpecialists from '../hooks/useSpecialists/useSpecialists';
import { IconCalendar, IconPlus } from '@tabler/icons';
import { openContextModal, useModals } from '@mantine/modals';
import { useMediaQuery } from '@mantine/hooks';
import AppointmentsCreateModal from '../components/features/AppointmentsCreateModal/AppointmentsCreateModal';
import { useState } from 'react';
import { DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import 'dayjs/locale/es-mx';
import dayjs from 'dayjs';
import { appointmentsQuerySelect } from '../utils/constants';
import {
  AppointmentState,
  stateColors,
} from '../components/features/AppointmentsTable/AppointmentsTable';

enum Specialist {
  Talamas = 1,
  Valiente,
}

const specialistColors = {
  [Specialist.Talamas]: '#868E96',
  [Specialist.Valiente]: '#748FFC',
};

const useStyles = createStyles((theme) => ({
  dropdown: {
    // backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.blue[6],
    backgroundColor: theme.colors.dark[4],
    borderColor: theme.colors.dark[4],
    color: theme.white,
  },
}));

const renderEventContent = (
  eventContent: EventContentArg,
  theme: MantineTheme,
  classes: Record<'dropdown', string>,
) => {
  const {
    timeText,
    event: {
      title,
      _def: {
        extendedProps: { specialist, state, patient },
      },
    },
  } = eventContent;

  return (
    <Menu offset={1} withArrow withinPortal position="top" classNames={classes}>
      <Menu.Target>
        <Stack spacing={'xs'}>
          <Text size={'xs'}>{timeText}</Text>
          <Text size={'xs'} weight={500}>
            {title}
          </Text>
        </Stack>
      </Menu.Target>
      <Menu.Dropdown>
        <Stack spacing={'xs'} p="sm">
          <Text size={'xs'}>{`${timeText} - ${title}`}</Text>
          <Group spacing={'xs'}>
            <Text size={'sm'} weight={500}>
              {patient}
            </Text>
          </Group>
          <Group spacing={'xs'}>
            <Avatar radius={'xl'} size={20} color={theme.colors.dark[4]}>
              {getAvatarFromFullName(specialist)}
            </Avatar>
            <Text size="sm">{specialist}</Text>
            <Badge color={state ? stateColors[state.id as AppointmentState] : 'gray'}>
              {state ? state.name : 'N/D'}
            </Badge>
          </Group>
        </Stack>
      </Menu.Dropdown>
    </Menu>
  );
};

export default function Calendar() {
  const theme = useMantineTheme();

  const [selectedSp, setSelectedSp] = useState<string | null>('');
  const [selectedTr, setSelectedTr] = useState<string | null>('');

  const [dateRangeValue, setRangeValue] = useState<DateRangePickerValue>([
    dayjs().startOf('week').add(1, 'day').toDate(),
    dayjs().endOf('week').toDate(),
  ]);

  const { data, isLoading } = useAppointments({
    fromDate: '',
    toDate: '',
    specialist: selectedSp,
    treatments: selectedTr,
  });

  const appointmentsData = data || [];
  const { data: treatmentsData, isLoading: isLoadingTreatments } = useTreatments();
  const { data: specialistsData, isLoading: isLoadingSpecialist } = useSpecialists();
  const modals = useModals();
  const isMobile = useMediaQuery('(max-width: 600px)', true, { getInitialValueInEffect: false });
  const { classes } = useStyles();

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
        <title>Calendario</title>
        <meta name="description" content="Calendario de turnos" />
      </Head>
      <Grid>
        <Grid.Col span={12}>
          <Group position="apart" align={'center'}>
            <Title order={2}>Calendario</Title>
            <Group position="apart">
              {specialistsData && treatmentsData && (
                <>
                  <Select
                    value={selectedSp}
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
                    value={selectedTr}
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
              <Button
                leftIcon={<IconPlus size={16} />}
                onClick={() => openCreateAppointmentModal()}
              >
                Nuevo turno
              </Button>
            </Group>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" sx={{ height: 'calc(100vh - 170px)', position: 'relative' }}>
            {isLoading && <LoadingOverlay visible />}
            <ScrollArea sx={{ height: '100%' }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                editable
                selectable
                events={appointmentsData.map((item) => ({
                  id: String(item.id),
                  title: item.treatments.name,
                  start: new Date(item.startDate),
                  end: new Date(item.endDate),
                  color: specialistColors[item.specialists.id as Specialist],
                  state: item.appointments_states
                    ? {
                        id: item.appointments_states.id,
                        name: item.appointments_states.name,
                      }
                    : null,
                  specialist: `${item.specialists.firstName} ${item.specialists.lastName}`,
                  patient: `${item.patients.firstName} ${item.patients.lastName}`,
                }))}
                // select={(arg: DateSelectArg) => console.log(arg)}
                // datesSet={(arg: DatesSetArg) => {
                //   console.log(arg);
                //   setRangeValue([arg.start, arg.end]);
                // }}
                locale={esLocale}
                initialView={'timeGridWeek'}
                slotMinTime="07:00:00"
                slotMaxTime="23:00:00"
                eventContent={(event) => renderEventContent(event, theme, classes)}
                headerToolbar={{
                  left: 'prev today next',
                  center: 'title',
                  right: 'dayGridMonth timeGridWeek timeGridDay',
                }}
              />
            </ScrollArea>
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
  async getServerSideProps(ctx) {
    const queryClient = new QueryClient();

    // Get appointments
    // await queryClient.prefetchQuery(['appointments', '', '', '', ''], async () => {
    //   const { data, error, count } = await supabaseServerClient(ctx)
    //     .from<AppointmentsResponse>('appointments')
    //     .select(appointmentsQuerySelect, { count: 'exact' });

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
