import { Button, Stack } from '@mantine/core';
import { IconCalendar, IconForbid2 } from '@tabler/icons-react';
import dayjs from 'dayjs';

interface ScheduleModalProps {
  dateRange: [Date, Date];
  onBlock: (spId?: string) => void;
  onSchedule: () => void;
  specialistId?: string;
}

export const ScheduleModal = ({
  dateRange,
  onBlock,
  onSchedule,
  specialistId,
}: ScheduleModalProps) => {
  const from = dayjs(dateRange[0]).format('HH:mm');
  const to = dayjs(dateRange[1]).format('HH:mm');
  return (
    <Stack>
      <Button leftSection={<IconForbid2 />} onClick={() => onBlock(specialistId)} color="red">
        {`Bloquear ${from} - ${to}`}
      </Button>
      <Button
        onClick={() => onSchedule()}
        leftSection={<IconCalendar />}
      >{`Agendar ${from} - ${to}`}</Button>
    </Stack>
  );
};
