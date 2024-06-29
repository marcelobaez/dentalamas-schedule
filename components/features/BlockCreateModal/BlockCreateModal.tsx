import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSpecialists from '../../../hooks/useSpecialists/useSpecialists';
import useSupabaseBrowser from '../../../utils/supabase/component';
import { Controller, FieldError, SubmitHandler, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCalendar } from '@tabler/icons-react';
import { Button, Group, Loader, MultiSelect, Stack, TextInput, Textarea } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { getErrorMessageForField } from '../../../utils/forms';

interface ModalProps {
  onClose: () => void;
  initialRange?: [Date, Date];
  specialistId?: number;
}

type FormValues = {
  specialist_ids: string[];
  title: string;
  notes: string;
  startDate: Date;
  endDate: Date;
};

export function BlockCreateModal({ onClose, initialRange, specialistId }: ModalProps) {
  const queryClient = useQueryClient();
  const supabase = useSupabaseBrowser();
  // Time range state
  const now = new Date();
  const startTime = initialRange
    ? initialRange[0]
    : dayjs(now).add(1, 'hour').startOf('hour').toDate();
  const endTime = initialRange ? initialRange[1] : dayjs(startTime).add(30, 'minutes').toDate();

  const [fromDayValue, setFromDayValue] = useState<Date>(
    initialRange ? initialRange[0] : new Date(),
  );
  const [toDayValue, setToDayValue] = useState<Date>(initialRange ? initialRange[1] : new Date());

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
    defaultValues: {
      specialist_ids: specialistId
        ? [specialistId.toString()]
        : specialistsData
        ? specialistsData.data.flatMap((item) => item.id.toString())
        : [''],
      notes: '',
      startDate: startTime,
      endDate: endTime,
    },
  });

  const watchFromDate = watch('startDate');
  const watchEndDate = watch('endDate');

  // Create appointment mutation
  const createBlockMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const newBlockRequest = values.specialist_ids.map((sp) => ({
        specialist_id: Number(sp),
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        title: values.title,
        notes: values.notes,
      }));
      const { data, error } = await supabase
        .from('specialist_blocks')
        .insert(newBlockRequest)
        .select();

      if (error) throw new Error('Couldnt create blocks');

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialists'] });
      // Show success notification
      notifications.show({
        message: 'Se bloqueo el horario correctamente',
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

  if (isLoadingSpecialist === 'pending') return <Loader />;

  if (isSpecialistError) return <div>Error...</div>;

  const onSubmit: SubmitHandler<FormValues> = async (data) => createBlockMutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="xs">
        <TextInput
          {...register('title', { minLength: 5, maxLength: 100, required: true })}
          error={getErrorMessageForField(errors.title, 5, 100)}
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
              date={fromDayValue}
              onChange={(value) => {
                if (value) {
                  setFromDayValue(value);
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
              date={toDayValue}
              onChange={(value) => {
                if (value) {
                  setToDayValue(value);
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
          name="specialist_ids"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <MultiSelect
              {...field}
              withAsterisk
              disabled={Boolean(specialistId)}
              error={getErrorMessageForField(errors.specialist_ids)}
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
          <Button variant="outline" onClick={() => onClose()}>
            Cancelar
          </Button>
          <Button loading={createBlockMutation.isPending} disabled={!isDirty} type="submit">
            Bloquear
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
