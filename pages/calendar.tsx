import { createServerSupabaseClient, User } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';
import { dehydrate, QueryClient } from '@tanstack/react-query';
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
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, DatesSetArg, EventClickArg, EventContentArg } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { getAvatarFromFullName } from '../utils/getAvatarName';
import useTreatments from '../hooks/useTreatments/useTreatments';
import useSpecialists from '../hooks/useSpecialists/useSpecialists';
import { IconCalendar, IconForbid2, IconPlus } from '@tabler/icons';
import { openContextModal, useModals } from '@mantine/modals';
import AppointmentsCreateModal from '../components/features/AppointmentsCreateModal/AppointmentsCreateModal';
import { useState } from 'react';
import { DateRangePickerValue } from '@mantine/dates';
import dayjs from 'dayjs';
import {
  AppointmentState,
  mantineStateColors,
  stateColors,
} from '../components/features/AppointmentsTable/AppointmentsTable';
import { useIsMobile } from '../hooks/useIsMobile/useIsMobile';
import 'dayjs/locale/es-mx';
import { AppointmentsResponse } from '../types/appointment';

enum Specialist {
  Talamas = 1,
  Valiente,
}

interface ScheduleModalProps {
  dateRange: [Date, Date];
  onBlock: () => void;
  onSchedule: () => void;
}

interface EventDetailsProps {
  eventData: {
    patient: string;
    timeText: string;
    title: string;
    specialist: string;
    state: {
      id: number;
      name: string;
    };
  };
}

const ScheduleModal = ({ dateRange, onBlock, onSchedule }: ScheduleModalProps) => {
  const from = dayjs(dateRange[0]).format('HH:mm');
  const to = dayjs(dateRange[1]).format('HH:mm');
  return (
    <Stack>
      <Button leftIcon={<IconForbid2 />} color="red">
        {`Bloquear ${from} - ${to}`}
      </Button>
      <Button
        onClick={() => onSchedule()}
        leftIcon={<IconCalendar />}
      >{`Agendar ${from} - ${to}`}</Button>
    </Stack>
  );
};

const EventDetails = ({
  eventData: { timeText, title, patient, specialist, state },
}: EventDetailsProps) => {
  return (
    <Stack spacing={'xs'} p="sm">
      <Text size={'xs'}>{`${timeText} - ${title}`}</Text>
      <Group spacing={'xs'}>
        <Text size={'sm'} weight={500}>
          {patient}
        </Text>
      </Group>
      <Group spacing={'xs'}>
        <Avatar radius={'xl'} size={20}>
          {getAvatarFromFullName(specialist)}
        </Avatar>
        <Text size="sm">{specialist}</Text>
        <Badge color={state ? mantineStateColors[state.id as AppointmentState] : 'gray'}>
          {state ? state.name : 'N/D'}
        </Badge>
      </Group>
    </Stack>
  );
};

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
            <Badge color={state ? mantineStateColors[state.id as AppointmentState] : 'gray'}>
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

  const { data, isLoading } = useAppointments({
    fromDate: '',
    toDate: '',
    specialist: selectedSp,
    treatment: selectedTr,
  });

  const appointmentsData = data || [];
  const { data: treatmentsData, isLoading: isLoadingTreatments } = useTreatments();
  const { data: specialistsData, isLoading: isLoadingSpecialist } = useSpecialists();
  const modals = useModals();
  const isMobile = useIsMobile();

  const openCreatePatientModal = () => {
    openContextModal({
      modal: 'patientsCreate',
      size: 460,
      title: 'Registrar paciente',
      innerProps: {},
    });
  };

  const openCreateAppointmentModal = (dateRange?: [Date, Date]) => {
    modals.openModal({
      modalId: 'appointmentsCreateModal',
      centered: true,
      fullScreen: isMobile,
      size: '55%',
      title: 'Registrar turno',
      children: (
        <AppointmentsCreateModal
          onClose={() => modals.closeModal('appointmentsCreateModal')}
          onCreatePatient={() => openCreatePatientModal()}
          {...(dateRange ? { initialRange: [dateRange[0], dateRange[1]] } : null)}
        />
      ),
    });
  };

  const openScheduleModal = (range: DateSelectArg) => {
    const dateRange: [Date, Date] = [range.start, range.end];
    modals.openModal({
      modalId: 'scheduleModal',
      centered: true,
      size: 'sm',
      title: 'Nuevo evento',
      children: (
        <ScheduleModal
          dateRange={dateRange}
          onBlock={() => modals.closeModal('scheduleModal')}
          onSchedule={() => openCreateAppointmentModal(dateRange)}
        />
      ),
    });
  };

  const openEventModal = (eventArg: EventClickArg) => {
    const {
      event: {
        startStr,
        endStr,
        title,
        _def: {
          extendedProps: { patient, specialist, state },
        },
      },
    } = eventArg;
    modals.openModal({
      modalId: 'eventModal',
      centered: true,
      withCloseButton: false,
      size: 'sm',
      children: (
        <EventDetails
          eventData={{
            patient: patient,
            specialist: specialist,
            state: state,
            timeText: startStr,
            title: title,
          }}
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
                events={appointmentsData.map((item) => {
                  const appointment = item as AppointmentsResponse;
                  return {
                    id: String(item.id),
                    title: appointment.treatments.name,
                    start: new Date(appointment.startDate),
                    end: new Date(appointment.endDate),
                    color: appointment.appointments_states
                      ? stateColors[appointment.appointments_states.id as AppointmentState]
                      : 'blue',
                    state: appointment.appointments_states
                      ? {
                          id: appointment.appointments_states.id,
                          name: appointment.appointments_states.name,
                        }
                      : null,
                    specialist: `${appointment.specialists.firstName} ${appointment.specialists.lastName}`,
                    patient: `${appointment.patients.firstName} ${appointment.patients.lastName}`,
                  };
                })}
                select={(arg: DateSelectArg) => openScheduleModal(arg)}
                // datesSet={(arg: DatesSetArg) => {
                //   console.log(arg);
                // }}
                locale={esLocale}
                initialView={'timeGridWeek'}
                slotMinTime="07:00:00"
                slotMaxTime="23:00:00"
                eventClick={(arg: EventClickArg) => openEventModal(arg)}
                // eventContent={(event) => renderEventContent(event, theme, classes)}
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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };

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
    const { data, error } = await supabase.from('treatments').select('id, name');

    if (error) throw new Error(`${error.message}: ${error.details}`);

    return data;
  });

  await queryClient.prefetchQuery(['specialists'], async () => {
    // Get treatments list
    const { data, error } = await supabase
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
};
