export const appointmentsQuerySelect =
  'id, startDate, endDate, patients ( id, firstName, lastName, phone, email), notes, attended, appointments_states ( id, name ), specialists!inner( id, firstName, lastName ), treatments!inner( id, name )';
