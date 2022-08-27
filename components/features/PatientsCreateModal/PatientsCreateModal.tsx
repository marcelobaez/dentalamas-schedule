import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconMail, IconPhone } from "@tabler/icons";
import axios from "axios";
import { useState } from "react";
import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Patient } from "../../../types/patient";

interface ModalProps {
  handleModalState: (state: boolean) => void;
  opened: boolean;
}

const client = new QueryClient()

export default function PatientsCreateModal ({opened, handleModalState}: ModalProps) {
  const [isSubmitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient()

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: ''
    },
  });

  // Get inferred form values type
  type FormValues = typeof form.values;

  // form submission handler
  // const handleSubmit = async (values: FormValues) => {
  //   try {
  //     setSubmitting(true)
  //     await axios.post('/api/patients', values);
  //     form.reset();

  //     // Show success notification
  //     showNotification({
  //       title: 'Exito!',
  //       message: 'Se agrego el paciente correctamente',
  //       color: 'green'
  //     });

  //   } catch (error) {
  //     console.log(error);

  //     showNotification({
  //       title: 'Error!',
  //       message: 'Hubo un error al intentar agendar el turno',
  //       color: 'red'
  //     });
  //   } finally {
  //     setSubmitting(false)
  //     handleModalState(false)
  //   }
  // };

  const addPatientMutation = useMutation(
    (values) => axios.post('/api/patients', values),
    {
      // onMutate: async (newPatient: Patient) => {
      //   // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      //   await queryClient.cancelQueries(['todos'])

      //   // Snapshot the previous value
      //   const previousPatients = queryClient.getQueryData<Patient[]>(['patients'])

      //   // Optimistically update to the new value
      //   if (previousPatients) {
      //     queryClient.setQueryData<Patient[]>(['patients'], [
      //       ...previousPatients,
      //       newPatient
      //     ])
      //   }

      //   return { previousPatients }
      // },
      // // If the mutation fails, use the context returned from onMutate to roll back
      // onError: (err, variables, context) => {
      //   if (context?.previousPatients) {
      //     queryClient.setQueryData<Patient[]>(['patients'], context.previousPatients)
      //   }
      //   // Show error notification
      //   showNotification({
      //     title: 'Error!',
      //     message: 'Hubo un error al intentar agendar el turno',
      //     color: 'red'
      //   });
      // },
      onSuccess: (newPatient: Patient, values: FormValues) => {
        console.log(newPatient);
        queryClient.setQueryData(['patients'], newPatient);
        // Show success notification
        showNotification({
          title: 'Exito!',
          message: 'Se agrego el paciente correctamente',
          color: 'green'
        });
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(['patients']);
        setSubmitting(false)
        handleModalState(false)
      },
    },
  )
  
  return (
    <Modal
        size={460}
        opened={opened}
        onClose={() => handleModalState(false)}
        title={
          <Text size="md" weight={600}>
            Ingresar nuevo paciente
          </Text>
        }
      >
        {/* Modal content */}
        <form onSubmit={form.onSubmit(values => addPatientMutation.mutate(values))}>
          <Stack>
            <TextInput required label="Nombre" placeholder="Nombre" {...form.getInputProps('firstName')} />
            <TextInput required mt="xs" label="Apellido" placeholder="Apellido" {...form.getInputProps('lastName')} />
            <TextInput required mt="xs" label="Celular" placeholder="Celular" icon={<IconPhone size={14} />} {...form.getInputProps('phone')}/>
            <TextInput required mt="xs" label="Email" placeholder="mail@ejemplo.com" icon={<IconMail size={14} />} {...form.getInputProps('email')}/>
            <Group position="right" mt="md">
              <Button variant="outline" onClick={() => handleModalState(false)}>Cancelar</Button>
              <Button loading={isSubmitting} disabled={isSubmitting} type="submit">Agregar</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
  )
}