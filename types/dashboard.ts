import { DefaultMantineColor } from '@mantine/core';
import { IconClock2, IconForbid, IconUser, TablerIcon } from '@tabler/icons';

export type IconName = 'user' | 'appointment' | 'cancelled';

export type Icon = {
  [key in IconName]: TablerIcon;
};

export const icons: Icon = {
  user: IconUser,
  appointment: IconClock2,
  cancelled: IconForbid,
};

export interface WidgetData {
  title: string;
  value?: number | null;
  color: DefaultMantineColor;
  diff?: number;
  Icon: TablerIcon;
  isLoading: boolean;
}
