import {
  Button,
  Group,
  Stack,
  Stepper,
  TextInput,
  Switch,
  Text,
  Checkbox,
  Alert,
  Title,
  Box,
  LoadingOverlay,
  ThemeIcon,
  List,
  rem,
  ActionIcon,
  Card,
} from '@mantine/core';
import {
  IconBuilding,
  IconCheck,
  IconClockOff,
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { TimeInput } from '@mantine/dates';
import useTreatments from '../../hooks/useTreatments/useTreatments';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Specialist } from '../../types/specialist';
import useSupabaseBrowser from '../../utils/supabase/component';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { useRouter } from 'next/router';
import { modals } from '@mantine/modals';
import { Tables } from '../../types/supabase';
import { BreakNewForm } from './BreakNewForm';
import { DEFAULT_WORKING_DAYS, dayNames } from '../../utils/constants';

export type BreakAddRequest = Omit<Tables<'breaks'>, 'id' | 'created_at' | 'specialist_id'> & {
  uid: string;
};

type FormValues = {
  specialist: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    streetAddress: string;
    title: string;
  };
  workingDays: { checked: boolean; start_time: string; end_time: string; day_of_week: number }[];
  treatments: { id: number; name: string; checked: boolean }[];
  breaks: BreakAddRequest[];
};

