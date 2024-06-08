import axios from 'axios';
import dayjs from 'dayjs';
import {
  Avatar,
  Button,
  Grid,
  Group,
  Loader,
  Radio,
  Select,
  SelectProps,
  Stack,
  Text,
  TextInput,
  Textarea,
  rem,
} from '@mantine/core';
import { DatePicker, DateValue, TimeInput } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { IconClock, IconCheck } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useSpecialists from '../../../hooks/useSpecialists/useSpecialists';
import useTreatments from '../../../hooks/useTreatments/useTreatments';
import useAppointmentsStates from '../../../hooks/useAppointmentStates/useAppointmentStates';
import { AppointmentsResponse, AppointmentRequest } from '../../../types/appointment';
import { getAvatarFromFullName } from '../../../utils/getAvatarName';
import { useModals } from '@mantine/modals';
import { getBooleanFromString, getStringValueFromBoolean } from '../../../utils/forms';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { createNewDate } from '../AppointmentsCreateModal/AppointmentsCreateModal';

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

interface FormValues {
  patient: string;
  specialist: string;
  treatment: string;
  notes: string;
  attended: boolean | null;
  state: string;
  startDate: Date;
  endDate: Date;
}

export default function AppointmentsEditModal({ data }: ModalProps) {
  const queryClient = useQueryClient();
  // Time range state
  const startTime = dayjs(data.startDate).toDate();
  const endTime = dayjs(data.endDate).toDate();
  const [timeRange, setTimeRange] = useState<[Date, Date]>([startTime, endTime]);
  const [attendance, setAttendance] = useState(() => getStringValueFromBoolean(data.attended));

  //Get data for modal form
  const {
    data: treatmentsData,
    isLoading: isLoadingTreatments,
    isError: isTreatmentError,
  } = useTreatments();
  const {
    data: specialistsData,
    isLoading: isLoadingSpecialist,
    isError: isSpecialistError,
  } = useSpecialists();
  const {
    data: appointmentStateData,
    isLoading: isLoadingAppointmentsStates,
    isError: isStatesError,
  } = useAppointmentsStates();

  const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
    <Group wrap="nowrap">
      <Avatar color="cyan" radius={'xl'}>
        {getAvatarFromFullName(`${option.label}`)}
      </Avatar>
      <div>
        <Text size="sm">{option.label}</Text>
        <Text size="xs" c="dimmed">
          {specialistsData?.data.find((sp) => sp.id === parseInt(option.value))?.title}
        </Text>
      </div>
    </Group>
  );

  const modals = useModals();

  const [dayValue, setDayValue] = useState<Date>(() => dayjs(data.startDate).toDate());

  // form state
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { isDirty },
  } = useForm<FormValues>({
    values: {
      patient: String(data.patients.id),
      specialist: String(data.specialists.id),
      treatment: String(data.treatments.id),
      notes: data.notes ?? '',
      attended: data.attended,
      state: data.appointments_states ? String(data.appointments_states.id) : '',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });

  // Edit appointment mutation
  const editAppointmentMutation = useMutation({
    mutationFn: (values) => axios.put(`/api/appointments/${data.id}`, values),
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
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      modals.closeModal('appointmentsEditModal');
    },
  });

  const handleDayChange = (value: DateValue) => {
    // Create new ranges based on new selected day, maintaining selected hour and minutes
    const newStartTime = dayjs(value)
      .hour(dayjs(timeRange[0]).get('hour'))
      .minute(dayjs(timeRange[0]).get('minute'))
      .toDate();
    const newEndTime = dayjs(value)
      .hour(dayjs(timeRange[1]).get('hour'))
      .minute(dayjs(timeRange[1]).get('minute'))
      .toDate();

    setDayValue(value || new Date());
    setTimeRange([newStartTime, newEndTime]);
  };

  // form submission handler
  const handleSubmitForm = async (values: FormValues) => {
    const formData = {
      startDate: values.startDate,
      endDate: values.endDate,
      patient_id: parseInt(values.patient),
      treatment_id: parseInt(values.treatment),
      specialist_id: parseInt(values.specialist),
      notes: values.notes,
      attended: values.attended,
      state_id: parseInt(values.state),
    };

    editAppointmentMutation.mutate(formData);
  };

  // form submit
  const onSubmit: SubmitHandler<FormValues> = (data) => handleSubmitForm(data);

  if (isLoadingSpecialist || isLoadingTreatments || isLoadingAppointmentsStates) return <Loader />;

  if (isTreatmentError || isSpecialistError || isStatesError) return <div>Error...</div>;

  return (
    <>
      {/* Modal content */}
      {(isLoadingSpecialist || isLoadingTreatments || isLoadingAppointmentsStates) && <Loader />}
      {treatmentsData && specialistsData && appointmentStateData && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid>
            <Grid.Col span={{ sm: 12, md: 6 }}>
              <Group align={'end'}>
                <TextInput
                  {...register('patient', { required: true })}
                  value={`${data.patients.firstName} ${data.patients.lastName}`}
                  label="Paciente"
                  disabled
                  miw={240}
                />
              </Group>
            </Grid.Col>
            <Grid.Col span={{ sm: 12, md: 6 }}>
              <Controller
                name="specialist"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Especialista"
                    placeholder="Especialista"
                    renderOption={renderSelectOption}
                    maxDropdownHeight={400}
                    nothingFoundMessage="Sin resultados"
                    data={specialistsData.data.map((item) => ({
                      value: `${item.id}`,
                      label: `${item.firstName} ${item.lastName}`,
                    }))}
                  />
                )}
              />
            </Grid.Col>
            <Grid.Col span={{ sm: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Elija el dia
                </Text>
                <DatePicker
                  excludeDate={(date) => date.getDay() === 0}
                  // minDate={new Date()}
                  locale="es"
                  value={dayValue}
                  onChange={handleDayChange}
                />
                <Group>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TimeInput
                        {...field}
                        label="Hora Inicio"
                        required
                        value={dayjs(field.value).format('HH:mm')}
                        onChange={(e) => {
                          setValue('startDate', createNewDate(dayValue, e.currentTarget.value), {
                            shouldDirty: true,
                          });
                        }}
                        leftSection={
                          <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                        }
                      />
                    )}
                  />
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TimeInput
                        {...field}
                        label="Hora Fin"
                        required
                        value={dayjs(field.value).format('HH:mm')}
                        onChange={(e) => {
                          setValue('endDate', createNewDate(dayValue, e.currentTarget.value), {
                            shouldDirty: true,
                          });
                        }}
                        leftSection={
                          <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                        }
                      />
                    )}
                  />
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ sm: 12, md: 6 }}>
              <Stack>
                <Controller
                  name="treatment"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Motivo"
                      placeholder="Motivo"
                      data={treatmentsData.map((item) => ({
                        value: `${item.id}`,
                        label: item.name,
                      }))}
                    />
                  )}
                />
                <Textarea label="Notas" minRows={2} maxRows={4} {...register('notes')} />
                <Radio.Group
                  value={attendance}
                  onChange={(value: string) => {
                    setValue('attended', getBooleanFromString(value), {
                      shouldDirty: true,
                    });
                    setAttendance(value);
                  }}
                  label="Asistio"
                >
                  <Group mt="xs">
                    <Radio value="SI" label="Si" />
                    <Radio value="NO" label="No" />
                  </Group>
                </Radio.Group>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Estado"
                      placeholder="Seleccione el estado"
                      data={appointmentStateData.map((item) => ({
                        value: `${item.id}`,
                        label: item.name,
                      }))}
                    />
                  )}
                />
              </Stack>
            </Grid.Col>
            <Grid.Col span={12}>
              <Group justify="right">
                <Button
                  variant="outline"
                  onClick={() => modals.closeModal('appointmentsEditModal')}
                >
                  Cancelar
                </Button>
                <Button
                  loading={editAppointmentMutation.isPending}
                  disabled={!isDirty}
                  type="submit"
                >
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
