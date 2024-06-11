import { Badge, Transition } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

export function AutoHideSuccess({
  visible,
  label = 'Guardado',
}: {
  visible: boolean;
  label?: string;
}) {
  return (
    <Transition mounted={visible} transition="slide-right" duration={400} timingFunction="ease">
      {(styles) => (
        <Badge
          style={styles}
          color="green"
          variant="light"
          size="lg"
          rightSection={<IconCheck size="0.875rem" />}
        >
          {label}
        </Badge>
      )}
    </Transition>
  );
}
