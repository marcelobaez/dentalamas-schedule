import { EventContentArg } from '@fullcalendar/core';
import { Box, Pill, Text, useMantineTheme } from '@mantine/core';
import classes from './EventInfo.module.css';
import dayjs from 'dayjs';

export function EventInfo({ eventInfo }: { eventInfo: EventContentArg }) {
  const {
    event: { extendedProps },
  } = eventInfo;
  const theme = useMantineTheme();

  return (
    <div className={classes.container}>
      <Box w={140}>
        <Text
          title={extendedProps.patientName}
          c={theme.colors.dark[7]}
          fw="bold"
          fz="0.75rem"
          truncate="end"
        >
          {extendedProps.patientName}
        </Text>
        <span
          style={{
            color: theme.colors.dark[7],
            fontSize: '0.75rem',
          }}
        >
          {`${dayjs(eventInfo.event.startStr).format('HH:mm')} > ${dayjs(
            eventInfo.event.endStr,
          ).format('HH:mm')}`}
        </span>
        <br></br>
        <Pill size="sm" bg={eventInfo.event.extendedProps.midColor}>
          {eventInfo.event.title}
        </Pill>
      </Box>
    </div>
  );
}
