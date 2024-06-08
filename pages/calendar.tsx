import { GetServerSidePropsContext } from 'next';
import useAppointments from '../hooks/useAppointments/useAppointments';
import Head from 'next/head';
import {
  Avatar,
  Badge,
  Button,
  Grid,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { getAvatarFromFullName } from '../utils/getAvatarName';
import useTreatments from '../hooks/useTreatments/useTreatments';
import useSpecialists from '../hooks/useSpecialists/useSpecialists';
import { IconCalendar, IconForbid2, IconPlus } from '@tabler/icons-react';
import { openContextModal, useModals } from '@mantine/modals';
import AppointmentsCreateModal from '../components/features/AppointmentsCreateModal/AppointmentsCreateModal';
import { useState } from 'react';
import dayjs from 'dayjs';
import {
  AppointmentState,
  mantineStateColors,
  stateColors,
} from '../components/features/AppointmentsTable/AppointmentsTable.utils';
import { useIsMobile } from '../hooks/useIsMobile/useIsMobile';
import 'dayjs/locale/es-mx';
import { AppointmentsResponse } from '../types/appointment';
import { createClient } from '../utils/supabase/server-props';

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
      <Button leftSection={<IconForbid2 />} color="red">
        {`Bloquear ${from} - ${to}`}
      </Button>
      <Button
        onClick={() => onSchedule()}
        leftSection={<IconCalendar />}
      >{`Agendar ${from} - ${to}`}</Button>
    </Stack>
  );
};

const EventDetails = ({
  eventData: { timeText, title, patient, specialist, state },
}: EventDetailsProps) => {
  return (
    <Stack gap={'xs'} p="sm">
      <Text size={'xs'}>{`${dayjs(timeText).format('DD/MM/YYYY HH:mm')} - ${title}`}</Text>
      <Group gap={'xs'}>
        <Text size={'sm'} fw={500}>
          {patient}
        </Text>
      </Group>
      <Group gap={'xs'}>
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

export default function Calendar() {
  const [selectedSp, setSelectedSp] = useState<string | null>('');
  const [selectedTr, setSelectedTr] = useState<string | null>('');

  const { data, isLoading } = useAppointments({
    fromDate: '',
    toDate: '',
    specialist: selectedSp,
    treatment: selectedTr,
  });

  const { data: treatmentsData } = useTreatments();
  const { data: specialistsData } = useSpecialists();
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
          <Group justify="space-between" align={'center'}>
            <Title order={2}>Calendario</Title>
            <Group justify="space-between">
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
                      ...specialistsData.data.map((item) => ({
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
                leftSection={<IconPlus size={16} />}
                onClick={() => openCreateAppointmentModal()}
              >
                Nuevo turno
              </Button>
            </Group>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md">
            {isLoading && <LoadingOverlay visible />}
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              editable
              selectable
              events={
                data
                  ? data.data?.map((item) => {
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
                    })
                  : []
              }
              select={(arg: DateSelectArg) => openScheduleModal(arg)}
              locale={esLocale}
              initialView={'timeGridWeek'}
              slotMinTime="07:00:00"
              slotMaxTime="23:00:00"
              eventClick={(arg: EventClickArg) => openEventModal(arg)}
              headerToolbar={{
                left: 'prev today next',
                center: 'title',
                right: 'dayGridMonth timeGridWeek timeGridDay',
              }}
            />
          </Paper>
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
