import { Badge, Transition } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

export function AutoHideError({
  visible,
  label = 'Hubo un error al guardar',
}: {
  visible: boolean;
  label?: string;
}) {
  return (
    <Transition mounted={visible} transition="slide-right" duration={400} timingFunction="ease">
      {(styles) => (
        <Badge
          style={styles}
          color="red"
          variant="light"
          size="lg"
          rightSection={<IconX size="0.875rem" />}
        >
          {label}
        </Badge>
      )}
    </Transition>
  );
}
