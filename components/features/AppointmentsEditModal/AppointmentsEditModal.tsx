import axios from 'axios';
import dayjs from 'dayjs';
import {
  ActionIcon,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Checkbox,
  Grid,
  Group,
  Loader,
  Modal,
  Radio,
  Select,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { Calendar, TimeRangeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconClock, IconCheck } from '@tabler/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forwardRef, useEffect, useState } from 'react';
import useSpecialists from '../../../hooks/useSpecialists/useSpecialists';
import useTreatments from '../../../hooks/useTreatments/useTreatments';
import useAppointmentsStates from '../../../hooks/useAppointmentStates/useAppointmentStates';
import { AppointmentsResponse, AppointmentRequest } from '../../../types/appointment';
import { getAvatarFromFullName } from '../../../utils/getAvatarName';
import { useModals } from '@mantine/modals';
import { getBooleanFromString, getStringValueFromBoolean } from '../../../utils/forms';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
  group?: string;
}

interface ModalProps {
  data: AppointmentsResponse;
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

interface FormValues {
  patient: string;
  specialist: string;
  treatment: string;
  notes: string;
  attended: boolean | null;
  state: string;
}

export default function AppointmentsEditModal({ data }: ModalProps) {
  const queryClient = useQueryClient();
  // Time range state
  const startTime = dayjs(data.startDate).toDate();
  const endTime = dayjs(data.endDate).toDate();
  const [timeRange, setTimeRange] = useState<[Date, Date]>([startTime, endTime]);
  const [attendance, setAttendance] = useState(() => getStringValueFromBoolean(data.attended));

  // State for autocomplete
  const [value, setValue] = useState(`${data.patients.firstName} ${data.patients.lastName}`);

  //Get data for modal form
  const { data: treatmentsData, isLoading: isLoadingTreatments } = useTreatments();
  const { data: specialistsData, isLoading: isLoadingSpecialist } = useSpecialists();
  const { data: appointmentStateData, isLoading: isLoadingAppointmentsStates } =
    useAppointmentsStates();

  const modals = useModals();

  const [dayValue, setDayValue] = useState<Date>(() => dayjs(data.startDate).toDate());

  const form = useForm<FormValues>({
    initialValues: {
      patient: '',
      specialist: '',
      treatment: '',
      notes: '',
      attended: null,
      state: '',
    },
  });

  useEffect(
    () =>
      form.setValues({
        patient: String(data.patients.id),
        specialist: String(data.specialists.id),
        treatment: String(data.treatments.id),
        notes: data.notes ?? '',
        attended: data.attended,
        state: data.appointments_states ? String(data.appointments_states.id) : '',
      }),
    [data],
  );

  // Create appointment mutation
  const { mutate, isLoading: isMutating } = useMutation(
    (values) => axios.put(`/api/appointments/${data.id}`, values),
    {
      onSuccess: (newAppointment: AppointmentsResponse, values: AppointmentRequest) => {
        queryClient.setQueryData(['appointments'], newAppointment);
        // Show success notification
        showNotification({
          title: 'Exito!',
          message: 'Se modificó el turno correctamente',
          color: 'green',
          icon: <IconCheck />,
        });
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(['appointments']);
        modals.closeModal('appointmentsEditModal');
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
                  data={[
                    {
                      value: `${data.patients.firstName} ${data.patients.lastName}`,
                      label: `${data.patients.firstName} ${data.patients.lastName}`,
                      image: '',
                      description: data.patients.phone,
                      group: EXISTING_USERS,
                      patient_id: data.patients.id,
                    },
                  ]}
                  onChange={setValue}
                  label="Paciente"
                  placeholder="Busque por apellido del paciente"
                  filter={(value, item) => true}
                  disabled
                  onItemSubmit={(item: AutocompleteItem) =>
                    form.setFieldValue('patient', item.patient_id)
                  }
                  required
                  sx={() => ({
                    minWidth: '240px',
                  })}
                />
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
                // minDate={new Date()}
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
                <Button
                  variant="outline"
                  onClick={() => modals.closeModal('appointmentsEditModal')}
                >
                  Cancelar
                </Button>
                <Button loading={isMutating} type="submit">
                  Actualizar
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      )}
    </>
  );
}
