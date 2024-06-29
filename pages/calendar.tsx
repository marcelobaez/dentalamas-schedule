import { GetServerSidePropsContext } from 'next';
import useAppointments from '../hooks/useAppointments/useAppointments';
import Head from 'next/head';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Drawer,
  Grid,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Text,
  Title,
  rem,
} from '@mantine/core';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, DatesSetArg, EventClickArg } from '@fullcalendar/core';
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
import { IconCalendar, IconInfoCircle, IconPlus, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import 'dayjs/locale/es-mx';
import { createClient } from '../utils/supabase/server-props';
import { useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import AppointmentsEditDrawer from '../components/features/AppointmentEditDrawer/AppointmentsEditDrawer';
import { EventBlocked } from '../components/calendar/EventBlocked';
import { EventInfo } from '../components/calendar/EventInfo';
import { BlockCreateModal } from '../components/features/BlockCreateModal/BlockCreateModal';
import { ScheduleModal } from '../components/features/CalendarScheduleModal/CalendarScheduleModal';
import useLocationBusinessHours from '../hooks/useLocationBlocks/useLocationBlocks';
import { BlockEditModal } from '../components/features/BlockEditModal/BlockEditModal';
import { AppointmentCreateDrawer } from '../components/features/AppointmentCreateDrawer/AppointmentCreateDrawer';
import { modals } from '@mantine/modals';
import { generateEventData } from '../utils/calendar';
import { AppointmentsResponse } from '../types/appointment';
dayjs.extend(utc);

export default function Calendar() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 50em)');
  const [selectedSp, setSelectedSp] = useState<string | null>('');
  const [selectedAppointment, setSelectedAp] = useState<AppointmentsResponse>();
  const [selectedTr, setSelectedTr] = useState<string | null>('');
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().subtract(1, 'day').utc().endOf('day').toISOString(),
    dayjs().utc().endOf('day').toISOString(),
  ]);

  const [modalDateRange, setModalDates] = useState<[Date, Date]>();

  const [createOpened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  const { data, status: apStatus } = useAppointments({
    fromDate: dateRange[0],
    toDate: dateRange[1],
    specialist: selectedSp,
    treatment: selectedTr,
  });

  const { data: businessHoursData, status: bhStatus } = useLocationBusinessHours('1');
  const { data: treatmentsData, status: trStatus } = useTreatments();
  const { data: specialistsData, status: spStatus } = useSpecialists();

  const totalEventsCount = data?.data?.length ?? 0;

  const openScheduleModal = (args: DateSelectArg) => {
    const dateRange: [Date, Date] = [args.start, args.end];
    setModalDates(dateRange);
    modals.open({
      modalId: 'scheduleModal',
      centered: true,
      size: 'sm',
      title: 'Nuevo evento',
      children: (
        <ScheduleModal
          specialistId={args.resource?._resource.id}
          dateRange={dateRange}
          onBlock={(id) => openBlockModal(dateRange, id)}
          onSchedule={() => {
            open();
            modals.closeAll();
          }}
        />
      ),
    });
  };

  const openBlockModal = (dateRange?: [Date, Date], spId?: string) => {
    modals.open({
      modalId: 'blockCreateModal',
      centered: true,
      size: 'sm',
      title: 'Nuevo bloqueo',
      children: (
        <BlockCreateModal
          {...(dateRange ? { initialRange: [dateRange[0], dateRange[1]] } : null)}
          specialistId={Number(spId)}
          onClose={() => modals.close('blockCreateModal')}
        />
      ),
    });
  };

  const handleViewSet = (dateInfo: DatesSetArg) => {
    setDateRange([dateInfo.startStr, dateInfo.endStr]);
  };

  if (
    apStatus === 'pending' ||
    spStatus === 'pending' ||
    trStatus === 'pending' ||
    bhStatus === 'pending'
  )
    return (
      <Box pos="relative" w="100%" h="calc(100dvh - 96px)">
        <LoadingOverlay
          visible
          zIndex={1000}
          loaderProps={{ size: 'lg' }}
          overlayProps={{ blur: 2 }}
        />
      </Box>
    );

  if (apStatus === 'error' || spStatus === 'error' || trStatus === 'error' || bhStatus === 'error')
    return (
      <Alert variant="light" color="red" title="Hubo un error!" icon={<IconInfoCircle />}>
        Intente nuevamente en un instante. Si el error persiste, contacte al soporte
      </Alert>
    );

  const filteredSpecialists = selectedSp
    ? specialistsData.data.filter((sp) => sp.id.toString() === selectedSp)
    : specialistsData.data;

  console.log(filteredSpecialists, data.data);

  const serverEvents = generateEventData(data.data, filteredSpecialists, dateRange, theme);

  return (
    <>
      <Head>
        <title>Calendario</title>
        <meta name="description" content="Calendario de turnos" />
      </Head>
      <Stack>
        <Title order={2}>Calendario</Title>
        <Group justify="space-between" align={'center'}>
          <Group align="center" gap="xs">
            <Avatar color="violet" radius="md">
              <IconCalendar width="1.3rem" height="1.3rem" />
            </Avatar>
            <Text fz="1.2rem" fw={600}>
              {totalEventsCount}
            </Text>
            <Text fz="0.875rem" c="dimmed">
              Turnos
            </Text>
          </Group>
          <Group>
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
                ...treatmentsData.data.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                })),
              ]}
              w={{ base: '100%', sm: 'auto' }}
            />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => open()}
              w={{ base: '100%', sm: 'auto' }}
            >
              Nuevo turno
            </Button>
          </Group>
        </Group>
        <Paper
          shadow="xs"
          p="md"
          mih={400}
          h={{ base: 'calc(100dvh - 250px)', sm: 'calc(100dvh - 200px)' }}
        >
          <FullCalendar
            datesSet={(args: DatesSetArg) => handleViewSet(args)}
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
                type: 'resourceTimeGrid',
                duration: { days: 1 },
                buttonText: 'Profesionales',
              },
              monthView: {
                type: 'dayGridMonth',
                showNonCurrentDates: false,
                buttonText: 'Mes',
              },
            }}
            resources={specialistsData.data.map((sp) => ({
              id: String(sp.id),
              title: `${sp.firstName} ${sp.lastName}`,
              businessHours: sp.specialist_working_days.map((day) => ({
                daysOfWeek: [day.day_of_week],
                startTime: day.start_time,
                endTime: day.end_time,
              })),
            }))}
            businessHours={businessHoursData.data.map((bh) => ({
              daysOfWeek: [bh.day_of_week],
              startTime: bh.start_time,
              endTime: bh.end_time,
            }))}
            selectConstraint="businessHours"
            selectable
            events={serverEvents}
            select={(arg: DateSelectArg) => {
              openScheduleModal(arg);
            }}
            locale={esLocale}
            initialView={'resourceTimeLineStaff'}
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
              if (arg.event._def.extendedProps.type === 'Appointment') {
                setSelectedAp(arg.event.extendedProps.appointmentDetails);
                openEdit();
              } else if (arg.event._def.extendedProps.type === 'Block') {
                modals.open({
                  modalId: 'blockEditModal',
                  centered: true,
                  size: 'sm',
                  title: `Editar bloqueo: ${arg.event._def.extendedProps.data.title}`,
                  children: <BlockEditModal data={arg.event._def.extendedProps.data} />,
                });
              } else return;
            }}
            resourceAreaHeaderContent="Profesionales"
            resourceLabelContent={(arg) => (
              <Group gap="xs" wrap="nowrap">
                <Avatar radius="xl" size="sm" color="violet">
                  <IconUser size="1.2rem" />
                </Avatar>
                <Stack gap={0} justify="start">
                  <Text fz="xs" fw={500} style={{ textAlign: 'left' }}>
                    {arg.resource.title}
                  </Text>
                  <Text c="dimmed" fz="xs" style={{ textAlign: 'left' }}>
                    {`Pacientes hoy: ${
                      arg.resource
                        .getEvents()
                        .filter(
                          (ev) =>
                            ev.extendedProps.type !== 'Block' && ev.extendedProps.type !== 'Break',
                        ).length
                    }`}
                  </Text>
                </Stack>
              </Group>
            )}
            headerToolbar={{
              left: 'today prev next',
              center: 'title',
              right: 'timeGridDay timeGridWeek dayGridMonth resourceTimeLineStaff',
            }}
            eventContent={(eventInfo) => {
              return eventInfo.event.extendedProps.type === 'Block' ||
                eventInfo.event.extendedProps.type === 'Break' ? (
                <EventBlocked title={eventInfo.event.title} />
              ) : (
                <EventInfo eventInfo={eventInfo} />
              );
            }}
          />
        </Paper>
      </Stack>
      <Drawer
        opened={createOpened}
        onClose={close}
        position="right"
        offset={isMobile ? 0 : 8}
        radius="md"
        size={rem(500)}
        title="Nuevo turno"
      >
        <AppointmentCreateDrawer onClose={close} initialRange={modalDateRange} />
      </Drawer>
      <Drawer
        opened={editOpened}
        onClose={closeEdit}
        position="right"
        offset={isMobile ? 0 : 8}
        radius="md"
        size={rem(500)}
        withCloseButton={false}
      >
        {selectedAppointment && (
          <AppointmentsEditDrawer data={selectedAppointment} onClose={closeEdit} />
        )}
      </Drawer>
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
