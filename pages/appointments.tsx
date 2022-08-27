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
  Grid,
  Title,
  Loader,
  Autocomplete,
  AutocompleteItem,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { Calendar, TimeRangeInput } from '@mantine/dates';
import { supabaseClient, supabaseServerClient, withPageAuth } from '@supabase/auth-helpers-nextjs';
import { IconClock, IconPlus, IconUserPlus } from '@tabler/icons';
import { DateTime } from 'luxon';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import PatientsCreateModal from '../components/features/PatientsCreateModal/PatientsCreateModal';
import 'dayjs/locale/es';
import {
  dehydrate,
  QueryClient,
  useQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import useAppointments from '../hooks/useAppointments/useAppointments';
import useTreatments from '../hooks/useTreatments/useTreatments';
import useSpecialists from '../hooks/useSpecialists/useSpecialists';
import { AppointmentsResponse } from '../types/appointment';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { Patient } from '../types/patient';
import { getAvatarFromFullName } from '../utils/getAvatarName';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
  group?: string;
}

interface AppointmentRequest {
  startDate: Date;
  endDate: Date;
  patient_id: number;
  treatment_id: number;
  specialist_id: number;
}

const EXISTING_USERS = 'Pacientes encontrados';

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        {image.length > 0 ? (
          <Avatar src={image} />
        ) : (
          <Avatar color="cyan" radius={'xl'}>
            {getAvatarFromFullName(label)}
          </Avatar>
        )}
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

SelectItem.displayName = 'SelectItem';

