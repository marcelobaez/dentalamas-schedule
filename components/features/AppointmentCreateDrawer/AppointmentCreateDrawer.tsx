import {
  Avatar,
  Button,
  Group,
  Stack,
  Stepper,
  Text,
  Loader,
  Select,
  SelectProps,
  rem,
  Textarea,
  ComboboxItem,
  OptionsFilter,
} from '@mantine/core';
import useTreatments from '../../../hooks/useTreatments/useTreatments';
import useSpecialists from '../../../hooks/useSpecialists/useSpecialists';
import useAppointmentsStates from '../../../hooks/useAppointmentStates/useAppointmentStates';
import useSupabaseBrowser from '../../../utils/supabase/component';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { getAvatarFromFullName } from '../../../utils/getAvatarName';
import { useDebouncedValue } from '@mantine/hooks';
import { useState } from 'react';
import { DateInput, DateValue, TimeInput } from '@mantine/dates';
import { IconClock, IconUserCheck, IconUserPlus } from '@tabler/icons-react';
import {
  AppointmentRequest,
  FormValues,
  createNewDate,
  isDateForbidden,
  validateRange,
} from './AppointmentCreateDrawer.utils';
import { getErrorMessageForField } from '../../../utils/forms';
import { modals } from '@mantine/modals';
import { Tables } from '../../../types/supabase';
import { PatientInfo } from '../../PatientInfo/PatientInfo';
import StethoscopeIcon from '../../assets/icons/StethoscopeIcon';

