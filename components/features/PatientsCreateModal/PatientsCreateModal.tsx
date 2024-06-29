import { Button, Group, Stack, TextInput } from '@mantine/core';
import { notifications, showNotification } from '@mantine/notifications';
import { IconMail, IconPhone } from '@tabler/icons-react';
import axios, { AxiosError } from 'axios';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Patient } from '../../../types/patient';
import { ContextModalProps } from '@mantine/modals';
import { SubmitHandler, useForm } from 'react-hook-form';

interface ErrorResponse {
  message: string;
}

type FormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
};

export default function PatientsCreateModal({ context, id }: ContextModalProps) {
  const queryClient = useQueryClient();

  // form state
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
    },
  });

  const addPatientMutation = useMutation({
    mutationFn: (values: FormValues) => axios.post('/api/patients', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['searchPatients'] });
      // Show success notification
      notifications.show({
        message: 'Se creo el paciente correctamente',
      });
      context.closeModal(id);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      notifications.show({
        title: 'Hubo un error',
        message: error.response?.data.message,
        color: 'red',
      });
    },
  });

  // form submit
  const onSubmit: SubmitHandler<FormValues> = (data) => addPatientMutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <TextInput
          required
          label="Nombre"
          placeholder="Nombre"
          min={3}
          error={
            errors.firstName
              ? errors.firstName.type === 'minLength'
                ? 'Longitud minima (3 caracteres) no alcanzada'
                : 'Este campo es requerido'
              : ''
          }
          {...register('firstName', { required: true, minLength: 3 })}
        />
        <TextInput
          required
          mt="xs"
          label="Apellido"
          placeholder="Apellido"
          min={3}
          error={
            errors.lastName
              ? errors.lastName.type === 'minLength'
                ? 'Longitud minima (3 caracteres) no alcanzada'
                : 'Este campo es requerido'
              : ''
          }
          {...register('lastName', { required: true, minLength: 3 })}
        />
        <TextInput
          required
          mt="xs"
          label="Celular"
          placeholder="Celular"
          leftSection={<IconPhone size={14} />}
          error={
            errors.phone
              ? errors.phone.type === 'pattern'
                ? 'Numero no valido'
                : 'Este campo es requerido'
              : ''
          }
          {...register('phone', {
            required: true,
            pattern: /^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/,
          })}
        />
        <TextInput
          mt="xs"
          label="Email"
          placeholder="mail@ejemplo.com"
          leftSection={<IconMail size={14} />}
          error={
            errors.phone
              ? errors.phone.type === 'pattern'
                ? 'Email no valido'
                : 'Este campo es requerido'
              : ''
          }
          {...register('email', { pattern: /^\S+@\S+$/ })}
        />
        <Group justify="right" mt="md">
          <Button variant="outline" onClick={() => context.closeModal(id)}>
            Cancelar
          </Button>
          <Button
            loading={addPatientMutation.isPending}
            disabled={!isDirty || addPatientMutation.isPending}
            type="submit"
          >
            Crear
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
