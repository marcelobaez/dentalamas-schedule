import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AppointmentsResponse } from '../../types/appointment';
import useSupabaseBrowser from '../../utils/supabase/component';
import useSpecialists from '../useSpecialists/useSpecialists';

interface Specialist {
  id: number;
  firstName: string;
  lastName: string;
  specialist_working_days: SpecialistWorkingDay[];
}

interface SpecialistWorkingDay {
  day_of_week: number;
  specialist_id: number;
  start_time: string;
  end_time: string;
}

interface SpecialistWorkload {
  specialistName: string;
  loadPercentage: number;
}

interface WorkloadCapacity {
  id: number;
  capacity: number;
}

function calculateSpecialistWorkloads(
  appointments: AppointmentsResponse[],
  specialistIds: number[],
  workloadCapacities: WorkloadCapacity[],
): SpecialistWorkload[] {
  const specialistWorkloads: { [key: number]: number } = {};
  const capacityMap: { [key: number]: number } = {};

  // Create a map of specialist IDs to their capacities
  workloadCapacities.forEach((wc) => {
    capacityMap[wc.id] = wc.capacity;
  });

  // Calculate total duration for each specialist
  appointments.forEach((appointment) => {
    if (specialistIds.includes(appointment.specialists.id)) {
      const duration = calculateDuration(appointment.startDate, appointment.endDate);
      specialistWorkloads[appointment.specialists.id] =
        (specialistWorkloads[appointment.specialists.id] || 0) + duration;
    }
  });

  // Create the result array
  return specialistIds
    .map((id) => {
      const specialist = appointments.find((a) => a.specialists.id === id)?.specialists;
      if (!specialist) return null;

      const totalDuration = specialistWorkloads[id] || 0;
      const capacity = capacityMap[id] || 40; // Default to 40 hours if not specified
      const loadPercentage = (totalDuration / (capacity * 60)) * 100; // Convert capacity to minutes

      return {
        specialistName: `${specialist.firstName} ${specialist.lastName}`,
        loadPercentage: Number(loadPercentage.toFixed(2)),
      };
    })
    .filter((item): item is SpecialistWorkload => item !== null);
}

function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return (end.getTime() - start.getTime()) / (1000 * 60); // Duration in minutes
}

function calculateWorkloadCapacities(specialists?: Specialist[]): WorkloadCapacity[] {
  if (!specialists) return [];
  return specialists.map((specialist) => {
    const totalMinutes = specialist.specialist_working_days.reduce((total, day) => {
      const [startHour, startMinute] = day.start_time.split(':').map(Number);
      const [endHour, endMinute] = day.end_time.split(':').map(Number);
      const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute);
      return total + duration;
    }, 0);

    return {
      id: specialist.id,
      capacity: Number((totalMinutes / 60).toFixed(2)), // Convert minutes to hours, rounded to 2 decimal places
    };
  });
}

export default function useDashboard() {
  const supabase = useSupabaseBrowser();
  const { data: spData } = useSpecialists();
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const fromDate = dayjs().startOf('week').add(1, 'day').format();
      const toDate = dayjs().endOf('week').format();

      const { data, error } = await supabase
        .from('appointments')
        .select(
          'startDate, endDate, specialists ( id, firstName, lastName ), appointments_states(id)',
          {
            count: 'exact',
          },
        )
        .gte('startDate', fromDate)
        .lte('endDate', toDate)
        .returns<AppointmentsResponse[]>();

      if (error) throw new Error('Couldnt process appointments query');

      const totalAttended = data.filter((ev) => ev.attended).length;
      const totalCancelled = data.filter((ev) => ev.appointments_states.id === 3).length;
      const totalApproved = data.filter((ev) => ev.appointments_states.id === 1).length;

      const specialistIds = spData ? spData.data.flatMap((sp) => sp.id) : []; // IDs of specialists you want to calculate workload for
      const workloadCapacities = calculateWorkloadCapacities(spData?.data);

      const workload = calculateSpecialistWorkloads(data, specialistIds, workloadCapacities);

      return {
        data: {
          totalApproved,
          totalAttended,
          totalCancelled,
          workload,
        },
      };
    },
    enabled: !!spData,
  });
}