export default function Appointments() {
  const queryClient = useQueryClient();
  const [opened, setOpened] = useState(false);
  const [patientsOpened, setPatientsModalOpen] = useState(false);
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments();
  const [emptyResults, setEmptyResults] = useState(false);

  const isMobile = useMediaQuery('(max-width: 600px)', true, { getInitialValueInEffect: false });

  //Get data for modal form
  const { data: treatmentsData, isLoading: isLoadingTreatments } = useTreatments();
  const { data: specialistsData, isLoading: isLoadingSpecialist } = useSpecialists();

  // Time range state
  const now = new Date();
  const startTime = dayjs(now).add(1, 'hour').startOf('hour').toDate();
  const endTime = dayjs(startTime).add(30, 'minutes').toDate();
  const [timeRange, setTimeRange] = useState<[Date, Date]>([startTime, endTime]);

  // State for autocomplete
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 200, { leading: true });

  // Search query
  const { data: searchResults, isFetching } = useQuery<Patient[]>(
    ['searchPatients', debounced],
    async () => {
      const { data, error } = await supabaseClient
        .from('patients')
        .select('id, firstName, lastName, email, phone')
        .ilike('lastName', `%${debounced}%`);

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return data;
    },
    {
      enabled: Boolean(debounced),
      onSuccess: (data) => {
        data.length === 0 && setEmptyResults(true);
      },
    },
  );

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

  // Create appointment mutation
  const { mutate, isLoading: isMutating } = useMutation(
    (values) => axios.post('/api/appointments', values),
    {
      onSuccess: (newAppointment: AppointmentsResponse, values: AppointmentRequest) => {
        queryClient.setQueryData(['appointments'], newAppointment);
        // Show success notification
        showNotification({
          title: 'Exito!',
          message: 'Se agendo el turno correctamente',
          color: 'green',
        });
        form.reset();
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(['appointments']);
        setOpened(false);
      },
    },
  );

  // form submission handler
  const handleSubmit = async (values: FormValues) => {
    const formData = {
      startDate: timeRange[0],
      endDate: timeRange[1],
      patient_id: parseInt(values.patient),
      treatment_id: parseInt(values.treatment),
      specialist_id: parseInt(values.specialist),
    };

    mutate(formData);
  };

  const handleDayChange = (value: Date) => {
    // Create new ranges based on new selected day, maintaining selected hour and minutes
    const newStartTime = dayjs(value)
      .hour(dayjs(timeRange[0]).get('hour'))
      .minute(dayjs(timeRange[0]).get('minute'))
      .toDate();
    const newEndTime = dayjs(value)
      .hour(dayjs(timeRange[1]).get('hour'))
      .minute(dayjs(timeRange[1]).get('minute'))
      .toDate();

    setDayValue(value);
    setTimeRange([newStartTime, newEndTime]);
  };

  const handleTimeRangechange = (value: [Date, Date]) => {
    // Set ranges to selected day in calendar (by default this control uses 'today')
    const prevstartHourAndMinute = [dayjs(value[0]).get('hour'), dayjs(value[0]).get('minute')];
    const prevendHourAndMinute = [dayjs(value[1]).get('hour'), dayjs(value[1]).get('minute')];

    setTimeRange([
      dayjs(dayValue).hour(prevstartHourAndMinute[0]).minute(prevstartHourAndMinute[1]).toDate(),
      dayjs(dayValue).hour(prevendHourAndMinute[0]).minute(prevendHourAndMinute[1]).toDate(),
    ]);
  };

  const createPatientsData = () => {
    let patientsList: AutocompleteItem[] = [];
    if (searchResults) {
      patientsList = searchResults.map((item) => ({
        value: `${item.firstName} ${item.lastName}`,
        label: `${item.firstName} ${item.lastName}`,
        image: '',
        description: item.phone,
        group: EXISTING_USERS,
        patient_id: item.id,
      }));
    }

    return patientsList;
  };

  if (isLoadingAppointments)
    return (
      <Group position="center">
        <Paper>
          <Loader size={'xl'} />
        </Paper>
      </Group>
    );

  return (
    <Grid>
      <Grid.Col span={12}>
        <Group position="apart">
          <Text weight={600} size={'xl'}>
            Turnos
          </Text>
          <Button leftIcon={<IconPlus />} onClick={() => setOpened(true)}>
            Nuevo turno
          </Button>
        </Group>
      </Grid.Col>
      <Grid.Col span={12}>
        <Paper shadow="xs" p="xs">
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
              <tbody>
                {/* Render rows */}
                {!isLoadingAppointments && appointmentsData && appointmentsData.length > 0 ? (
                  appointmentsData.map((item, idx) => (
                    <tr key={`treat-row-${idx}`}>
                      <td>
                        <Badge color="yellow">
                          {new Date(item.startDate).toLocaleString('es-AR', {
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Badge>
                      </td>
                      <td>
                        <Text size="sm">
                          <Badge radius="xs">{`${new Date(item.startDate).toLocaleString(
                            'es-AR',
                            DateTime.TIME_SIMPLE,
                          )} - ${new Date(item.endDate).toLocaleString(
                            'es-AR',
                            DateTime.TIME_SIMPLE,
                          )}`}</Badge>
                        </Text>
                      </td>
                      <td>
                        <Text size="sm">{item.patients.firstName}</Text>
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
                            {item.specialists.firstName}
                          </Text>
                        </Group>
                      </td>
                      <td>
                        <Text size="sm">{item.treatments.name}</Text>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>
                      <Text size="md">Aun no se agendaron turnos</Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </ScrollArea>
          <Modal
            size={isMobile ? '100%' : '55%'}
            opened={opened}
            centered
            onClose={() => setOpened(false)}
            title={
              <Text size="md" weight={600}>
                Ingresar nuevo turno
              </Text>
            }
          >
            {/* Modal content */}
            {isLoadingSpecialist || (isLoadingTreatments && <Loader />)}
            {appointmentsData && treatmentsData && specialistsData && (
              <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Grid>
                    <Grid.Col sm={12} md={6}>
                      <Group align={'end'}>
                        <Autocomplete
                          itemComponent={SelectItem}
                          value={value}
                          maxDropdownHeight={400}
                          data={createPatientsData()}
                          onChange={setValue}
                          rightSection={isFetching ? <Loader size={16} /> : null}
                          label="Paciente"
                          nothingFound={emptyResults ? 'No se encontraron pacientes' : ''}
                          placeholder="Busque por apellido del paciente"
                          filter={(value, item) => true}
                          onItemSubmit={(item: AutocompleteItem) =>
                            form.setFieldValue('patient', item.patient_id)
                          }
                          required
                          sx={() => ({
                            minWidth: '240px',
                          })}
                        />
                        <Tooltip label="Registrar nuevo paciente">
                          <ActionIcon
                            onClick={() => setPatientsModalOpen(true)}
                            size="lg"
                            color="blue"
                            variant="outline"
                          >
                            <IconUserPlus />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Grid.Col>
                    <Grid.Col sm={12} md={6}>
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
                        data={specialistsData.map((item) => ({
                          value: `${item.id}`,
                          label: `${item.firstName} ${item.lastName}`,
                          image: '',
                          description: item.title,
                        }))}
                      />
                    </Grid.Col>
                    <Grid.Col sm={12} md={6}>
                      <Text size="sm" weight={500}>
                        Elija el dia
                      </Text>
                      <Calendar
                        excludeDate={(date) => date.getDay() === 0}
                        minDate={new Date()}
                        locale="es"
                        value={dayValue}
                        onChange={handleDayChange}
                      />
                    </Grid.Col>
                    <Grid.Col sm={12} md={6}>
                      <Stack>
                        <TimeRangeInput
                          icon={<IconClock size={16} />}
                          // error="Debe indicar un rango valido"
                          required
                          label="Horario"
                          value={timeRange}
                          onChange={handleTimeRangechange}
                          format="12"
                        />
                        <Select
                          label="Motivo"
                          placeholder="Motivo"
                          {...form.getInputProps('treatment')}
                          onChange={(value: string) => form.setFieldValue('treatment', value)}
                          data={treatmentsData.map((item) => ({
                            value: `${item.id}`,
                            label: item.name,
                          }))}
                        />
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Group position="right">
                        <Button variant="outline" onClick={() => setOpened(false)}>
                          Cancelar
                        </Button>
                        <Button loading={isMutating} disabled={isMutating} type="submit">
                          Agendar
                        </Button>
                      </Group>
                    </Grid.Col>
                  </Grid>
              </form>
            )}
          </Modal>
        </Paper>
      </Grid.Col>
      <PatientsCreateModal opened={patientsOpened} handleModalState={setPatientsModalOpen} />
    </Grid>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
  async getServerSideProps(ctx) {
    // Get appointments
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(['appointments'], async () => {
      const { data, error } = await supabaseServerClient(ctx)
        .from<AppointmentsResponse>('appointments')
        .select(
          'startDate, endDate, patients ( firstName, lastName, phone, email), treatments ( name ), specialists ( firstName, lastName )',
        );

      if (error) throw new Error(`${error.message}: ${error.details}`);

      return data;
    });

    await queryClient.prefetchQuery(['treatments'], async () => {
      // Get treatments list
      const { data, error } = await supabaseServerClient(ctx).from('treatments').select('id, name');

      if (error) throw new Error(`${error.message}: ${error.details}`);

      return data;
    });

    await queryClient.prefetchQuery(['specialists'], async () => {
      // Get treatments list
      const { data, error } = await supabaseServerClient(ctx)
        .from('specialists')
        .select('id, firstName, lastName, title');

      if (error) throw new Error(`${error.message}: ${error.details}`);

      return data;
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  },
});
