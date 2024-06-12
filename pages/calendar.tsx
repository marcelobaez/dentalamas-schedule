import { GetServerSidePropsContext } from 'next';
import useAppointments from '../hooks/useAppointments/useAppointments';
import Head from 'next/head';
import {
  Box,
  Button,
  Grid,
  Group,
  LoadingOverlay,
  Paper,
  Pill,
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
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import scrollgridPlugin from '@fullcalendar/scrollgrid';
import esLocale from '@fullcalendar/core/locales/es';
import useTreatments from '../hooks/useTreatments/useTreatments';
import useSpecialists from '../hooks/useSpecialists/useSpecialists';
import { IconCalendar, IconForbid2, IconPlus } from '@tabler/icons-react';
import { openContextModal, useModals } from '@mantine/modals';
import AppointmentsCreateModal from '../components/features/AppointmentsCreateModal/AppointmentsCreateModal';
import { useState } from 'react';
import dayjs from 'dayjs';
import {
  AppointmentState,
  stateColors,
} from '../components/features/AppointmentsTable/AppointmentsTable.utils';
import 'dayjs/locale/es-mx';
import { AppointmentsResponse } from '../types/appointment';
import { createClient } from '../utils/supabase/server-props';
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import AppointmentsEditModal from '../components/features/AppointmentsEditModal/AppointmentsEditModal';

interface ScheduleModalProps {
  dateRange: [Date, Date];
  onBlock: () => void;
  onSchedule: () => void;
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

  const { data: treatmentsData } = useTreatments();
  const { data: specialistsData } = useSpecialists();
  const modals = useModals();
  const isMobile = useMediaQuery('(max-width: 50em)');

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
                    w={{ base: '100%', sm: 'auto' }}
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
                    w={{ base: '100%', sm: 'auto' }}
                  />
                </>
              )}
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => openCreateAppointmentModal()}
                w={{ base: '100%', sm: 'auto' }}
              >
                Nuevo turno
              </Button>
            </Group>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper
            shadow="xs"
            p="md"
            mih={400}
            h={{ base: 'calc(100dvh - 250px)', sm: 'calc(100dvh - 140px)' }}
          >
            {isLoading && <LoadingOverlay visible />}
            <FullCalendar
              height="100%"
              schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
                resourceTimeGridPlugin,
                resourceTimelinePlugin,
                scrollgridPlugin,
              ]}
              views={{
                resourceTimeLineStaff: {
                  type: 'resourceTimeline',
                  duration: { days: 1 },
                  buttonText: 'Por profesional',
                },
              }}
              resources={
                specialistsData
                  ? specialistsData.data.map((sp) => ({
                      id: String(sp.id),
                      title: `${sp.firstName} ${sp.lastName}`,
                    }))
                  : []
              }
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
                          ? theme.colors[
                              stateColors[appointment.appointments_states.id as AppointmentState]
                            ][2]
                          : 'blue',
                        boldColor: appointment.appointments_states
                          ? theme.colors[
                              stateColors[appointment.appointments_states.id as AppointmentState]
                            ][8]
                          : 'blue',
                        midColor: appointment.appointments_states
                          ? theme.colors[
                              stateColors[appointment.appointments_states.id as AppointmentState]
                            ][4]
                          : 'blue',
                        state: appointment.appointments_states
                          ? {
                              id: appointment.appointments_states.id,
                              name: appointment.appointments_states.name,
                            }
                          : null,
                        specialistName: `${appointment.specialists.firstName} ${appointment.specialists.lastName}`,
                        patientName: `${appointment.patients.firstName} ${appointment.patients.lastName}`,
                        resourceId: String(appointment.specialists.id),
                        appointmentDetails: appointment,
                      };
                    })
                  : []
              }
              select={(arg: DateSelectArg) => openScheduleModal(arg)}
              locale={esLocale}
              initialView={'timeGridWeek'}
              slotMinTime="07:00:00"
              slotMaxTime="23:00:00"
              allDaySlot={false}
              slotLabelInterval="00:30:00"
              eventMinHeight={70}
              dayMinWidth={160}
              nowIndicator
              expandRows
              slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: false,
                meridiem: 'short',
                hour12: false,
              }}
              eventClick={(arg: EventClickArg) => {
                modals.openModal({
                  modalId: 'appointmentsEditModal',
                  centered: true,
                  size: isMobile ? '100%' : '55%',
                  title: 'Editar turno',
                  children: (
                    <AppointmentsEditModal data={arg.event.extendedProps.appointmentDetails} />
                  ),
                });
              }}
              resourceAreaHeaderContent="Profesionales"
              headerToolbar={{
                left: 'today prev next',
                center: 'title',
                right: 'timeGridDay timeGridWeek dayGridMonth resourceTimeLineStaff',
              }}
              eventContent={(eventInfo) => {
                return (
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      borderInlineStart: `3px solid ${eventInfo.event.extendedProps.boldColor}`,
                      borderStartEndRadius: '0.25rem',
                      borderEndEndRadius: '0.25rem',
                      height: '100%',
                      paddingLeft: '3px',
                    }}
                  >
                    <Box w={140}>
                      <Text
                        title={eventInfo.event.extendedProps.patientName}
                        c={theme.colors.dark[7]}
                        fw="bold"
                        fz="0.75rem"
                        truncate="end"
                      >
                        {eventInfo.event.extendedProps.patientName}
                      </Text>
                    </Box>
                    <span
                      style={{
                        color: theme.colors.dark[7],
                        fontSize: '0.75rem',
                      }}
                    >
                      {`${dayjs(eventInfo.event.startStr).format('HH:mm')} > ${dayjs(
                        eventInfo.event.endStr,
                      ).format('HH:mm')}`}
                    </span>
                    <br></br>
                    <Pill size="sm" bg={eventInfo.event.extendedProps.midColor}>
                      {eventInfo.event.title}
                    </Pill>
                  </div>
                );
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
