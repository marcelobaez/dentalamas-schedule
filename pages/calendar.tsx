import { forwardRef, useEffect, useMemo, useState } from 'react';
import {
  Calendar as BigCalendar,
  luxonLocalizer,
  View,
  ToolbarProps,
  NavigateAction,
} from 'react-big-calendar';
import { DateTime, Settings } from 'luxon';
import { supabaseServerClient, withPageAuth } from '@supabase/auth-helpers-nextjs';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { AppointmentsResponse } from '../types/appointment';
import useAppointments from '../hooks/useAppointments/useAppointments';
import Head from 'next/head';
import { Box, Center, Grid, Group, SegmentedControl, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { Tooltip } from '@mantine/core';

// forwardRef function will allow to get root element ref
const MyBadge = forwardRef<HTMLDivElement, { color: string }>(({ color }, ref) => (
  <div ref={ref} color={color}>
    Badge
  </div>
));

const defaultTZ = DateTime.local().zoneName;

const dateFormatOptions = { month: 'long', day: 'numeric' };
const LOCALE = 'es-AR';

const spMessages = {
  es: {
    week: 'Semana',
    work_week: 'Semana de trabajo',
    day: 'Día',
    month: 'Mes',
    previous: 'Atrás',
    next: 'Después',
    today: 'Hoy',
    agenda: 'Agenda',

    showMore: (total: number) => `+${total} más`,
  },
};

const EventComponent = (event: any) => {
  return (
    // <Center>
    <Text size="sm" weight={500}>
      {event.title}
    </Text>
    // </Center>
  );
};

export default function Calendar() {
  const [timezone, setTimezone] = useState(defaultTZ);
  const { data, isLoading } = useAppointments();
  const appointmentsData = data || [];
  const [defaultView, setDefaultView] = useState<View>('week');

  const { defaultDate, getNow, localizer, myEvents, scrollToTime, formats } = useMemo(() => {
    Settings.defaultZone = timezone;
    return {
      defaultDate: DateTime.local().toJSDate(),
      getNow: () => DateTime.local().toJSDate(),
      localizer: luxonLocalizer(DateTime),
      myEvents: appointmentsData.map((item) => ({
        title: `${item.treatments.name}`,
        start: new Date(item.startDate),
        end: new Date(item.endDate),
        aproved: true,
        treatment: item.treatments.name,
        specialist: `${item.specialists.firstName} ${item.specialists.lastName}`,
      })),
      scrollToTime: new Date(),
      formats: {
        dayHeaderFormat: (date: Date, localizer: any) =>
          date.toLocaleString(LOCALE, { month: 'long', day: 'numeric' }),
        dayRangeHeaderFormat: (range: any, localizer: any) =>
          `${range.start.toLocaleString(LOCALE, {
            month: 'long',
            day: 'numeric',
          })} - ${range.end.toLocaleString(LOCALE, { month: 'long', day: 'numeric' })}`,
      },
    };
  }, [timezone]);

  useEffect(() => {
    return () => {
      Settings.defaultZone = defaultTZ; // reset to browser TZ on unmount
    };
  }, []);

  const CustomToolbar = (props: ToolbarProps) => {
    return (
      <Group position="apart">
        <SegmentedControl
          onChange={(value: NavigateAction) => props.onNavigate(value)}
          data={[
            { label: 'Hoy', value: 'TODAY' },
            { label: 'Anterior', value: 'PREV' },
            { label: 'Siguiente', value: 'NEXT' },
          ]}
        />
        <Text>{props.label}</Text>
        <SegmentedControl
          onChange={(value: View) => setDefaultView(value)}
          value={defaultView}
          data={[
            // { label: 'Mes', value: 'month' },
            { label: 'Semana', value: 'week' },
            { label: 'Dia', value: 'day' },
            { label: 'Agenda', value: 'agenda' },
          ]}
        />
      </Group>
    );
  };

  return (
    <>
      <Head>
        <title>Calendario</title>
        <meta name="description" content="Calendario de turnos" />
      </Head>
      <Grid>
        <Grid.Col span={12}>
          <BigCalendar
            defaultDate={defaultDate}
            view={defaultView}
            events={myEvents}
            getNow={getNow}
            localizer={localizer}
            culture={'es'}
            messages={spMessages.es}
            formats={formats}
            min={new Date(1972, 0, 1, 7, 0, 0, 0)}
            max={new Date(2050, 0, 1, 22, 0, 0, 0)}
            components={{
              event: EventComponent,
              toolbar: CustomToolbar,
            }}
          />
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
        );

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
