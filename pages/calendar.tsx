import { useEffect, useMemo, useState } from 'react';
import { Calendar as BigCalendar, luxonLocalizer, Views } from 'react-big-calendar';
import { DateTime, Settings } from 'luxon';
import { User } from '@supabase/auth-helpers-react';
import { supabaseServerClient, withPageAuth } from '@supabase/auth-helpers-nextjs';
import dayjs from 'dayjs';

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

export default function Calendar({ appointments }: { user: User; appointments: any }) {
  const [timezone, setTimezone] = useState(defaultTZ);

  const { defaultDate, getNow, localizer, myEvents, scrollToTime } = useMemo(() => {
    Settings.defaultZone = timezone;
    return {
      defaultDate: DateTime.local().toJSDate(),
      getNow: () => DateTime.local().toJSDate(),
      localizer: luxonLocalizer(DateTime),
      myEvents: appointments.map((item: any) => ({
        ...item,
        start: new Date(item.start),
        end: new Date(item.end),
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
    // Run queries with RLS on the server
    const { data } = await supabaseServerClient(ctx)
      .from('appointments')
      .select('startDate, endDate, patients ( firstName, lastName, phone, email), treatments ( name )');
    // console.log(data);
    const appointments = data?.map((item) => ({
      title: `${item.treatments.name} - ${item.patients.firstName} ${item.patients.lastName}`,
      start: item.startDate,
      end: item.endDate,
    }));
    return { props: { appointments } };
  },
});
