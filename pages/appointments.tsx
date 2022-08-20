import { forwardRef, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import {
  Avatar,
  Badge,
  Table,
  Group,
  Text,
  ScrollArea,
  Paper,
  Button,
  Space,
  Modal,
  Select,
  Stack,
  Chip,
  Grid,
  Title,
} from '@mantine/core';
import { Calendar, TimeRangeInput } from '@mantine/dates';
import { supabaseServerClient, withPageAuth } from '@supabase/auth-helpers-nextjs';
import { IconClock, IconPlus } from '@tabler/icons';
import { DateTime } from 'luxon';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import 'dayjs/locale/es';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
}

interface TableReviewsProps {
  specialists: {
    id: number;
    firstName: string;
    lastName: string;
    title: string;
  }[];
  patients: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
  }[];
  treatments: {
    id: number;
    name: string;
  }[];
  appointments: {
    treatment: string;
    patient: {
      fullName: string;
      phone: string;
    };
    specialist: string;
    start: string;
    end: string;
  }[];
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        {image.length > 0 ? <Avatar src={image} /> : <Avatar />}
        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" color="dimmed">
            {description}
          </Text>
        </div>
      </Group>
    </div>
  ),
);

export default function Appointments({
  appointments,
  treatments,
  specialists,
  patients,
}: TableReviewsProps) {
  const [opened, setOpened] = useState(false);

  // Establecer rango horario
  const now = new Date();
  const startTime = dayjs(now).add(1, 'hour').startOf('hour').toDate();
  const endTime = dayjs(startTime).add(30, 'minutes').toDate();
  const [timeRange, setTimeRange] = useState<[Date, Date]>([startTime, endTime]);

  const [isSubmitting, setSubmitting] = useState(false);

  const [dayValue, setDayValue] = useState<Date | null>(new Date());

  const form = useForm({
    initialValues: {
      patient: '',
      specialist: '1',
      treatment: '1',
    },
  });

  // Get inferred form values type
  type FormValues = typeof form.values;

  // form submission handler
  const handleSubmit = async (values: FormValues) => {
    const formData = {
      startDate: timeRange[0],
      endDate: timeRange[1],
      patient_id: parseInt(values.patient),
      treatment_id: parseInt(values.treatment),
      specialist_id: parseInt(values.specialist)
    };

    
    try {
      setSubmitting(true)
      await axios.post('/api/appointments', formData);
      form.reset();

      // Show success notification
      showNotification({
        title: 'Exito!',
        message: 'Se agendo el turno correctamente',
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

  const handleDayChange = (value: Date) => {
    // Create new ranges based on new selected day, maintaining selected hour and minutes
    const newStartTime = dayjs(value).hour(dayjs(timeRange[0]).get('hour')).minute(dayjs(timeRange[0]).get('minute')).toDate();
    const newEndTime = dayjs(value).hour(dayjs(timeRange[1]).get('hour')).minute(dayjs(timeRange[1]).get('minute')).toDate();

    setDayValue(value);
    setTimeRange([newStartTime, newEndTime]);
  };

  const rows = appointments.map((row, idx) => {
    return (
      <tr key={`treat-row-${idx}`}>
        <td>
          <Badge color="yellow">
            {new Date(row.start).toLocaleString('es-AR', { month: 'long', day: 'numeric' })}
          </Badge>
        </td>
        <td>
          <Text size="sm">
            <Badge radius="xs">{`${new Date(row.start).toLocaleString(
              'es-AR',
              DateTime.TIME_SIMPLE,
            )} - ${new Date(row.end).toLocaleString('es-AR', DateTime.TIME_SIMPLE)}`}</Badge>
          </Text>
        </td>
        <td>
          <Text size="sm">{row.patient.fullName}</Text>
        </td>
        <td>
          <Group spacing="sm">
            <Avatar
              size={26}
              src={
                'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80'
              }
              radius={26}
            />
            <Text size="sm" weight={500}>
              {row.specialist}
            </Text>
          </Group>
        </td>
        <td>
          <Text size="sm">{row.treatment}</Text>
        </td>
      </tr>
    );
  });

  const handleTimeRangechange = (value: [Date, Date]) => {
    // Set ranges to selected day in calendar (by default this control uses 'today')
    const prevstartHourAndMinute= [dayjs(value[0]).get('hour'), dayjs(value[0]).get('minute')];
    const prevendHourAndMinute = [dayjs(value[1]).get('hour'), dayjs(value[1]).get('minute')];

    setTimeRange([dayjs(dayValue).hour(prevstartHourAndMinute[0]).minute(prevstartHourAndMinute[1]).toDate(), dayjs(dayValue).hour(prevendHourAndMinute[0]).minute(prevendHourAndMinute[1]).toDate()])
  };

  return (
    <Grid>
      <Grid.Col span={12}>
        {/* <Paper shadow="xs" p="xs"> */}
          <Group position="apart">
            <Text weight={600} size={'xl'}>Turnos</Text>
            <Button leftIcon={<IconPlus />} onClick={() => setOpened(true)}>
              Nuevo turno
            </Button>
          </Group>
        {/* </Paper> */}
      </Grid.Col>
      <Grid.Col span={12}>
        <Paper shadow="xs" p="xs">
          {/* <Group position="right">
            <Button leftIcon={<IconPlus />} onClick={() => setOpened(true)}>
              Nuevo turno
            </Button>
          </Group> */}
          <Space h="md" />
          <ScrollArea>
            <Table sx={{ minWidth: 800 }} verticalSpacing="xs">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Turno</th>
                  <th>Paciente</th>
                  <th>Doctor</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </Table>
          </ScrollArea>
          <Modal
            size="55%"
            opened={opened}
            onClose={() => setOpened(false)}
            title={
              <Text size="md" weight={600}>
                Ingresar nuevo turno
              </Text>
            }
          >
            {/* Modal content */}
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <Group grow>
                  <Select
                    label="Paciente"
                    placeholder="Paciente"
                    itemComponent={SelectItem}
                    searchable
                    maxDropdownHeight={400}
                    nothingFound="Sin resultados"
                    filter={(value, item) =>
                      item.label!.toLowerCase().includes(value.toLowerCase().trim()) ||
                      item.description.toLowerCase().includes(value.toLowerCase().trim())
                    }
                    onChange={(value: string) => form.setFieldValue('patient', value)}
                    data={patients.map((item) => ({
                      value: `${item.id}`,
                      label: `${item.firstName} ${item.lastName}`,
                      image: '',
                      description: item.phone,
                    }))}
                    required
                    {...form.getInputProps('patient')}
                  />
                  <Select
                    label="Especialista"
                    placeholder="Especialista"
                    {...form.getInputProps('specialist')}
                    itemComponent={SelectItem}
                    maxDropdownHeight={400}
                    nothingFound="Sin resultados"
                    onChange={(value: string) => form.setFieldValue('specialist', value)}
                    filter={(value, item) =>
                      item.label!.toLowerCase().includes(value.toLowerCase().trim()) ||
                      item.description.toLowerCase().includes(value.toLowerCase().trim())
                    }
                    data={specialists.map((item) => ({
                      value: `${item.id}`,
                      label: `${item.firstName} ${item.lastName}`,
                      image: '',
                      description: item.title,
                    }))}
                  />
                </Group>
                <Text size="sm" weight={500}>
                  Elija el dia
                </Text>
                <Group grow align={'flex-start'}>
                  <Calendar
                    excludeDate={(date) => date.getDay() === 0}
                    minDate={new Date()}
                    locale="es"
                    value={dayValue}
                    onChange={handleDayChange}
                  />
                  <TimeRangeInput
                    icon={<IconClock size={16} />}
                    // error="Debe indicar un rango valido"
                    required
                    label="Horario"
                    value={timeRange}
                    onChange={handleTimeRangechange}
                    format="12"
                  />
                </Group>
                {/* <Chip.Group position="left">
                  <Chip value="1">17:00 - 18:30</Chip>
                  <Chip value="2">18:30 - 19:30</Chip>
                  <Chip value="3">19:30 - 20:30</Chip>
                </Chip.Group> */}
                <Group>
                  <Select
                    label="Motivo"
                    placeholder="Motivo"
                    {...form.getInputProps('treatment')}
                    onChange={(value: string) => form.setFieldValue('treatment', value)}
                    data={treatments.map((item) => ({
                      value: `${item.id}`,
                      label: item.name,
                    }))}
                  />
                </Group>

                <Group position="right" mt="md">
                  <Button variant="outline" onClick={() => setOpened(false)}>Cancelar</Button>
                  <Button loading={isSubmitting} disabled={isSubmitting} type="submit">Agendar</Button>
                </Group>
              </Stack>
            </form>
          </Modal>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
  async getServerSideProps(ctx) {
    // Get appointments
    const { data: appointmentsData } = await supabaseServerClient(ctx)
      .from('appointments')
      .select(
        'startDate, endDate, patients ( firstName, lastName, phone, email), treatments ( name ), specialists ( firstName, lastName )',
      );

    // Get treatments list
    const { data: treatmentsData } = await supabaseServerClient(ctx)
      .from('treatments')
      .select('id, name');

    // Get specialists list
    const { data: specialistsData } = await supabaseServerClient(ctx)
      .from('specialists')
      .select('id, firstName, lastName, title');

    // Get patients list
    const { data: patientsData } = await supabaseServerClient(ctx)
      .from('patients')
      .select('id, firstName, lastName, phone');

    const appointments = appointmentsData?.map((item) => ({
      treatment: item.treatments.name,
      patient: {
        fullName: `${item.patients.firstName} ${item.patients.lastName}`,
        phone: item.patients.phone,
      },
      specialist: `${item.specialists.firstName} ${item.specialists.lastName}`,
      start: item.startDate,
      end: item.endDate,
    }));

    return {
      props: {
        appointments,
        treatments: treatmentsData,
        specialists: specialistsData,
        patients: patientsData,
      },
    };
  },
});
