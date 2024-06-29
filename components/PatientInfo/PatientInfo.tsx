import { Avatar, Text, Group } from '@mantine/core';
import { IconPhoneCall, IconAt } from '@tabler/icons-react';
import classes from './PatientInfo.module.css';
import { Tables } from '../../types/supabase';

export function PatientInfo({ data }: { data: Tables<'patients'> }) {
  return (
    <div>
      <Group wrap="nowrap">
        <Avatar
          // src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
          size={94}
          radius="md"
          color="darkPurple"
        />
        <div>
          {/* <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
            Software engineer
          </Text> */}

          <Text fz="lg" fw={500} className={classes.name}>
            {`${data.firstName} ${data.lastName}`}
          </Text>

          <Group wrap="nowrap" gap={10} mt={3}>
            <IconAt stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="xs" c="dimmed">
              {data.email}
            </Text>
          </Group>

          <Group wrap="nowrap" gap={10} mt={5}>
            <IconPhoneCall stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="xs" c="dimmed">
              {data.phone}
            </Text>
          </Group>
        </div>
      </Group>
    </div>
  );
}
