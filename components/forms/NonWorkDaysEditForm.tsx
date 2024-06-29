import { Button, Group, Stack, Switch, TextInput, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Tables } from '../../types/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import dayjs from 'dayjs';

export default function NonWorkDaysEditForm({ data }: { data: Tables<'non_working_days'> }) {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  // form state (new)
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<Tables<'non_working_days'>>({
    values: {
      reason: data.reason,
      from_date: data.from_date,
      to_date: data.to_date,
      specialist_id: data.specialist_id,
      recurring: data.recurring,
      enabled: data.enabled,
      created_at: data.created_at,
      id: data.id,
    },
  });

  const { reason, recurring, from_date, to_date, enabled } = watch();

  // Create staff mutation
  const createNonWorkDaysMutation = useMutation({
    mutationFn: async (values: Tables<'non_working_days'>) => {
      const { data, error } = await supabase
        .from('non_working_days')
        .update({
          ...values,
          from_date: dayjs(values.from_date).format('YYYY-MM-DD'),
          to_date: dayjs(values.to_date).format('YYYY-MM-DD'),
        })
        .eq('id', values.id)
        .select()
        .single()
        .throwOnError();

      if (error) throw new Error('Couldnt create new event');

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialists'] });

      modals.closeAll();

      notifications.show({
        message: 'Evento actualizado correctamente',
      });
    },
    onError: () => {
      notifications.show({
        message: 'Hubo un error al actualizar el evento',
        color: 'red',
      });
    },
  });

  // Create staff mutation
  const deleteNonWorkDaysMutation = useMutation({
    mutationFn: async () => {
      const { data: deletedRecord, error } = await supabase
        .from('non_working_days')
        .delete()
        .eq('id', data.id)
        .select()
        .single()
        .throwOnError();

      if (error) throw new Error('Couldnt create new event');

      return deletedRecord;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialists'] });

      modals.closeAll();

      notifications.show({
        message: 'Evento eliminado correctamente',
      });
    },
    onError: () => {
      notifications.show({
        message: 'Hubo un error al eliminar el evento',
      });
    },
  });

  const handleConfirmDelete = () => {
    modals.openConfirmModal({
      title: `Eliminar evento: ${data.reason}`,
      children: (
        <Text size="sm">Esta seguro de eliminar este evento? Esta accion no es reversible.</Text>
      ),
      labels: { confirm: 'Confirmar', cancel: 'Cancelar' },
      confirmProps: {
        color: 'red',
      },
      onCancel: () => modals.closeAll(),
      onConfirm: () => deleteNonWorkDaysMutation.mutateAsync(),
    });
  };

  const onSubmitNew: SubmitHandler<Tables<'non_working_days'>> = (data) =>
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
        <Switch {...register('enabled')} checked={enabled ?? false} label="Activo" />
        <Group justify="space-between">
          <Button variant="outline" color="red" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
          <Button type="submit">Enviar</Button>
        </Group>
      </Stack>
    </form>
  );
}