export function SpecialistCreateForm() {
  const router = useRouter();
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();
  const [active, setActive] = useState(0);

  const { data: treatmentsData, status } = useTreatments();

  // form state
  const {
    register,
    handleSubmit,
    trigger,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    values: {
      specialist: {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        streetAddress: '',
        title: '',
      },
      workingDays: DEFAULT_WORKING_DAYS,
      treatments: treatmentsData
        ? treatmentsData.data.map((item) => ({ id: item.id, name: item.name, checked: false }))
        : [],
      breaks: [],
    },
  });

  const { fields: workDaysFields } = useFieldArray({
    control,
    name: 'workingDays',
  });

  const { fields: treatmentsFields } = useFieldArray({
    control,
    name: 'treatments',
  });

  const { fields: breaksFields } = useFieldArray({
    control,
    name: 'breaks',
  });

  const watchWorkFieldArray = watch('workingDays');
  const controlledWorkFields = workDaysFields.map((field, index) => {
    return {
      ...field,
      ...watchWorkFieldArray[index],
    };
  });

  const watchTreatmentFieldArray = watch('treatments');
  const controlledTreatmentFields = treatmentsFields.map((field, index) => {
    return {
      ...field,
      ...watchTreatmentFieldArray[index],
    };
  });

  const watchBreakFieldArray = watch('breaks');
  // const controlledBreakFields = breaksFields.map((field, index) => {
  //   return {
  //     ...field,
  //     ...watchBreakFieldArray[index],
  //   };
  // });

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

  const nextStep = async () => {
    let hasErrors = true;
    switch (active) {
      case 0:
        await trigger('specialist');
        hasErrors = Boolean(errors.specialist);
        break;
      case 1:
        await trigger('treatments');
        hasErrors = Boolean(errors.treatments);
        break;
      case 2:
        await trigger('workingDays');
        hasErrors = Boolean(errors.workingDays);
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

  // Create staff mutation
  const createWorkDaysMutation = useMutation({
    mutationFn: async (values: FormValues['specialist']) => {
      const { data, error } = await supabase.from('specialists').insert(values).select();

      if (error) throw new Error('Couldnt create new specialist');

      return data;
    },
    onSuccess: async (data: Specialist[]) => {
      const filteredWorkDays = getValues('workingDays')
        .filter((item) => item.checked)
        .map((item, idx) => ({
          specialist_id: data[0].id,
          day_of_week: item.day_of_week,
          start_time: item.start_time,
          end_time: item.end_time,
        }));

      const filteredTreatments = getValues('treatments')
        .filter((item) => item.checked)
        .map((item) => ({ specialist_id: data[0].id, treatment_id: item.id }));

      const breaks = getValues('breaks').map((item) => ({
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        recurring: item.recurring,
        specialist_id: data[0].id,
      }));

      await supabase.from('specialist_working_days').insert(filteredWorkDays);
      await supabase.from('specialist_treatments').insert(filteredTreatments);
      await supabase.from('breaks').insert(breaks);

      queryClient.invalidateQueries({ queryKey: ['specialists'] });

      setActive(3);
    },
    onError: () => {
      showNotification({
        message: 'Hubo un error al crear el personal',
      });
    },
  });

  const handleAddBreak = (values: BreakAddRequest) => {
    const newBreaks = watchBreakFieldArray;
    newBreaks.push(values);
    setValue('breaks', newBreaks);
  };

  const handleDeleteBreak = (uid: string) => {
    const newBreaks = watchBreakFieldArray.filter((item) => item.uid !== uid);
    setValue('breaks', newBreaks);
  };

  const handleOpenCreateBreak = (day: number) => {
    modals.open({
      title: 'Nuevo break',
      children: <BreakNewForm onSuccess={(values) => handleAddBreak(values)} day_of_week={day} />,
    });
  };

  const onSubmit: SubmitHandler<FormValues> = (data) =>
    createWorkDaysMutation.mutate(data.specialist);

  if (status === 'pending')
    return (
      <Box pos="relative">
        <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      </Box>
    );

  if (status === 'error') return <div>Hubo un error</div>;

  return (
    <Stack>
      <Title order={1} fz="1.35rem">
        Crear profesional
      </Title>
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
          <Stepper.Step label="Paso 1" description="Informacion basica">
            <Stack>
              <Title order={5} fw={500} py="sm">
                Complete la informacion basica
              </Title>
              <Group grow>
                <TextInput
                  required
                  label="Nombre"
                  placeholder="Nombre"
                  min={3}
                  error={
                    errors.specialist?.firstName
                      ? errors.specialist.firstName.type === 'minLength'
                        ? 'Longitud minima (3 caracteres)'
                        : 'Este campo es requerido'
                      : ''
                  }
                  {...register('specialist.firstName', { required: true, minLength: 3 })}
                />
                <TextInput
                  required
                  label="Apellido"
                  placeholder="Apellido"
                  min={3}
                  error={
                    errors.specialist?.lastName
                      ? errors.specialist.lastName.type === 'minLength'
                        ? 'Longitud minima (3 caracteres)'
                        : 'Este campo es requerido'
                      : ''
                  }
                  {...register('specialist.lastName', { required: true, minLength: 3 })}
                />
              </Group>
              <Group grow>
                <TextInput
                  required
                  label="Celular"
                  placeholder="Celular"
                  leftSection={<IconPhone size={14} />}
                  error={
                    errors.specialist?.phone
                      ? errors.specialist.phone.type === 'pattern'
                        ? 'Numero no valido'
                        : 'Este campo es requerido'
                      : ''
                  }
                  {...register('specialist.phone', {
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
                    errors.specialist?.email
                      ? errors.specialist.email.type === 'pattern'
                        ? 'Email no valido'
                        : 'Este campo es requerido'
                      : ''
                  }
                  {...register('specialist.email', { pattern: /^\S+@\S+$/, required: true })}
                />
              </Group>
              <Group grow>
                <TextInput
                  required
                  label="Especialidad"
                  placeholder="Odontologia general, Endodoncia, Cirugia"
                  min={8}
                  error={
                    errors.specialist?.title
                      ? errors.specialist.title.type === 'minLength'
                        ? 'Longitud minima (8 caracteres)'
                        : 'Este campo es requerido'
                      : ''
                  }
                  {...register('specialist.title', { required: true, minLength: 8 })}
                />
              </Group>
              <Group grow>
                <TextInput
                  required
                  label="Direccion"
                  placeholder="Calle 1234, Piso"
                  leftSection={<IconBuilding size={14} />}
                  min={6}
                  error={
                    errors.specialist?.streetAddress
                      ? errors.specialist.streetAddress.type === 'minLength'
                        ? 'Longitud minima (6 caracteres)'
                        : 'Este campo es requerido'
                      : ''
                  }
                  {...register('specialist.streetAddress', { required: true, minLength: 6 })}
                />
              </Group>
            </Stack>
          </Stepper.Step>
          <Stepper.Step label="Paso 2" description="Tratamientos">
            <Stack>
              <Box pt="sm">
                <Title order={5} fw={500}>
                  Elija los tratamientos
                </Title>
                {errors.treatments && (
                  <Text component="p" c="red" fz="xs">
                    Debe elegir al menos un tratamiento
                  </Text>
                )}
              </Box>
              {controlledTreatmentFields.map((field, index) => (
                <Checkbox
                  {...register(`treatments.${index}.checked`, { validate: validateTreatments })}
                  key={field.id}
                  label={field.name}
                  styles={{ label: { fontWeight: 600 } }}
                />
              ))}
            </Stack>
          </Stepper.Step>
          <Stepper.Step
            label="Paso 3"
            description="Dias laborales"
            loading={createWorkDaysMutation.isPending}
          >
            <Stack gap="xs">
              <Box pt="sm">
                <Title order={5} fw={500}>
                  Indique los dias de trabajo
                </Title>
                {errors.workingDays && (
                  <Text component="p" c="red" fz="xs">
                    Debe elegir al menos un dia
                  </Text>
                )}
              </Box>
              <Stack gap="xs">
                {controlledWorkFields.map((field, index) => {
                  const isChecked = getValues(`workingDays.${index}.checked`);
                  return (
                    <Card shadow="sm" padding="lg" radius="md" withBorder key={field.id}>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Switch
                            {...register(`workingDays.${index}.checked`, {
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
                                {...register(`workingDays.${index}.start_time`)}
                                key={`${field.id}-start-time`}
                                error={
                                  errors.workingDays
                                    ? errors.workingDays[index]?.start_time?.message
                                    : ''
                                }
                                required
                              />
                              <Text component="span" fz="sm">{` a `}</Text>
                              <TimeInput
                                {...register(`workingDays.${index}.end_time`)}
                                key={`${field.id}-end-time`}
                                required
                              />
                              <Button
                                variant="outline"
                                leftSection={<IconPlus size="0.8rem" strokeWidth={3} />}
                                onClick={() => handleOpenCreateBreak(field.day_of_week)}
                              >
                                Receso
                              </Button>
                            </Group>
                          )}
                        </Group>
                        {breaksFields.length > 0 ? (
                          <List
                            spacing="xs"
                            size="sm"
                            center
                            icon={
                              <ThemeIcon color="orange" size={24} radius="xl">
                                <IconClockOff style={{ width: rem(16), height: rem(16) }} />
                              </ThemeIcon>
                            }
                          >
                            {breaksFields
                              .filter((item) => item.day_of_week === field.day_of_week)
                              .map((field) => {
                                return (
                                  <List.Item key={field.id}>
                                    <Group>
                                      <Text fz="sm">{`${field.start_time} - ${field.end_time}`}</Text>
                                      <ActionIcon
                                        onClick={(e) => handleDeleteBreak(field.uid)}
                                        color="red"
                                        variant="transparent"
                                        size="sm"
                                      >
                                        <IconTrash />
                                      </ActionIcon>
                                    </Group>
                                  </List.Item>
                                );
                              })}
                          </List>
                        ) : (
                          !breaksFields.some((item) => item.day_of_week === field.day_of_week) && (
                            <Alert
                              variant="default"
                              color="blue"
                              title="No hay recesos configurados"
                              icon={<IconInfoCircle />}
                            />
                          )
                        )}
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
            </Stack>
          </Stepper.Step>
          <Stepper.Completed>
            <Stack justify="center" pt="md" gap="sm">
              <Group justify="center">
                <ThemeIcon color="darkPurple.7" variant="white" size={70}>
                  <IconCheck style={{ width: '100%', height: '100%', strokeWidth: 1 }} />
                </ThemeIcon>
              </Group>
              <Group justify="center">
                <Text fw={600} fz="sm" c="darkPurple.3">
                  Profesional agregado correctamente
                </Text>
              </Group>
              <Group justify="center">
                <Button onClick={() => router.push('/specialists')}>Volver al listado</Button>
              </Group>
            </Stack>
          </Stepper.Completed>
        </Stepper>
        <Group justify="flex-end" mt="xl">
          {active !== 0 && active !== 3 && (
            <Button variant="default" onClick={prevStep}>
              Anterior
            </Button>
          )}
          {active !== 2 && active !== 3 && <Button onClick={nextStep}>Siguiente</Button>}
          {active === 2 && <Button onClick={handleSubmit(onSubmit)}>Finalizar</Button>}
        </Group>
      </form>
    </Stack>
  );
}
