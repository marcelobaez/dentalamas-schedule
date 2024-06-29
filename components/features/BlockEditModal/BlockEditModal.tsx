import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSpecialists from '../../../hooks/useSpecialists/useSpecialists';
import useSupabaseBrowser from '../../../utils/supabase/component';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconCheck } from '@tabler/icons-react';
import {
  Button,
  Group,
  Loader,
  MultiSelect,
  Select,
  Stack,
  TextInput,
  Textarea,
  Text,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { Tables } from '../../../types/supabase';
import { modals } from '@mantine/modals';
import { getErrorMessageForField } from '../../../utils/forms';

interface ModalProps {
  data: Tables<'specialist_blocks'>;
}

type FormValues = {
  specialist_id: number;
  title: string;
  notes: string | null;
  startDate: Date;
  endDate: Date;
};

export function BlockEditModal({ data }: ModalProps) {
  const queryClient = useQueryClient();
  const supabase = useSupabaseBrowser();

  const {
    data: specialistsData,
    status: isLoadingSpecialist,
    isError: isSpecialistError,
  } = useSpecialists();

  // form state
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    values: {
      specialist_id: data.specialist_id,
      title: data.title,
      notes: data.notes,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });

  const watchFromDate = watch('startDate');
  const watchEndDate = watch('endDate');

  // Update appointment mutation
  const updateBlockMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const updateBlockRequest = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      const { data: updatedRecord, error } = await supabase
        .from('specialist_blocks')
        .update(updateBlockRequest)
        .eq('id', data.id)
        .select();
      if (error) throw new Error('Couldnt create blocks');
      return updatedRecord;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialists'] });
      // Show success notification
      notifications.show({
        message: 'Bloqueo actualizado correctamente',
      });
      modals.closeAll();
    },
    onError: () => {
      notifications.show({
        title: 'Error!',
        message: 'No se pudo crear el bloqueo',
        color: 'red',
      });
    },
  });

  // Update appointment mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('specialist_blocks')
        .delete()
        .eq('id', data.id)
        .select();
      if (error) throw new Error('Couldnt delete blocks');
      return;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialists'] });
      // Show success notification
      notifications.show({
        message: 'Bloqueo eliminado correctamente',
      });
      modals.closeAll();
    },
    onError: () => {
      notifications.show({
        title: 'Error!',
        message: 'No se pudo eliminar el bloqueo',
        color: 'red',
      });
    },
  });

  // const onSubmit: SubmitHandler<FormValues> = (data) => handleSubmitForm(data);
  const onSubmit: SubmitHandler<FormValues> = async (data) => updateBlockMutation.mutate(data);

  if (isLoadingSpecialist === 'pending') return <Loader />;

  if (isSpecialistError) return <div>Error...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="xs">
        <TextInput
          {...register('title', { minLength: 5, maxLength: 100, required: true })}
          error={errors.title ? getErrorMessageForField(errors.title, 5, 100) : ''}
          label="Titulo"
          placeholder="Curso, Especialidad, Licencia..."
        />
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              withAsterisk
              value={field.value}
              onChange={(value) => {
                if (value) {
                  setValue('startDate', value, { shouldDirty: true });
                }
              }}
              label="Desde"
              placeholder="Elija fecha y hora de inicio"
              leftSection={<IconCalendar size="1rem" />}
            />
          )}
        />
        <Controller
          name="endDate"
          control={control}
          rules={{
            validate: () => {
              const from = dayjs(watchFromDate);
              const to = dayjs(watchEndDate);
              return (
                (!to.isSame(from, 'second') && !to.isBefore(from, 'second')) ||
                'Fecha hasta debe ser mayor a inicio'
              );
            },
          }}
          render={({ field }) => (
            <DateTimePicker
              withAsterisk
              error={getErrorMessageForField(errors.endDate)}
              value={field.value}
              onChange={(value) => {
                if (value) {
                  setValue('endDate', value, { shouldDirty: true });
                }
              }}
              label="Hasta"
              placeholder="Elija fecha y hora de fin"
              leftSection={<IconCalendar size="1rem" />}
            />
          )}
        />
        <Controller
          name="specialist_id"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <MultiSelect
              {...field}
              value={[String(field.value)]}
              withAsterisk
              disabled
              label="Profesional"
              placeholder="Elija el profesional"
              data={specialistsData.data.map((item) => ({
                value: `${item.id}`,
                label: `${item.firstName} ${item.lastName}`,
              }))}
            />
          )}
        />
        <Textarea label="Notas" minRows={3} maxRows={4} {...register('notes')} />
        <Group justify="right">
          <Button
            variant="outline"
            color="red"
            onClick={() =>
              modals.openConfirmModal({
                title: 'Eliminar bloqueo',
                children: <Text size="sm">Esta seguro? esta accion no es reversible</Text>,
                onConfirm: async () => deleteBlockMutation.mutateAsync(),
                labels: { confirm: 'Eliminar bloqueo', cancel: 'Cancelar' },
                confirmProps: { color: 'red' },
              })
            }
          >
            Eliminar
          </Button>
          <Button loading={updateBlockMutation.isPending} disabled={!isDirty} type="submit">
            Guardar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
