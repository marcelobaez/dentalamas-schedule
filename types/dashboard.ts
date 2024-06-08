import { DefaultMantineColor } from '@mantine/core';
import { IconProps } from '@tabler/icons-react';

export type IconName = 'user' | 'appointment' | 'cancelled';

export type Icon = {
  [key in IconName]: (props: IconProps) => JSX.Element;
};

// export const icons: Icon = {
//   user: IconUser,
//   appointment: IconClock2,
//   cancelled: IconForbid,
// };

export interface WidgetData {
  title: string;
  value?: number | null;
  color: DefaultMantineColor;
  diff?: number;
  Icon: (props: IconProps) => JSX.Element;
  isLoading: boolean;
}
