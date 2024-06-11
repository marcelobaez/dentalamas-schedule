import { ColorSwatch, Group, Text } from '@mantine/core';

export enum AppointmentState {
  Approved = 1,
  Pending,
  Cancelled,
  Rejected,
  Rescheduled = 6,
}

export const stateColors = {
  [AppointmentState.Approved]: 'green',
  [AppointmentState.Pending]: 'darkPurple', //'#6a65b0'
  [AppointmentState.Cancelled]: 'red',
  [AppointmentState.Rejected]: 'dark',
  [AppointmentState.Rescheduled]: 'gray',
};

export const mantineStateColors = {
  [AppointmentState.Approved]: 'green',
  [AppointmentState.Pending]: 'orange', //gray.4 in theme. TODO: find a way to change it to named index
  [AppointmentState.Cancelled]: 'red',
  [AppointmentState.Rejected]: 'black',
  [AppointmentState.Rescheduled]: 'gray',
};

export const getSwatchColorComponent = (state: AppointmentState, value: string) => {
  return (
    <Group gap="xs">
      <ColorSwatch size={16} color={mantineStateColors[state]} style={{ color: '#fff' }}>
        {/* {stateIcons[state]} */}
      </ColorSwatch>
      <Text fz="sm">{value}</Text>
    </Group>
  );
};

export const mapAttendedStateToMsg = (state: null | boolean) => {
  switch (state) {
    case null:
      return 'N/D';
    case true:
      return 'SI';
    case false:
      return 'NO';
    default:
      return 'N/D';
  }
};

export const mapAttendedStateToColor = (state: null | boolean) => {
  switch (state) {
    case null:
      return 'gray';
    case true:
      return 'green';
    case false:
      return 'red';
    default:
      return 'gray';
  }
};
