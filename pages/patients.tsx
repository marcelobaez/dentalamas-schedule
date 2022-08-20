import { Avatar, Box, Button, ColorSwatch, Group, Modal, Paper, ScrollArea, Space, Stack, Table, Text, TextInput, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { supabaseServerClient, withPageAuth } from "@supabase/auth-helpers-nextjs";
import { IconMail, IconPhone, IconPlus } from "@tabler/icons";
import axios from "axios";
import dayjs from "dayjs";
import { useState } from "react";

interface TableReviewsProps {
  patients: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }[];
}

export default function Patients({patients}: TableReviewsProps) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();
  
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
  const handleSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true)
      await axios.post('/api/patients', values);
      form.reset();

      // Show success notification
      showNotification({
        title: 'Exito!',
        message: 'Se agrego el paciente correctamente',
        color: 'green'
      });

    } catch (error) {
      console.log(error);

      showNotification({
        title: 'Error!',
        message: 'Hubo un error al intentar agendar el turno',
        color: 'red'
      });
    } finally {
      setSubmitting(false)
      setOpened(false)
    }

  };

  const rows = patients.map((row, idx) => {
    return (
      <tr key={`treat-row-${idx}`}>
        <td>
        <Group>
          <Avatar
            radius="xl"
          />
          <Box sx={{ flex: 1 }}>
            <Text size="sm" weight={500}>
              {`${row.firstName} ${row.lastName}`}
            </Text>
            <Text color="dimmed" size="xs">
              {row.email}
            </Text>
          </Box>

          {/* {theme.dir === 'ltr' ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />} */}
        </Group>
        </td>
        <td>
          <Text size="sm">{row.phone}</Text>
        </td>
        <td>
          <Text size="sm">{dayjs().format()}</Text>
        </td>
        <td>
          <ColorSwatch color={theme.colors.green[6]} />
        </td>
      </tr>
    );
  });

  return (
    <Paper shadow="xs" p="md">
      <Group position="right">
        <Button leftIcon={<IconPlus />} onClick={() => setOpened(true)}>
          Nuevo paciente
        </Button>
      </Group>
      <Space h="md" />
      <ScrollArea>
        <Table sx={{ minWidth: 800 }} verticalSpacing="xs">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Telefono</th>
              <th>Ultimo turno</th>
              <th>Asistio</th>
              {/* <th>Motivo</th> */}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
      <Modal
        size={460}
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Text size="md" weight={600}>
            Ingresar nuevo paciente
          </Text>
        }
      >
        {/* Modal content */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput required label="Nombre" placeholder="Nombre" {...form.getInputProps('firstName')} />
            <TextInput required mt="xs" label="Apellido" placeholder="Apellido" {...form.getInputProps('lastName')} />
            <TextInput required mt="xs" label="Celular" placeholder="Celular" icon={<IconPhone size={14} />} {...form.getInputProps('phone')}/>
            <TextInput required mt="xs" label="Email" placeholder="mail@ejemplo.com" icon={<IconMail size={14} />} {...form.getInputProps('email')}/>
            <Group position="right" mt="md">
              <Button variant="outline" onClick={() => setOpened(false)}>Cancelar</Button>
              <Button loading={isSubmitting} disabled={isSubmitting} type="submit">Agregar</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Paper>
  )
}

export const getServerSideProps = withPageAuth({ redirectTo: '/login', 
async getServerSideProps(ctx) {
  // Get appointments
  const { data: patientsData } = await supabaseServerClient(ctx)
    .from('patients')
    .select(
      'firstName, lastName, phone, email',
    );

  return {
    props: {
      patients: patientsData,
    },
  };
},
});