import { Button, Group, rem, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconMail, IconPhone } from '@tabler/icons-react';
import axios, { AxiosError } from 'axios';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Tables } from '../../../types/supabase';

interface ModalProps {
  data: Tables<'patients'>;
}

interface ErrorResponse {
  message: string;
}

type FormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
};

export default function PatientsEditModal({ data }: ModalProps) {
  const queryClient = useQueryClient();

  // form state
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    values: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
    },
  });

  const editPatientMutation = useMutation({
    mutationFn: (values: FormValues) => axios.put(`/api/patients/${data.id}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', data.id] });
      // Show success notification
      showNotification({
        message: 'Se modifico el paciente correctamente',
      });
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
  const onSubmit: SubmitHandler<FormValues> = (data) => editPatientMutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack pt="md" style={{ overflow: 'hidden', maxWidth: rem(960) }}>
        <SimpleGrid
          type="container"
          cols={{ base: 1, '700px': 2 }}
          spacing={{ base: 10, '700px': 'xl' }}
        >
          <TextInput
            required
            label="Nombre"
            error={
              errors.firstName
                ? errors.firstName.type === 'minLength'
                  ? 'Longitud minima (3 caracteres) no alcanzada'
                  : 'Este campo es requerido'
                : ''
            }
            placeholder="Nombre"
            {...register('firstName', { required: true, minLength: 3 })}
          />
          <TextInput
            withAsterisk
            label="Apellido"
            placeholder="Apellido"
            error={
              errors.lastName
                ? errors.lastName.type === 'minLength'
                  ? 'Longitud minima (3 caracteres) no alcanzada'
                  : 'Este campo es requerido'
                : ''
            }
            {...register('lastName', { required: true, minLength: 3 })}
          />
        </SimpleGrid>
        <SimpleGrid
          type="container"
          cols={{ base: 1, '700px': 2 }}
          spacing={{ base: 10, '700px': 'xl' }}
        >
          <TextInput
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
              errors.email
                ? errors.email.type === 'pattern'
                  ? 'Email no valido'
                  : 'Este campo es requerido'
                : ''
            }
            {...register('email', { pattern: /^\S+@\S+$/ })}
          />
        </SimpleGrid>
        <Group justify="space-between" mt="md">
          {/* <Button variant="outline" onClick={() => modals.closeModal('patientsEditModal')}>
            Cancelar
          </Button> */}
          <Button
            disabled={!isDirty || editPatientMutation.isPending}
            loading={editPatientMutation.isPending}
            type="submit"
          >
            Actualizar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
