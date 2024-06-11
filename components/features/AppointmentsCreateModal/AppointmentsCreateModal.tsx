import {
  ActionIcon,
  Avatar,
  Button,
  CloseButton,
  Combobox,
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
  Tooltip,
  rem,
  useCombobox,
} from '@mantine/core';
import { DatePicker, DateValue, TimeInput } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconClock, IconUserPlus } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';
import useAppointmentsStates from '../../../hooks/useAppointmentStates/useAppointmentStates';
import useSpecialists from '../../../hooks/useSpecialists/useSpecialists';
import useTreatments from '../../../hooks/useTreatments/useTreatments';
import { AppointmentsResponse } from '../../../types/appointment';
import { getBooleanFromString } from '../../../utils/forms';
import { getAvatarFromFullName } from '../../../utils/getAvatarName';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import useSupabaseBrowser from '../../../utils/supabase/component';

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

type FormValues = {
  patient: string;
  specialist: string;
  treatment: string;
  notes: string;
  attended: boolean | null;
  state: string;
  startDate: Date;
  endDate: Date;
};

interface ModalProps {
  onClose: () => void;
  onCreatePatient: () => void;
  initialRange?: [Date, Date];
}

const EXISTING_USERS = 'Pacientes encontrados';

export function createNewDate(existingDate: Date, timeString: string) {
  // Parse the hour and minute from the time string
  const [hour, minute] = timeString.split(':').map(Number);

  // Create a new dayjs object from the existing date
  let newDate = dayjs(existingDate);

  // Set the hour and minute
  newDate = newDate.hour(hour).minute(minute);

  // Return the new date
  return newDate.toDate();
}

function SelectOption({ image, label, description }: ItemProps) {
  return (
    <Group wrap="nowrap">
      {image.length > 0 ? (
        <Avatar src={image} />
      ) : (
        <Avatar color="cyan" radius={'xl'}>
          {getAvatarFromFullName(label)}
        </Avatar>
      )}
      <div>
        <Text size="sm">{label}</Text>
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      </div>
    </Group>
  );
}

export default function AppointmentsCreateModal({
  onClose,
  onCreatePatient,
  initialRange,
}: ModalProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const queryClient = useQueryClient();
  const [emptyResults, setEmptyResults] = useState(false);
  const [attendance, setAttendance] = useState('');
  // Time range state
  const now = new Date();
  const startTime = initialRange
    ? initialRange[0]
    : dayjs(now).add(1, 'hour').startOf('hour').toDate();
  const endTime = initialRange ? initialRange[1] : dayjs(startTime).add(30, 'minutes').toDate();
  const [timeRange, setTimeRange] = useState<[Date, Date]>([startTime, endTime]);

  // State for autocomplete
  const [comboValue, setComboValue] = useState('');
  const [debounced] = useDebouncedValue(comboValue, 200, { leading: true });

  //Get data for modal form
  const {
    data: treatmentsData,
    status: isLoadingTreatments,
    isError: isTreatmentError,
  } = useTreatments();
  const {
    data: specialistsData,
    status: isLoadingSpecialist,
    isError: isSpecialistError,
  } = useSpecialists();
  const {
    data: appointmentStateData,
    status: isLoadingAppointmentsStates,
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

  const supabase = useSupabaseBrowser();

  // Search query
  const { data: searchResults, isFetching } = useQuery({
    queryKey: ['searchPatients', debounced],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, firstName, lastName, email, phone')
        .ilike('lastName', `%${debounced}%`);

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return data;
    },
    enabled: Boolean(debounced),
  });

  // data.length === 0 && setEmptyResults(true);

  const [dayValue, setDayValue] = useState<Date>(initialRange ? initialRange[0] : new Date());

  // form state
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      patient: '',
      specialist: '1',
      treatment: '1',
      notes: '',
      attended: null,
      state: '2',
      startDate: timeRange[0],
      endDate: timeRange[1],
    },
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (values) => axios.post('/api/appointments', values),
    onSuccess: (newAppointment: AppointmentsResponse, values: AppointmentRequest) => {
      queryClient.setQueryData(['appointments'], newAppointment);
      // Show success notification
      showNotification({
        title: 'Exito!',
        message: 'Se agendo el turno correctamente',
        color: 'green',
        icon: <IconCheck />,
      });
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
  });

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

    createAppointmentMutation.mutate(formData);
  };

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

  const options = (searchResults || []).map((item) => (
    <Combobox.Option value={String(item.id)} key={item.id}>
      <SelectOption
        image=""
        label={`${item.firstName} ${item.lastName}`}
        description={item.phone}
      />
    </Combobox.Option>
  ));

  const onSubmit: SubmitHandler<FormValues> = (data) => handleSubmitForm(data);

  const findPatient = (id: number) => {
    const foundItem = searchResults?.find((item) => item.id === id);
    if (foundItem) {
      setComboValue(`${foundItem.firstName} ${foundItem.lastName}`);
    }
  };

  if (
    isLoadingSpecialist === 'pending' ||
    isLoadingTreatments === 'pending' ||
    isLoadingAppointmentsStates === 'pending'
  )
    return <Loader />;

  if (isTreatmentError || isSpecialistError || isStatesError) return <div>Error...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid>
        <Grid.Col span={{ sm: 12, md: 6 }}>
          <Group align={'end'} justify="space-between" grow>
            <Combobox
              onOptionSubmit={(optionValue) => {
                setValue('patient', optionValue, { shouldDirty: true });
                findPatient(parseInt(optionValue));
                combobox.closeDropdown();
              }}
              withinPortal={false}
              store={combobox}
            >
              <Combobox.Target>
                <TextInput
                  {...register('patient', { required: true })}
                  label="Paciente"
                  placeholder="Busque por apellido del paciente"
                  error={errors.patient ? 'Campo requerido' : null}
                  rightSection={
                    isFetching ? (
                      <Loader size={16} />
                    ) : comboValue !== null ? (
                      <CloseButton
                        size="sm"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setComboValue('')}
                        aria-label="Limpiar"
                      />
                    ) : null
                  }
                  value={comboValue}
                  onChange={(event) => {
                    setComboValue(event.currentTarget.value);
                    combobox.resetSelectedOption();
                    combobox.openDropdown();
                  }}
                  onClick={() => combobox.openDropdown()}
                  onBlur={() => combobox.closeDropdown()}
                  miw={240}
                />
              </Combobox.Target>

              <Combobox.Dropdown hidden={!searchResults}>
                <Combobox.Options>
                  {options}
                  {emptyResults && <Combobox.Empty>No se encontraron pacientes</Combobox.Empty>}
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
            <Tooltip label="Registrar nuevo paciente">
              <ActionIcon onClick={() => onCreatePatient()} size="lg" variant="transparent">
                <IconUserPlus />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ sm: 12, md: 6 }}>
          <Controller
            name="specialist"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                {...field}
                label="Especialista"
                placeholder="Especialista"
                renderOption={renderSelectOption}
                maxDropdownHeight={400}
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
              size="md"
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
                setValue('attended', getBooleanFromString(value), { shouldDirty: true });
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
            <Button variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button loading={createAppointmentMutation.isPending} disabled={!isDirty} type="submit">
              Agendar
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </form>
  );
}
