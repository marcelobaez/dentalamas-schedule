import {
  ActionIcon,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Grid,
  Group,
  Loader,
  Radio,
  Select,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { Calendar, TimeRangeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { IconCheck, IconClock, IconUserPlus } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { forwardRef, useState } from 'react';
import useAppointmentsStates from '../../../hooks/useAppointmentStates/useAppointmentStates';
import { useIsMobile } from '../../../hooks/useIsMobile/useIsMobile';
import useSpecialists from '../../../hooks/useSpecialists/useSpecialists';
import useTreatments from '../../../hooks/useTreatments/useTreatments';
import { AppoinmentFormValues, AppointmentsResponse } from '../../../types/appointment';
import { Patient } from '../../../types/patient';
import { getBooleanFromString } from '../../../utils/forms';
import { getAvatarFromFullName } from '../../../utils/getAvatarName';

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

interface ModalProps {
  onClose: () => void;
  onCreatePatient: () => void;
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

export default function AppointmentsCreateModal({ onClose, onCreatePatient }: ModalProps) {
  const queryClient = useQueryClient();
  const [emptyResults, setEmptyResults] = useState(false);
  const isMobile = useIsMobile();
  const [attendance, setAttendance] = useState('');
  // Time range state
  const now = new Date();
  const startTime = dayjs(now).add(1, 'hour').startOf('hour').toDate();
  const endTime = dayjs(startTime).add(30, 'minutes').toDate();
  const [timeRange, setTimeRange] = useState<[Date, Date]>([startTime, endTime]);

  // State for autocomplete
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 200, { leading: true });

  //Get data for modal form
  const { data: treatmentsData, isLoading: isLoadingTreatments } = useTreatments();
  const { data: specialistsData, isLoading: isLoadingSpecialist } = useSpecialists();
  const { data: appointmentStateData, isLoading: isLoadingAppointmentsStates } =
    useAppointmentsStates();

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

  const form = useForm<AppoinmentFormValues>({
    initialValues: {
      patient: '',
      specialist: '1',
      treatment: '1',
      notes: '',
      attended: null,
      state: '2',
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
          icon: <IconCheck />,
        });
        form.reset();
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(['appointments']);
        onClose();
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
      notes: values.notes,
      attended: values.attended,
      state_id: parseInt(values.state),
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

  return (
    <>
      {/* Modal content */}
      {(isLoadingSpecialist || isLoadingTreatments || isLoadingAppointmentsStates) && <Loader />}
      {treatmentsData && specialistsData && appointmentStateData && (
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
                    onClick={() => onCreatePatient()}
                    size="lg"
                    color="blue"
                    variant="transparent"
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
                  // format="12"
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
                <Textarea label="Notas" minRows={2} maxRows={4} {...form.getInputProps('notes')} />
                <Radio.Group
                  value={attendance}
                  onChange={(value: string) => {
                    form.setFieldValue('attended', getBooleanFromString(value));
                    setAttendance(value);
                  }}
                  label="Asistio"
                >
                  <Radio value="SI" label="Si" />
                  <Radio value="NO" label="No" />
                </Radio.Group>
                <Select
                  label="Estado"
                  {...form.getInputProps('state')}
                  placeholder="Seleccione el estado"
                  onChange={(value: string) => form.setFieldValue('state', value)}
                  data={appointmentStateData.map((item) => ({
                    value: `${item.id}`,
                    label: item.name,
                  }))}
                />
              </Stack>
            </Grid.Col>
            <Grid.Col span={12}>
              <Group position="right">
                <Button variant="outline" onClick={() => onClose()}>
                  Cancelar
                </Button>
                <Button loading={isMutating} type="submit">
                  Agendar
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      )}
    </>
  );
}
