import dayjs from 'dayjs';
import {
  ActionIcon,
  Alert,
  Avatar,
  Box,
  Button,
  Group,
  LoadingOverlay,
  Radio,
  Select,
  SelectProps,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
  rem,
} from '@mantine/core';
import { DateInput, DateValue, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconClock, IconInfoCircle, IconTrash, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useSpecialists from '../../../hooks/useSpecialists/useSpecialists';
import useTreatments from '../../../hooks/useTreatments/useTreatments';
import useAppointmentsStates from '../../../hooks/useAppointmentStates/useAppointmentStates';
import { AppointmentsResponse, AppointmentUpdateRequest } from '../../../types/appointment';
import { getAvatarFromFullName } from '../../../utils/getAvatarName';
import {
  getBooleanFromString,
  getErrorMessageForField,
  getStringValueFromBoolean,
} from '../../../utils/forms';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import {
  createNewDate,
  isDateForbidden,
  validateRange,
} from '../AppointmentCreateDrawer/AppointmentCreateDrawer.utils';
import useSupabaseBrowser from '../../../utils/supabase/component';
import { modals } from '@mantine/modals';

interface ModalProps {
  data: AppointmentsResponse;
  onClose: () => void;
}

interface FormValues {
  patient: string;
  patientName: string;
  specialist: string;
  treatment: string;
  notes: string;
  attended: boolean | null;
  state: string;
  startDate: Date;
  endDate: Date;
}

export default function AppointmentsEditDrawer({ data, onClose }: ModalProps) {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();
  // Time range state
  const startTime = dayjs(data.startDate).toDate();
  const endTime = dayjs(data.endDate).toDate();
  const [timeRange, setTimeRange] = useState<[Date, Date]>([startTime, endTime]);
  const [attendance, setAttendance] = useState(() => getStringValueFromBoolean(data.attended));

  //Get data for modal form
  const { data: treatmentsData, status: trStatus } = useTreatments();
  const { data: specialistsData, status: spStatus } = useSpecialists();
  const { data: appointmentStateData, status: apStatus } = useAppointmentsStates();

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

  const [dayValue, setDayValue] = useState<Date>(() => dayjs(data.startDate).toDate());

  // form state
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    values: {
      patient: String(data.patients.id),
      patientName: `${data.patients.firstName} ${data.patients.lastName}`,
      specialist: String(data.specialists.id),
      treatment: String(data.treatments.id),
      notes: data.notes ?? '',
      attended: data.attended,
      state: data.appointments_states ? String(data.appointments_states.id) : '',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });

  const selectedSpecialist = watch('specialist');
  const selectedStartDate = watch('startDate');
  const selectedEndDate = watch('endDate');

  const validateAppointmentTimes = () => {
    const errorMessage = 'Horario no disponible';
    if (selectedSpecialist && specialistsData) {
      let hasErrors = false;
      const targetFromDate = dayjs(selectedStartDate).add(1, 'second').toDate();
      const targetToDate = dayjs(selectedEndDate).add(-1, 'second').toDate();
      const specialist = specialistsData.data.find(
        (item) => item.id === Number(selectedSpecialist),
      );

      const blocks = specialist ? specialist.specialist_blocks.filter((item) => item.enabled) : [];

      const breaks = specialist
        ? specialist.breaks.map((br) => ({
            startDate: createNewDate(
              dayjs().day(br.day_of_week).toDate(),
              br.start_time,
            ).toISOString(),
            endDate: createNewDate(dayjs().day(br.day_of_week).toDate(), br.end_time).toISOString(),
          }))
        : [];

      validateRange(targetFromDate, targetToDate, 'startDate', 'endDate', blocks, (fields) => {
        hasErrors = true;
        fields.forEach((field) => {
          const key = field as keyof FormValues;
          setError(key, { type: 'validate', message: errorMessage });
        });
      });

      validateRange(targetFromDate, targetToDate, 'startDate', 'endDate', breaks, (fields) => {
        hasErrors = true;
        fields.forEach((field) => {
          const key = field as keyof FormValues;
          setError(key, { type: 'validate', message: errorMessage });
        });
      });
      return hasErrors;
    } else {
      return true;
    }
  };

  // Delete appointment mutation
  const editAppointmentMutation = useMutation({
    // mutationFn: (values: AppointmentRequest) => axios.put(`/api/appointments/${data.id}`, values),
    mutationFn: async (values: AppointmentUpdateRequest) => {
      const { error } = await supabase.from('appointments').update(values).eq('id', data.id);

      if (error) throw new Error('Couldnt update the appointment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      // Show success notification
      notifications.show({
        message: 'Se modificó el turno correctamente',
      });
      onClose();
    },
    // Always refetch after error or success:
    onError: () => {
      notifications.show({
        title: 'Error!',
        message: 'No se pudo modificar el turno',
        color: 'red',
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('appointments').delete().eq('id', data.id);

      if (error) throw new Error('Couldnt delete the appointment');

      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });

      // Show success notification
      notifications.show({
        title: 'Exito!',
        message: 'Se elimino el turno correctamente',
      });

      onClose();
    },
    onError: () => {
      // Show error notification
      notifications.show({
        title: 'Hubo un error!',
        message: 'No se pudo eliminar el turno',
      });
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
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
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
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const hasRangeErrors = validateAppointmentTimes();
    if (!hasRangeErrors) handleSubmitForm(data);
  };

  const handleDeleteAppointment = () => {
    modals.openConfirmModal({
      title: 'Eliminar el turno',
      children: <Text size="sm">Esta seguro? Esta accion no es reversible</Text>,
      centered: true,
      labels: { confirm: 'Eliminar turno', cancel: 'Cancelar' },
      confirmProps: { color: 'red', loading: deleteAppointmentMutation.isPending },
      onConfirm: () => deleteAppointmentMutation.mutateAsync(),
    });
  };

  if (spStatus === 'pending' || trStatus === 'pending' || apStatus === 'pending')
    return (
      <Box pos="relative" w="100%" h="calc(100dvh - 96px)">
        <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      </Box>
    );

  if (spStatus === 'error' || trStatus === 'error' || apStatus === 'error')
    return (
      <Alert variant="light" color="red" title="Hubo un error!" icon={<IconInfoCircle />}>
        Intente nuevamente en un instante. Si el error persiste, contacte al soporte
      </Alert>
    );

  return (
    <>
      {/* Modal content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Group justify="space-between">
            <Group>
              <Title order={2} fz="lg">
                Editar turno
              </Title>
              <Tooltip label="Eliminar turno" title="Eliminar turno">
                <ActionIcon variant="light" size="sm" color="red" onClick={handleDeleteAppointment}>
                  <IconTrash />
                </ActionIcon>
              </Tooltip>
            </Group>
            <ActionIcon variant="transparent" size="sm" color="dark" onClick={onClose}>
              <IconX />
            </ActionIcon>
          </Group>
          <TextInput
            {...register('patientName', { required: true })}
            label="Paciente"
            disabled
            miw={240}
          />
          <Controller
            name="treatment"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Tratamiento"
                data={treatmentsData.data.map((item) => ({
                  value: `${item.id}`,
                  label: item.name,
                }))}
              />
            )}
          />
          <Controller
            name="specialist"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Profesional"
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
          <Group align="flex-start">
            <DateInput
              label="Fecha"
              locale="es"
              value={dayValue}
              onChange={(value) => {
                handleDayChange(value);
                if (value) {
                  setValue(
                    'startDate',
                    createNewDate(value, dayjs(selectedStartDate).format('HH:mm')),
                    {
                      shouldDirty: true,
                    },
                  );
                  setValue(
                    'endDate',
                    createNewDate(value, dayjs(selectedEndDate).format('HH:mm')),
                    {
                      shouldDirty: true,
                    },
                  );
                }
              }}
              excludeDate={(date) => {
                const specialist = specialistsData.data.find(
                  (item) => item.id === Number(selectedSpecialist),
                );

                const blocks = specialist
                  ? specialist.specialist_blocks.filter((item) => item.enabled)
                  : [];

                return !selectedSpecialist || !specialist || isDateForbidden(date, blocks);
              }}
            />
            <Controller
              name="startDate"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TimeInput
                  {...field}
                  disabled={!selectedSpecialist}
                  error={getErrorMessageForField(errors.startDate)}
                  label="Desde"
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
              rules={{
                required: true,
                validate: () => {
                  const from = dayjs(selectedStartDate);
                  const to = dayjs(selectedEndDate);
                  return (
                    (!to.isSame(from, 'second') && !to.isBefore(from, 'second')) ||
                    'Fecha hasta debe ser mayor a inicio'
                  );
                },
              }}
              render={({ field }) => (
                <TimeInput
                  {...field}
                  label="Hasta"
                  disabled={!selectedSpecialist}
                  error={getErrorMessageForField(errors.endDate)}
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
          <Textarea
            label="Notas"
            minRows={2}
            maxRows={4}
            placeholder="Notas internas del paciente"
            {...register('notes')}
          />
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
          <Group justify="right">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button loading={editAppointmentMutation.isPending} disabled={!isDirty} type="submit">
              Actualizar
            </Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}
