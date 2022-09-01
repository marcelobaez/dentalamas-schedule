import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconMail, IconPhone } from '@tabler/icons';
import axios, { AxiosError } from 'axios';
import { useQueryClient, useMutation, QueryClient } from '@tanstack/react-query';
import { Patient } from '../../../types/patient';
import { ContextModalProps } from '@mantine/modals';

interface ModalProps {
  onClose: () => void;
  // opened: boolean;
}

interface ErrorResponse {
  message: string;
}

export default function PatientsCreateModal({ context, id }: ContextModalProps) {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
    },
  });

  // Get inferred form values type
  type FormValues = typeof form.values;

  const addPatientMutation = useMutation((values) => axios.post('/api/patients', values), {
    onSuccess: (newPatient: Patient, values: FormValues) => {
      queryClient.setQueryData(['patients'], newPatient);
      // Show success notification
      form.reset();
      showNotification({
        title: 'Exito!',
        message: 'Se agrego el paciente correctamente',
        color: 'green',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      showNotification({
        title: 'Hubo un error',
        message: error.response?.data.message,
        color: 'red',
      });
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(['patients']);
      context.closeModal(id);
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => addPatientMutation.mutate(values))}>
      <Stack>
        <TextInput
          required
          label="Nombre"
          placeholder="Nombre"
          {...form.getInputProps('firstName')}
        />
        <TextInput
          required
          mt="xs"
          label="Apellido"
          placeholder="Apellido"
          {...form.getInputProps('lastName')}
        />
        <TextInput
          required
          mt="xs"
          label="Celular"
          placeholder="Celular"
          icon={<IconPhone size={14} />}
          {...form.getInputProps('phone')}
        />
        <TextInput
          mt="xs"
          label="Email"
          placeholder="mail@ejemplo.com"
          icon={<IconMail size={14} />}
          {...form.getInputProps('email')}
        />
        <Group position="right" mt="md">
          <Button variant="outline" onClick={() => context.closeModal(id)}>
            Cancelar
          </Button>
          <Button loading={addPatientMutation.isLoading} type="submit">
            Enviar
          </Button>
        </Group>
      </Stack>
    </form>
    // </Modal>
  );
}
