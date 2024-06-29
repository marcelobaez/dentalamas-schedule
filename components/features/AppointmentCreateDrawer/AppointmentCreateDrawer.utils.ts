import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { DateTime, Interval } from 'luxon';
import { ZodType, z } from 'zod';
dayjs.extend(isBetween);

export interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
  group?: string;
}

export interface AppointmentRequest {
  startDate: string;
  endDate: string;
  patient_id: number;
  treatment_id: number;
  specialist_id: number;
}

export type FormValues = {
  stepOne: {
    treatment: string;
    specialist: string;
    startDate: Date;
    endDate: Date;
    notes: string;
  };
  stepTwo: {
    patient: string;
    attended: boolean | null;
    state: string;
  };
};

export const AppointmentSchema: ZodType<FormValues> = z.object({
  stepOne: z.object({
    treatment: z.string().length(1),
    specialist: z.string().length(1),
    startDate: z.date(),
    endDate: z.date(),
    notes: z.string().max(100),
  }),
  stepTwo: z.object({
    patient: z.string().length(1),
    attended: z.boolean().nullable(),
    state: z.string(),
  }),
});

export const isDateForbidden = (date: Date, ranges: { startDate: string; endDate: string }[]) => {
  const targetDate = dayjs(date);
  return ranges.some((range) => {
    const fromDate = dayjs(range.startDate);
    const toDate = dayjs(range.endDate);
    return targetDate.isBetween(fromDate, toDate, 'millisecond', '[]');
  });
};

export const validateRange = (
  targetFrom: Date,
  targetTo: Date,
  fromKey: string,
  toKey: string,
  ranges: { startDate: string; endDate: string }[],
  onError: (field: string[]) => void,
) => {
  const targetFromDate = dayjs(targetFrom);
  const targetToDate = dayjs(targetTo);
  return ranges.some((range) => {
    const fromDate = dayjs(range.startDate);
    const toDate = dayjs(range.endDate);

    // check if desired range is between a block/break range and marks both fields as errors
    if (
      (targetFromDate.isBetween(fromDate, toDate, 'millisecond', '[]') &&
        targetToDate.isBetween(fromDate, toDate, 'millisecond', '[]')) ||
      (fromDate.isBetween(targetFromDate, targetToDate, 'millisecond', '[]') &&
        toDate.isBetween(targetFromDate, targetToDate, 'millisecond', '[]'))
    ) {
      onError([fromKey, toKey]);
      return;
    }

    // check if desired from is between a block/break range and to is free and mark fromdate as error
    if (
      targetFromDate.isBetween(fromDate, toDate, 'millisecond', '[]') &&
      !targetToDate.isBetween(fromDate, toDate, 'millisecond', '[]')
    ) {
      onError([fromKey]);
      return;
    }

    // check if desired to is between a block/break range and and from is free and mark todate as error
    if (
      !targetFromDate.isBetween(fromDate, toDate, 'millisecond', '[]') &&
      targetToDate.isBetween(fromDate, toDate, 'millisecond', '[]')
    ) {
      onError([toKey]);
      return;
    }
  });
};

export function createNewDate(existingDate: Date, timeString: string, milli: number = 0) {
  // Parse the hour and minute from the time string
  const [hour, minute] = timeString.split(':').map(Number);

  // Create a new dayjs object from the existing date
  let newDate = dayjs(existingDate);

  // Set the hour and minute
  newDate = newDate.hour(hour).minute(minute).second(0).millisecond(milli);

  // Return the new date
  return newDate.toDate();
}
