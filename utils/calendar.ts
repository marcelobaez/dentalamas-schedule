import { EventInput } from '@fullcalendar/core';
import { AppointmentsResponse } from '../types/appointment';
import {
  AppointmentState,
  stateColors,
} from '../components/features/AppointmentsTable/AppointmentsTable.utils';
import { MantineTheme } from '@mantine/core';
import { Tables } from '../types/supabase';
import { generateEventsFromBreaks } from '.';

export const generateEventData = (
  data: AppointmentsResponse[] | null,
  specialistsData: Pick<
    Tables<'specialists'> & { breaks: Tables<'breaks'>[] } & {
      specialist_blocks: Tables<'specialist_blocks'>[];
    },
    'breaks' | 'specialist_blocks'
  >[],
  dateRange: [string, string],
  theme: MantineTheme,
) => {
  let serverEvents: EventInput[];

  // first thing is set events from appointments
  serverEvents = data
    ? data.map((item) => {
        const appointment = item;
        return {
          id: String(item.id),
          title: appointment.treatments.name,
          start: new Date(appointment.startDate),
          end: new Date(appointment.endDate),
          color: appointment.appointments_states
            ? theme.colors[stateColors[appointment.appointments_states.id as AppointmentState]][2]
            : 'blue',
          boldColor: appointment.appointments_states
            ? theme.colors[stateColors[appointment.appointments_states.id as AppointmentState]][8]
            : 'blue',
          midColor: appointment.appointments_states
            ? theme.colors[stateColors[appointment.appointments_states.id as AppointmentState]][4]
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
          type: 'Appointment',
        };
      })
    : [];

  specialistsData.forEach((element) => {
    // generate 'Rest' events based on day of week and start and end times. These are fixed and recurrent
    const newEvents = generateEventsFromBreaks(element.breaks, dateRange[0], dateRange[1]);
    newEvents.forEach((ev) => serverEvents?.push(ev));

    // generate events from point in time blocks per specialist
    element.specialist_blocks.forEach((ev) =>
      serverEvents.push({
        id: ev.id.toString(),
        title: ev.title,
        start: new Date(ev.startDate),
        end: new Date(ev.endDate),
        display: 'auto',
        color: 'lightgray',
        resourceId: String(ev.specialist_id),
        type: 'Block',
        extendedProps: {
          data: ev,
        },
      }),
    );
  });

  return serverEvents;
};
