import {
  Button,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { AxiosError } from 'axios';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import useSupabaseBrowser from '../../../utils/supabase/component';
import { Tables } from '../../../types/supabase';
import useTreatmentVisits from '../../../hooks/useTreatmentVisits/useTreatmentVisits';

interface ErrorResponse {
  message: string;
}

type FormValues = Omit<Tables<'treatments'>, 'created_at' | 'id'>;

interface ModalProps {
  onClose: () => void;
}

export default function TreatmentCreateModal({ onClose }: ModalProps) {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  const { data: visitData, status } = useTreatmentVisits();

  // form state
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      est_price: null,
      est_duration: null,
    },
  });

  const addTreatmentMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase.from('treatments').insert(values).select().single();

      if (error) throw new Error('Couldnt create new specialist');

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      // Show success notification
      showNotification({
        title: 'Exito!',
        message: 'Se agrego el tratamiento correctamente',
        color: 'green',
      });
      onClose();
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      showNotification({
        title: 'Hubo un error',
        message: error.response?.data.message,
        color: 'red',
      });
    },
  });

  // form submit
  const onSubmit: SubmitHandler<FormValues> = (data) => addTreatmentMutation.mutate(data);

  if (status === 'pending') return <LoadingOverlay visible />;

  if (status === 'error') return <div>Hubo un error</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label="Nombre"
          placeholder="Nombre"
          min={3}
          error={
            errors.name
              ? errors.name.type === 'minLength'
                ? 'Longitud minima (3 caracteres) no alcanzada'
                : 'Este campo es requerido'
              : ''
          }
          {...register('name', { required: true, minLength: 3 })}
        />
        <Controller
          name="est_price"
          control={control}
          render={({ field }) => (
            <NumberInput
              {...field}
              value={field.value ?? ''}
              label="Precio estimado"
              prefix="$"
              placeholder="Pesos"
              thousandSeparator="."
              decimalSeparator=","
              hideControls
            />
          )}
        />
        <Controller
          name="est_duration"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              value={field.value ? field.value.toString() : ''}
              label="Duracion estimada"
              placeholder="Seleccione la duracion"
              data={[
                { label: '30 min', value: '30' },
                { label: '1 hora', value: '60' },
                { label: '1:30 horas', value: '90' },
                { label: '2 horas', value: '120' },
                { label: '2:30 horas', value: '150' },
                { label: '3 horas', value: '180' },
              ]}
              onChange={(value) => {
                if (value) field.onChange(parseInt(value));
              }}
            />
          )}
        />
        <Controller
          name="visit_type"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              value={field.value ? field.value.toString() : ''}
              label="Tipo de Visita"
              placeholder="Seleccione una opcion"
              data={visitData.data.map((visit) => ({
                label: visit.type,
                value: visit.id.toString(),
              }))}
              onChange={(value) => {
                if (value) field.onChange(parseInt(value));
              }}
            />
          )}
        />
        <Group justify="right" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            loading={addTreatmentMutation.isPending}
            disabled={!isDirty || addTreatmentMutation.isPending}
            type="submit"
          >
            Enviar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
