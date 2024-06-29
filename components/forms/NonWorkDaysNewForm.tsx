import { Button, Stack, Switch, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Tables } from '../../types/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';
import { showNotification } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import dayjs from 'dayjs';

type NewFormValues = Omit<Tables<'non_working_days'>, 'id' | 'created_at'>;

export default function NonWorkDaysNewForm({ spID }: { spID: number }) {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  // form state (new)
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<NewFormValues>({
    defaultValues: {
      reason: '',
      from_date: new Date().toISOString(),
      to_date: new Date().toISOString(),
    },
  });

  const { reason, recurring, from_date, to_date } = watch();

  // Create staff mutation
  const createNonWorkDaysMutation = useMutation({
    mutationFn: async (values: NewFormValues) => {
      const { data, error } = await supabase
        .from('non_working_days')
        .insert({
          ...values,
          enabled: true,
          specialist_id: spID,
          from_date: dayjs(values.from_date).format('YYYY-MM-DD'),
          to_date: dayjs(values.to_date).format('YYYY-MM-DD'),
        })
        .select();

      if (error) throw new Error('Couldnt create new working day');

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialists'] });

      modals.closeAll();

      showNotification({
        message: 'Evento creado correctamente',
        color: 'green',
      });
    },
    onError: () => {
      showNotification({
        message: 'Hubo un error al crear el personal',
      });
    },
  });

  const onSubmitNew: SubmitHandler<NewFormValues> = (data) =>
    createNonWorkDaysMutation.mutateAsync(data);

  return (
    <form onSubmit={handleSubmit(onSubmitNew)}>
      <Stack>
        <TextInput
          {...(register('reason'), { required: true, minLength: 5 })}
          onChange={(e) => setValue('reason', e.currentTarget.value)}
          value={reason}
          error={
            errors && errors.reason
              ? errors.reason.type === 'minLength'
                ? 'Longitud minima 5 caracteres'
                : 'Campo requerido'
              : ''
          }
          withAsterisk
          label="Motivo"
          placeholder="Cumpleaños, Vacaciones"
          data-autofocus
        />
        <DateInput
          {...(register('from_date'), { required: true })}
          value={from_date ? new Date(from_date) : undefined}
          error={errors && errors.from_date ? 'Campo requerido' : ''}
          withAsterisk
          onChange={(value) => {
            if (value) setValue('from_date', value.toISOString());
          }}
          label="Fecha desde"
        />
        <DateInput
          {...(register('to_date'), { required: true })}
          value={to_date ? new Date(to_date) : undefined}
          error={errors && errors.to_date ? 'Campo requerido' : ''}
          withAsterisk
          onChange={(value) => {
            if (value) setValue('to_date', value.toISOString());
          }}
          label="Fecha hasta"
        />
        <Switch
          {...register('recurring')}
          checked={recurring ?? false}
          label="Se repite todos los años"
        />
        <Button fullWidth mt="md" type="submit">
          Crear
        </Button>
      </Stack>
    </form>
  );
}