export function AppointmentCreateDrawer({
  onClose,
  initialRange,
}: {
  onClose: () => void;
  initialRange?: [Date, Date];
}) {
  const [patientSelectValue, setPatientValue] = useState<ComboboxItem | null>(null);
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();

  const [selectedPatient, setPatient] = useState<Tables<'patients'>>();
  const [active, setActive] = useState(0);
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

  const [dayValue, setDayValue] = useState<Date>(initialRange ? initialRange[0] : new Date());

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

  // Search query
  const { data: searchResults, isFetching } = useQuery({
    queryKey: ['searchPatients', debounced],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('lastName', `%${debounced}%`);

      if (error) {
        throw new Error(`${error.message}: ${error.details}`);
      }

      return data;
    },
    enabled: Boolean(debounced),
  });

  // form state
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    setError,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      stepOne: {
        treatment: '',
        specialist: '',
        startDate: timeRange[0],
        endDate: timeRange[1],
        notes: '',
      },
      stepTwo: {
        patient: '',
        attended: null,
        state: '2',
      },
    },
  });

  const selectedSpecialist = watch('stepOne.specialist');
  const selectedStartDate = watch('stepOne.startDate');
  const selectedEndDate = watch('stepOne.endDate');

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (values: AppointmentRequest) => {
      const { error } = await supabase.from('appointments').insert(values);

      if (error) throw new Error('Couldnt create a new appointment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      // Show success notification
      notifications.show({
        message: 'Se agendo el turno correctamente',
      });
      onClose();
    },
    onError: () => {
      notifications.show({
        title: 'Error!',
        message: 'Hubo un problema al intentar guardar el turno',
      });
    },
  });

  // form submission handler
  const handleSubmitForm = async (values: FormValues) => {
    const formData = {
      startDate: values.stepOne.startDate.toISOString(),
      endDate: values.stepOne.endDate.toISOString(),
      patient_id: parseInt(values.stepTwo.patient),
      treatment_id: parseInt(values.stepOne.treatment),
      specialist_id: parseInt(values.stepOne.specialist),
      notes: values.stepOne.notes,
      attended: values.stepTwo.attended,
      state_id: parseInt(values.stepTwo.state),
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

  const onSubmit: SubmitHandler<FormValues> = (data) => handleSubmitForm(data);

  const findPatient = (id: number) => {
    const foundItem = searchResults?.find((item) => item.id === id);
    if (foundItem) {
      setComboValue(`${foundItem.firstName} ${foundItem.lastName}`);
      setPatient(foundItem);
    }
  };

  const validateAppointmentTimes = () => {
    const errorMessage = 'Horario no disponible';
    if (selectedSpecialist && specialistsData) {
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

      validateRange(
        targetFromDate,
        targetToDate,
        'stepOne.startDate',
        'stepOne.endDate',
        blocks,
        (fields) => {
          fields.forEach((field) => {
            const key = field as keyof FormValues;
            setError(key, { type: 'validate', message: errorMessage });
          });
        },
      );

      validateRange(
        targetFromDate,
        targetToDate,
        'stepOne.startDate',
        'stepOne.endDate',
        breaks,
        (fields) => {
          fields.forEach((field) => {
            const key = field as keyof FormValues;
            setError(key, { type: 'validate', message: errorMessage });
          });
        },
      );
    }
  };

  const nextStep = async () => {
    let hasErrors = true;
    validateAppointmentTimes();
    switch (active) {
      case 0:
        hasErrors = !!errors.stepOne || !(await trigger('stepOne'));
        break;
      case 1:
        hasErrors = !(await trigger('stepTwo'));
        break;
      default:
        break;
    }

    setActive((current) => {
      if (hasErrors) {
        return current;
      }
      return current < 3 ? current + 1 : current;
    });
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
    <Group wrap="nowrap">
      <Avatar size="sm" color="darkPurple" radius={'xl'}>
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

  const optionsFilter: OptionsFilter = ({ options, search }) => {
    const filtered = (options as ComboboxItem[]).filter((option) =>
      option.label.toLowerCase().trim().includes(search.toLowerCase().trim()),
    );

    filtered.sort((a, b) => a.label.localeCompare(b.label));
    return filtered;
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
      <Stepper
        active={active}
        onStepClick={(stepIndex) => {
          if (active === 3) return;
          setActive(stepIndex);
        }}
        size="sm"
        iconSize={32}
        allowNextStepsSelect={false}
      >
        <Stepper.Step
          label="Paso 1"
          description="Tratamiento y Profesional"
          icon={<StethoscopeIcon width="1.1rem" />}
          loading={createAppointmentMutation.isPending}
          color={errors.stepOne ? 'red' : ''}
        >
          <Stack>
            <Controller
              name="stepOne.treatment"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Tratamiento"
                  error={getErrorMessageForField(errors.stepOne?.treatment)}
                  placeholder="Seleccione un tratamiento"
                  data={treatmentsData.data.map((item) => ({
                    value: `${item.id}`,
                    label: item.name,
                  }))}
                />
              )}
            />
            <Controller
              name="stepOne.specialist"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Profesional"
                  error={getErrorMessageForField(errors.stepOne?.specialist)}
                  placeholder="Seleccione el profesional"
                  renderOption={renderSelectOption}
                  maxDropdownHeight={400}
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
                      'stepOne.startDate',
                      createNewDate(value, dayjs(selectedStartDate).format('HH:mm')),
                      {
                        shouldDirty: true,
                      },
                    );
                    setValue(
                      'stepOne.endDate',
                      createNewDate(value, dayjs(selectedEndDate).format('HH:mm')),
                      {
                        shouldDirty: true,
                      },
                    );
                  }
                }}
                disabled={!selectedSpecialist}
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
                name="stepOne.startDate"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TimeInput
                    {...field}
                    disabled={!selectedSpecialist}
                    error={getErrorMessageForField(errors.stepOne?.startDate)}
                    label="Desde"
                    required
                    value={dayjs(field.value).format('HH:mm')}
                    onChange={(e) => {
                      setValue(
                        'stepOne.startDate',
                        createNewDate(dayValue, e.currentTarget.value),
                        {
                          shouldDirty: true,
                        },
                      );
                    }}
                    leftSection={
                      <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                  />
                )}
              />
              <Controller
                name="stepOne.endDate"
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
                    error={getErrorMessageForField(errors.stepOne?.endDate)}
                    required
                    value={dayjs(field.value).format('HH:mm')}
                    onChange={(e) => {
                      setValue('stepOne.endDate', createNewDate(dayValue, e.currentTarget.value), {
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
              placeholder="Notas internas del paciente"
              minRows={2}
              maxRows={4}
              {...register('stepOne.notes')}
            />
          </Stack>
        </Stepper.Step>
        <Stepper.Step
          label="Paso 2"
          description="Paciente"
          icon={<IconUserCheck style={{ width: rem(18), height: rem(18) }} />}
          loading={createAppointmentMutation.isPending}
        >
          <Stack gap="xs">
            <Group grow>
              <Select
                label="Paciente"
                placeholder="Seleccione un paciente"
                searchable
                clearable
                filter={optionsFilter}
                searchValue={comboValue}
                value={patientSelectValue ? patientSelectValue.value : null}
                onChange={(_value, option) => setPatientValue(option)}
                onClear={() => setPatient(undefined)}
                onSearchChange={(value: string) => {
                  setComboValue(value);
                }}
                nothingFoundMessage={
                  <Button
                    onClick={() =>
                      modals.openContextModal({
                        modal: 'patientsCreate',
                        size: 460,
                        title: 'Registrar paciente',
                        innerProps: {},
                      })
                    }
                    variant="transparent"
                    leftSection={<IconUserPlus size="1rem" />}
                  >
                    Crear paciente
                  </Button>
                }
                onOptionSubmit={(optionValue) => {
                  setValue('stepTwo.patient', optionValue, { shouldDirty: true });
                  findPatient(parseInt(optionValue));
                }}
                data={
                  searchResults
                    ? searchResults.map((result) => ({
                        label: `${result.firstName} ${result.lastName}`,
                        value: result.id.toString(),
                      }))
                    : patientSelectValue
                    ? [patientSelectValue]
                    : []
                }
                rightSection={isFetching ? <Loader size={16} /> : null}
                // rightSectionPointerEvents="none"
              />
            </Group>
            {selectedPatient && <PatientInfo data={selectedPatient} />}
            <Controller
              name="stepTwo.state"
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
                  checkIconPosition="right"
                />
              )}
            />
          </Stack>
        </Stepper.Step>
      </Stepper>
      <Group justify="flex-end" mt="xl">
        {active !== 0 && active !== 3 && (
          <Button variant="default" onClick={prevStep}>
            Anterior
          </Button>
        )}
        {active !== 1 && <Button onClick={nextStep}>Siguiente</Button>}
        {active === 1 && (
          <Button loading={createAppointmentMutation.isPending} onClick={handleSubmit(onSubmit)}>
            Agendar
          </Button>
        )}
      </Group>
    </form>
  );
}
