export const appointmentsQuerySelect =
  'id, startDate, endDate, patients!inner ( id, firstName, lastName, phone, email), notes, attended, appointments_states ( id, name ), specialists!inner( id, firstName, lastName, non_working_days(*) ), treatments!inner( id, name ), locations ( id, title )';

export const DATE_FORMAT_WITH_TIME = 'DD/MM/YYYY HH:mm';

export const DATE_FORMAT = 'DD/MM/YYYY';

export const dayNames: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miercoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sabado',
  7: 'Domingo',
};

export const DEFAULT_WORKING_DAYS = [
  {
    checked: false,
    day_of_week: 1,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 2,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 3,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 4,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 5,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 6,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 7,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
];
