import {
  Button,
  Group,
  Stack,
  TextInput,
  Switch,
  Divider,
  Text,
  Checkbox,
  Title,
  Box,
  Tabs,
  LoadingOverlay,
  Transition,
  Badge,
} from '@mantine/core';
import { IconBuilding, IconCheck, IconMail, IconPhone } from '@tabler/icons-react';
import { useCallback } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { TimeInput } from '@mantine/dates';
import useTreatments from '../../hooks/useTreatments/useTreatments';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSupabaseBrowser from '../../utils/supabase/component';
import React from 'react';
import { Tables } from '../../types/supabase';
import { useToggleByTime } from '../../hooks/useToggleByTime/useToggleByTime';

type FormValues = {
  specialist: {
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string | null;
    streetAddress: string | null;
    title: string;
  };
  workingDays: { checked: boolean; start_time: string; end_time: string; day_of_week: number }[];
  treatments: { id: number; name: string; checked: boolean }[];
};

const dayNames: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miercoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sabado',
  7: 'Domingo',
};

const DEFAULT_WORKING_DAYS = [
  {
    checked: false,
    day_of_week: 1,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 2,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 3,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 4,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 5,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 6,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
  {
    checked: false,
    day_of_week: 7,
    start_time: '09:00:00',
    end_time: '17:00:00',
  },
];

export function SpecialistEditForm({
  data,
}: {
  data: Tables<'specialists'> & {
    specialist_working_days: Tables<'specialist_working_days'>[];
    treatments: Tables<'treatments'>[];
    specialist_treatments: Tables<'specialist_treatments'>[];
  };
}) {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();
  const [isSuccessStaffVisible, showSuccessStaffMsg] = useToggleByTime();
  const [isSuccessTrVisible, showSuccesTrMsg] = useToggleByTime();
  const [isSuccessWDVisible, showSuccessWDMsg] = useToggleByTime();

  const initialTreatments = data.treatments;
  const initialWorkDays = data.specialist_working_days;

  const { data: treatmentsData, isLoading, isError } = useTreatments();

  // form state (specialist)
  const {
    register: registerStaff,
    handleSubmit: handleSubmitStaff,
    formState: { errors: staffErrors, isDirty: isStaffDirty },
  } = useForm<FormValues['specialist']>({
    defaultValues: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      streetAddress: data.streetAddress,
      title: data.title,
    },
  });

  // form state (workdays)
  const {
    register: registerWD,
    handleSubmit: handleSubmitWD,
    trigger: triggerWD,
    control: controlWD,
    getValues: getWDValues,
    watch: watchWD,
    formState: { errors: wdErrors, isDirty: isWDDirty },
  } = useForm<{ workingDays: FormValues['workingDays'] }>({
    defaultValues: {
      workingDays: DEFAULT_WORKING_DAYS.map((item1) => {
        const checked = data.specialist_working_days.some(
          (item2) => item1.day_of_week === item2.day_of_week,
        );
        const match = data.specialist_working_days.find(
          (item) => item.day_of_week === item1.day_of_week,
        );
        return {
          ...item1,
          start_time: match?.start_time || item1.start_time,
          end_time: match?.end_time || item1.end_time,
          checked,
        };
      }),
    },
  });

  // form state (treatments)
  const {
    register: registerTr,
    handleSubmit: handleSubmitTr,
    trigger: triggerTr,
    control: controlTr,
    getValues: getTrValues,
    watch: watchTr,
    formState: { errors: trErrors, isDirty: isTrDirty, dirtyFields },
  } = useForm<{ treatments: FormValues['treatments'] }>({
    defaultValues: {
      treatments: treatmentsData
        ? treatmentsData.map((item1) => {
            const checked = data.treatments.some((item2) => item1.id === item2.id);
            return { ...item1, checked };
          })
        : [],
    },
  });

  const { fields: workDaysFields } = useFieldArray({
    control: controlWD,
    name: 'workingDays',
  });

  const { fields: treatmentsFields } = useFieldArray({
    control: controlTr,
    name: 'treatments',
  });

  const watchWorkFieldArray = watchWD('workingDays');
  const controlledWorkFields = workDaysFields.map((field, index) => {
    return {
      ...field,
      ...watchWorkFieldArray[index],
    };
  });

  const watchTreatmentFieldArray = watchTr('treatments');
  const controlledTreatmentFields = treatmentsFields.map((field, index) => {
    return {
      ...field,
      ...watchTreatmentFieldArray[index],
    };
  });

  const validateTreatments = useCallback(() => {
    const errorMessage = 'Debe elegir al menos un tratamiento';
    const isValid = watchTreatmentFieldArray.some((v) => v.checked);
    return isValid || errorMessage;
  }, [watchTreatmentFieldArray]);

  const validateWorkDays = useCallback(() => {
    const errorMessage = 'Debe elegir al menos un dia';
    const isValid = watchWorkFieldArray.some((v) => v.checked);

    return isValid || errorMessage;
  }, [watchWorkFieldArray]);

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: async (values: FormValues['specialist']) => {
      const { data: updatedRecord, error } = await supabase
        .from('specialists')
        .update(values)
        .eq('id', data.id)
        .throwOnError();

      if (error) throw error;

      return updatedRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialists'] });
      showSuccessStaffMsg();
    },
    onError: () => {},
  });

  // Update Treatments mutation
  const updateTrMutation = useMutation({
    mutationFn: async (values: FormValues['treatments']) => {
      const filteredCheckedTreatments = values.filter((item) => item.checked);

      // Determine what needs to be created, updated, or deleted
      const toCreate = filteredCheckedTreatments
        .filter((curr) => !initialTreatments.some((initial) => initial.id === curr.id))
        .map((item) => ({ specialist_id: data.id, treatment_id: item.id }));

      const filteredtoDelete = initialTreatments
        .filter((initial) =>
          values.some((current) => current.id === initial.id && !current.checked),
        )
        .flatMap((item) => item.id);

      const toDeleteIds = data.specialist_treatments
        .filter((item) => filteredtoDelete.some((val) => val === item.treatment_id))
        .flatMap((el) => el.id);

      if (toCreate.length > 0) {
        const { error } = await supabase.from('specialist_treatments').insert(toCreate).select();

        if (error) throw new Error('Couldnt update treatments');
        if (!isSuccessTrVisible) showSuccesTrMsg();
      }

      if (toDeleteIds.length > 0) {
        const { error } = await supabase
          .from('specialist_treatments')
          .delete()
          .in('id', toDeleteIds);

        if (error) throw new Error('Couldnt delete treatments');
        if (!isSuccessTrVisible) showSuccesTrMsg();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialists'] });
    },
    onError: () => {},
  });

  // Update Treatments mutation
  const updateWDMutation = useMutation({
    mutationFn: async (values: FormValues['workingDays']) => {
      const filteredCheckedWD = values.filter((item) => item.checked);

      // Determine what needs to be created, updated, or deleted
      const toCreate = filteredCheckedWD
        .filter(
          (curr) => !initialWorkDays.some((initial) => initial.day_of_week === curr.day_of_week),
        )
        .map((item) => ({
          start_time: item.start_time,
          end_time: item.end_time,
          day_of_week: item.day_of_week,
          specialist_id: data.id,
        }));

      const toDelete = initialWorkDays
        .filter((initial) =>
          values.some((current) => current.day_of_week === initial.day_of_week && !current.checked),
        )
        .flatMap((item) => item.id);

      const toUpdate = initialWorkDays
        .filter((curr) =>
          values.some(
            (initial) =>
              initial.day_of_week === curr.day_of_week &&
              (initial.start_time !== curr.start_time || initial.end_time !== curr.end_time) &&
              initial.checked,
          ),
        )
        .map((val) => {
          const match = values.find((item) => item.day_of_week === val.day_of_week);
          return {
            ...val,
            start_time: match?.start_time || '',
            end_time: match?.end_time || '',
          };
        });

      if (toCreate.length > 0) {
        const { error } = await supabase.from('specialist_working_days').insert(toCreate);

        if (error) throw new Error('Couldnt update treatments');
        if (!isSuccessWDVisible) showSuccessWDMsg();
      }

      if (toDelete.length > 0) {
        const { error } = await supabase
          .from('specialist_working_days')
          .delete()
          .in('id', toDelete);

        if (error) throw new Error('Couldnt delete workdays');
        if (!isSuccessWDVisible) showSuccessWDMsg();
      }

      if (toUpdate.length > 0) {
        const { error } = await supabase.from('specialist_working_days').upsert(toUpdate);

        if (error) throw new Error('Couldnt update workdays');
        if (!isSuccessWDVisible) showSuccessWDMsg();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialists'] });
    },
    onError: () => {},
  });

  const onSubmitStaff: SubmitHandler<FormValues['specialist']> = (data) =>
    updateStaffMutation.mutate(data);

  const onSubmitTr: SubmitHandler<{ treatments: FormValues['treatments'] }> = (data) =>
    updateTrMutation.mutate(data.treatments);

  const onSubmitWD: SubmitHandler<{ workingDays: FormValues['workingDays'] }> = (data) =>
    updateWDMutation.mutate(data.workingDays);

  return (
    <Tabs defaultValue="specialist">
      <Tabs.List>
        <Tabs.Tab value="specialist">Informacion</Tabs.Tab>
        <Tabs.Tab value="treatments">Tratamientos</Tabs.Tab>
        <Tabs.Tab value="workDays">Dias Laborales</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="specialist">
        <form>
          <Stack gap="md" pt="sm">
            <Group grow>
              <TextInput
                required
                label="Nombre"
                placeholder="Nombre"
                min={3}
                error={
                  staffErrors?.firstName
                    ? staffErrors.firstName.type === 'minLength'
                      ? 'Longitud minima (3 caracteres)'
                      : 'Este campo es requerido'
                    : ''
                }
                {...registerStaff('firstName', { required: true, minLength: 3 })}
              />
              <TextInput
                required
                label="Apellido"
                placeholder="Apellido"
                min={3}
                error={
                  staffErrors?.lastName
                    ? staffErrors.lastName.type === 'minLength'
                      ? 'Longitud minima (3 caracteres)'
                      : 'Este campo es requerido'
                    : ''
                }
                {...registerStaff('lastName', { required: true, minLength: 3 })}
              />
            </Group>
            <Group grow>
              <TextInput
                required
                label="Celular"
                placeholder="Celular"
                leftSection={<IconPhone size={14} />}
                error={
                  staffErrors?.phone
                    ? staffErrors.phone.type === 'pattern'
                      ? 'Numero no valido'
                      : 'Este campo es requerido'
                    : ''
                }
                {...registerStaff('phone', {
                  required: true,
                  pattern: /^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/,
                })}
              />
              <TextInput
                label="Email"
                required
                placeholder="mail@ejemplo.com"
                leftSection={<IconMail size={14} />}
                error={
                  staffErrors?.email
                    ? staffErrors.email.type === 'pattern'
                      ? 'Email no valido'
                      : 'Este campo es requerido'
                    : ''
                }
                {...registerStaff('email', { pattern: /^\S+@\S+$/, required: true })}
              />
            </Group>
            <Group grow>
              <TextInput
                required
                label="Especialidad"
                placeholder="Odontologia general, Endodoncia, Cirugia"
                min={8}
                error={
                  staffErrors?.title
                    ? staffErrors.title.type === 'minLength'
                      ? 'Longitud minima (8 caracteres)'
                      : 'Este campo es requerido'
                    : ''
                }
                {...registerStaff('title', { required: true, minLength: 8 })}
              />
            </Group>
            <Group grow>
              <TextInput
                required
                label="Direccion"
                placeholder="Calle 1234, Piso"
                leftSection={<IconBuilding size={14} />}
                min={8}
                error={
                  staffErrors.streetAddress
                    ? staffErrors.streetAddress.type === 'minLength'
                      ? 'Longitud minima (8 caracteres)'
                      : 'Este campo es requerido'
                    : ''
                }
                {...registerStaff('streetAddress', { required: true, minLength: 8 })}
              />
            </Group>
            <Group justify="end">
              <Transition
                mounted={isSuccessStaffVisible}
                transition="slide-right"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <Badge
                    style={styles}
                    color="green"
                    variant="light"
                    size="lg"
                    rightSection={<IconCheck size="0.875rem" />}
                  >
                    Guardado
                  </Badge>
                )}
              </Transition>
              <Button
                onClick={handleSubmitStaff(onSubmitStaff)}
                loading={updateStaffMutation.isPending}
                disabled={!isStaffDirty}
              >
                Guardar
              </Button>
            </Group>
          </Stack>
        </form>
      </Tabs.Panel>

      <Tabs.Panel value="treatments">
        <form>
          <Stack>
            <Box pt="sm">
              <Title order={5} fw={500}>
                Tratamientos asignados
              </Title>
              {trErrors.treatments && (
                <Text component="p" c="red" fz="xs">
                  Debe elegir al menos un tratamiento
                </Text>
              )}
            </Box>
            {controlledTreatmentFields.map((field, index) => (
              <Checkbox
                {...registerTr(`treatments.${index}.checked`, { validate: validateTreatments })}
                key={field.id}
                label={field.name}
                styles={{ label: { fontWeight: 600 } }}
              />
            ))}
            <Group justify="end">
              <Transition
                mounted={isSuccessTrVisible}
                transition="slide-right"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <Badge
                    style={styles}
                    color="green"
                    variant="light"
                    size="lg"
                    rightSection={<IconCheck size="0.875rem" />}
                  >
                    Guardado
                  </Badge>
                )}
              </Transition>
              <Button
                onClick={handleSubmitTr(onSubmitTr)}
                loading={updateTrMutation.isPending}
                disabled={!isTrDirty}
              >
                Guardar
              </Button>
            </Group>
          </Stack>
        </form>
      </Tabs.Panel>

      <Tabs.Panel value="workDays">
        <form>
          <Stack gap="xs">
            <Box pt="sm">
              <Title order={5} fw={500}>
                Dias laborales
              </Title>
              {wdErrors.workingDays && (
                <Text component="p" c="red" fz="xs">
                  Debe elegir al menos un dia
                </Text>
              )}
            </Box>
            {controlledWorkFields.map((field, index) => {
              const isChecked = getWDValues(`workingDays.${index}.checked`);
              return (
                <React.Fragment key={`section-${field.id}-${index}`}>
                  <Group key={`group-${field.id}`} justify="space-between">
                    <Switch
                      {...registerWD(`workingDays.${index}.checked`, {
                        validate: validateWorkDays,
                      })}
                      checked={isChecked}
                      key={field.id}
                      styles={{ label: { fontWeight: 600 } }}
                      label={dayNames[index + 1]}
                    />
                    {!isChecked && (
                      <Text fz="sm" c="dimmed">
                        No trabaja este dia
                      </Text>
                    )}
                    {isChecked && (
                      <Group>
                        <TimeInput
                          {...registerWD(`workingDays.${index}.start_time`)}
                          key={`${field.id}-start-time`}
                          error={
                            wdErrors.workingDays
                              ? wdErrors.workingDays[index]?.start_time?.message
                              : ''
                          }
                          required
                        />
                        <Text component="span" fz="sm">{` a `}</Text>
                        <TimeInput
                          {...registerWD(`workingDays.${index}.end_time`)}
                          error={
                            wdErrors.workingDays
                              ? wdErrors.workingDays[index]?.end_time?.message
                              : ''
                          }
                          key={`${field.id}-end-time`}
                          required
                        />
                      </Group>
                    )}
                  </Group>
                  {index < workDaysFields.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
            <Group justify="end" pt="sm">
              <Transition
                mounted={isSuccessWDVisible}
                transition="slide-right"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <Badge
                    style={styles}
                    color="green"
                    variant="light"
                    size="lg"
                    rightSection={<IconCheck size="0.875rem" />}
                  >
                    Guardado
                  </Badge>
                )}
              </Transition>
              <Button
                onClick={handleSubmitWD(onSubmitWD)}
                loading={updateWDMutation.isPending}
                disabled={!isWDDirty}
              >
                Guardar
              </Button>
            </Group>
          </Stack>
        </form>
      </Tabs.Panel>
    </Tabs>
  );
}
