import { Button, Group, Stack, Text } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { Tables } from '../../types/supabase';
import { SubmitHandler, useForm } from 'react-hook-form';
import { modals } from '@mantine/modals';
import { useId } from 'react';
import dayjs from 'dayjs';

type FormValues = Omit<Tables<'breaks'>, 'id' | 'created_at' | 'specialist_id'> & { uid: string };

export function BreakNewForm({
  onSuccess,
  day_of_week,
}: {
  onSuccess: (values: FormValues) => void;
  day_of_week: number;
}) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      day_of_week,
      start_time: '09:00',
      end_time: '10:00',
      recurring: true,
      uid: useId(),
    },
  });

  const watchFromDate = watch('start_time');
  const watchEndDate = watch('end_time');

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    onSuccess(data);
    modals.closeAll();
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
