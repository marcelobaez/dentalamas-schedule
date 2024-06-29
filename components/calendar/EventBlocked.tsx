import { Center, Pill, useMantineTheme } from '@mantine/core';
import classes from './EventInfo.module.css';

export function EventBlocked({ title }: { title: string }) {
  const theme = useMantineTheme();

  return (
    <div className={classes.containerStripped}>
      <Center h="100%">
        <Pill size="sm" fw={600} bg={theme.colors.gray[6]} c="white">
          {title}
        </Pill>
      </Center>
    </div>
  );
}
