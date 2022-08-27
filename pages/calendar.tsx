import { useEffect, useMemo, useState } from 'react';
import { Calendar as BigCalendar, luxonLocalizer, Views } from 'react-big-calendar';
import { DateTime, Settings } from 'luxon';
import { User } from '@supabase/auth-helpers-react';
import { getUser, supabaseServerClient, withPageAuth } from '@supabase/auth-helpers-nextjs';
import dayjs from 'dayjs';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { AppointmentsResponse } from '../types/appointment';
import useAppointments from '../hooks/useAppointments/useAppointments';

const defaultTZ = DateTime.local().zoneName;

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

export default function Calendar() {
  const [timezone, setTimezone] = useState(defaultTZ);
  const { data, isLoading } = useAppointments();
  const appointmentsData = data || [];

  const { defaultDate, getNow, localizer, myEvents, scrollToTime } = useMemo(() => {
    Settings.defaultZone = timezone;
    return {
      defaultDate: DateTime.local().toJSDate(),
      getNow: () => DateTime.local().toJSDate(),
      localizer: luxonLocalizer(DateTime),
      myEvents: appointmentsData.map((item) => ({
        title: `${item.patients.firstName} ${item.patients.lastName}: ${item.treatments.name}`,
        start: new Date(item.startDate),
        end: new Date(item.endDate),
      })),
      scrollToTime: DateTime.local().toJSDate(),
    };
  }, [timezone]);

  useEffect(() => {
    return () => {
      Settings.defaultZone = defaultTZ; // reset to browser TZ on unmount
    };
  }, []);

  return (
    <>
      <div style={{ height: '600px' }}>
        <BigCalendar
          defaultDate={defaultDate}
          defaultView={Views.WEEK}
          events={myEvents}
          getNow={getNow}
          localizer={localizer}
          scrollToTime={scrollToTime}
          culture={'es'}
          messages={spMessages.es}
        />
      </div>
    </>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
  async getServerSideProps(ctx) {
    // Get appointments
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(['appointments'], async () => {
      const { data, error } = await supabaseServerClient(ctx)
        .from<AppointmentsResponse>('appointments')
        .select(
          'startDate, endDate, patients ( firstName, lastName, phone, email), treatments ( name ), specialists ( firstName, lastName )',
        );

      if (error) throw new Error(`${error.message}: ${error.details}`);

      console.log(data)

      return data;
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  },
});
