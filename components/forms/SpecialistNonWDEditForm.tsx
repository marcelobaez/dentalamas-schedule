import { Button, Group, Stack, ThemeIcon, Text, Checkbox } from '@mantine/core';
import { IconCalendarEvent, IconPlus } from '@tabler/icons-react';
import { ExtendedSpecialist } from './SpecialistEditDrawer';
import { Tables } from '../../types/supabase';
import { DATE_FORMAT_WITH_TIME } from '../../utils/constants';
import dayjs from 'dayjs';
import classes from './Checkbox.module.css';
import { BlockCreateModal } from '../features/BlockCreateModal/BlockCreateModal';
import { modals } from '@mantine/modals';
import { BlockEditModal } from '../features/BlockEditModal/BlockEditModal';
import useSupabaseBrowser from '../../utils/supabase/component';
import { useQueryClient } from '@tanstack/react-query';

export default function SpecialistNonWDEditForm({ data }: { data: ExtendedSpecialist }) {
  const queryClient = useQueryClient();
  const supabase = useSupabaseBrowser();

  const handleOpenNewEvent = () => {
    modals.open({
      modalId: 'blockCreateModal',
      centered: true,
      size: 'sm',
      title: 'Nuevo bloqueo',
      children: (
        <BlockCreateModal specialistId={data.id} onClose={() => modals.close('blockCreateModal')} />
      ),
    });
  };

  const handleOpenEditEvent = (ev: Tables<'specialist_blocks'>) => {
    modals.open({
      modalId: 'blockEditModal',
      centered: true,
      size: 'sm',
      title: `Editar bloqueo: ${ev.title}`,
      children: <BlockEditModal data={ev} />,
    });
  };

  return (
    <Stack>
      <Group justify="flex-end" pt="md">
        <Button
          variant="outline"
          size="compact-sm"
          onClick={handleOpenNewEvent}
          leftSection={<IconPlus size="0.8rem" strokeWidth={3} />}
        >
          Bloqueo
        </Button>
      </Group>
      {data.specialist_blocks.length === 0 && (
        <Stack justify="center" pt="md" gap="sm">
          <Group justify="center">
            <ThemeIcon color="darkPurple.7" variant="white" size={50}>
              <IconCalendarEvent style={{ width: '100%', height: '100%', strokeWidth: 1 }} />
            </ThemeIcon>
          </Group>
          <Group justify="center">
            <Text fw={600} fz="sm">
              No hay bloqueos
            </Text>
          </Group>
        </Stack>
      )}
      {data.specialist_blocks.length > 0 && (
        <Stack>
          {data.specialist_blocks.map((field, index) => {
            return (
              <Checkbox.Card
                checked={field.enabled ?? false}
                key={field.id}
                className={classes.root}
                onClick={() => handleOpenEditEvent(field)}
                radius="md"
              >
                <Group wrap="nowrap" align="flex-start">
                  <Checkbox.Indicator
                    onClick={async (e) => {
                      e.stopPropagation();
                      const { error } = await supabase
                        .from('specialist_blocks')
                        .update({ enabled: !field.enabled })
                        .eq('id', field.id)
                        .throwOnError();

                      if (error) throw new Error('couldnt update block state');

                      queryClient.invalidateQueries({ queryKey: ['specialists'] });
                    }}
                  />
                  <div>
                    <Text className={classes.label}>{field.title}</Text>
                    <Text className={classes.description}>
                      {`${dayjs(field.startDate).format(DATE_FORMAT_WITH_TIME)} - ${dayjs(
                        field.endDate,
                      ).format(DATE_FORMAT_WITH_TIME)}`}
                    </Text>
                  </div>
                </Group>
              </Checkbox.Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
