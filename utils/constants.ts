export const appointmentsQuerySelect =
  'id, startDate, endDate, patients ( id, firstName, lastName, phone, email), notes, attended, appointments_states ( id, name ), specialists!inner( id, firstName, lastName ), treatments!inner( id, name ), locations ( id, title )';

export const DATE_FORMAT_WITH_TIME = 'DD/MM/YYYY HH:mm';

export const DATE_FORMAT = 'DD/MM/YYYY';
