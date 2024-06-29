import { Button, Group, Stack, Text } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { Tables } from '../../types/supabase';
import { SubmitHandler, useForm } from 'react-hook-form';
import { modals } from '@mantine/modals';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

type FormValues = Tables<'breaks'>;

export function BreakEditForm({ data }: { data: FormValues }) {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    values: {
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      recurring: data.recurring,
      created_at: data.created_at,
      id: data.id,
      specialist_id: data.specialist_id,
    },
  });

  const watchFromDate = watch('start_time');
  const watchEndDate = watch('end_time');

  const updateBreakMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      await supabase.from('breaks').update(values).eq('id', data.id).select().single();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialists'] });
      notifications.show({
        message: 'Receso actualizado correctamente',
      });
      modals.closeAll();
    },
    onError: () => {
      notifications.show({
        title: 'Hubo un error!',
        message: 'No se pudo actualizar el bloque',
      });
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    updateBreakMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Group>
          <TimeInput label="Desde" required {...register('start_time')} />
          <Text component="span" fz="sm">{` - `}</Text>
          <TimeInput
            label="Hasta"
            required
            {...register('end_time', {
              validate: () => {
                const from = dayjs(watchFromDate);
                const to = dayjs(watchEndDate);
                return (
                  (!to.isSame(from, 'second') && !to.isBefore(from, 'second')) ||
                  'Fecha hasta debe ser mayor a inicio'
                );
              },
            })}
          />
        </Group>
        <Group justify="end">
          <Button fullWidth type="submit">
            Guardar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
