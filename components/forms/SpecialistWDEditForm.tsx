import {
  Box,
  Stack,
  Title,
  Text,
  Group,
  Switch,
  Button,
  List,
  ActionIcon,
  ThemeIcon,
  rem,
  Alert,
  Card,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import React, { useCallback } from 'react';
import { AutoHideSuccess } from './common/AutoHideSuccess';
import { ExtendedSpecialist, SpecialistFormValues } from './SpecialistEditDrawer';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToggleByTime } from '../../hooks/useToggleByTime/useToggleByTime';
import useSupabaseBrowser from '../../utils/supabase/component';
import { DEFAULT_WORKING_DAYS, dayNames } from '../../utils/constants';
import { IconClockOff, IconEdit, IconInfoCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { BreakNewForm } from './BreakNewForm';
import { BreakAddRequest } from './SpecialistCreateForm';
import { Tables } from '../../types/supabase';
import { BreakEditForm } from './BreakEditForm';
import { notifications } from '@mantine/notifications';

export default function SpecialistWDEditForm({ data }: { data: ExtendedSpecialist }) {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();
  const [isSuccessWDVisible, showSuccessWDMsg] = useToggleByTime();
  const initialWorkDays = data.specialist_working_days;

  // form state (workdays)
  const {
    register: registerWD,
    handleSubmit: handleSubmitWD,
    control: controlWD,
    getValues: getWDValues,
    watch: watchWD,
    setValue,
    formState: { errors: wdErrors, isDirty: isWDDirty, isSubmitSuccessful: isWDSubmitSuccess },
  } = useForm<{
    workingDays: SpecialistFormValues['workingDays'];
    breaks: SpecialistFormValues['breaks'];
  }>({
    values: {
      workingDays: DEFAULT_WORKING_DAYS.map((item1) => {
        const checked = initialWorkDays.some((item2) => item1.day_of_week === item2.day_of_week);
        const match = initialWorkDays.find((item) => item.day_of_week === item1.day_of_week);
        return {
          ...item1,
          start_time: match?.start_time || item1.start_time,
          end_time: match?.end_time || item1.end_time,
          checked,
        };
      }),
      breaks: data.breaks,
    },
  });

  const { fields: workDaysFields } = useFieldArray({
    control: controlWD,
    name: 'workingDays',
  });

  const { fields: breaksFields } = useFieldArray({
    control: controlWD,
    name: 'breaks',
    keyName: '_id',
  });

  const watchWorkFieldArray = watchWD('workingDays');
  const controlledWorkFields = workDaysFields.map((field, index) => {
    return {
      ...field,
      ...watchWorkFieldArray[index],
    };
  });

  const watchBreakFieldArray = watchWD('breaks');

  const validateWorkDays = useCallback(() => {
    const errorMessage = 'Debe elegir al menos un dia';
    const isValid = watchWorkFieldArray.some((v) => v.checked);

    return isValid || errorMessage;
  }, [watchWorkFieldArray]);

  // Update Treatments mutation
  const updateWDMutation = useMutation({
    mutationFn: async (values: SpecialistFormValues['workingDays']) => {
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

  const onSubmitWD: SubmitHandler<{ workingDays: SpecialistFormValues['workingDays'] }> = (data) =>
    updateWDMutation.mutate(data.workingDays);

  const createBreakMutation = useMutation({
    mutationFn: async (values: Omit<Tables<'breaks'>, 'id' | 'created_at'>) => {
      await supabase.from('breaks').insert(values);
    },
    onSuccess: async () => {
      //todo
      await queryClient.invalidateQueries({ queryKey: ['specialists'] });
      notifications.show({
        message: 'Receso creado correctamente',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Hubo un error!',
        message: 'No se pudo crear el receso',
        color: 'red',
      });
    },
  });

  const deleteBreakMutation = useMutation({
    mutationFn: async (id: number) => {
      await supabase.from('breaks').delete().eq('id', id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialists'] });
      notifications.show({
        message: 'Receso eliminado correctamente',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Hubo un error!',
        message: 'No se pudo eliminar el receso',
        color: 'red',
      });
    },
  });

  const handleAddBreak = (values: BreakAddRequest) => {
    // call mutation here
    createBreakMutation.mutateAsync({
      start_time: values.start_time,
      end_time: values.end_time,
      recurring: values.recurring,
      day_of_week: values.day_of_week,
      specialist_id: data.id,
    });
  };

  const handleDeleteBreak = (id: number) => {
    // call mutation here
    deleteBreakMutation.mutateAsync(id);
  };

  const handleOpenCreateBreakModal = (day: number) => {
    modals.open({
      title: 'Nuevo receso',
      children: <BreakNewForm onSuccess={(values) => handleAddBreak(values)} day_of_week={day} />,
    });
  };

  const handleOpenEditBreakModal = (values: Tables<'breaks'>) => {
    modals.open({
      title: 'Editar break',
      children: <BreakEditForm data={values} />,
    });
  };

  return (
    <form>
      <Stack gap="xs">
        <Box pt="sm">
          {wdErrors.workingDays && (
            <Text component="p" c="red" fz="xs">
              Debe elegir al menos un dia
            </Text>
          )}
        </Box>
        <Stack gap="xs">
          {controlledWorkFields.map((field, index) => {
            const isChecked = getWDValues(`workingDays.${index}.checked`);
            return (
              <Card shadow="sm" padding="lg" radius="md" withBorder key={field.id}>
                <Stack gap="xs">
                  <Group justify="space-between">
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
                          key={`${field.id}-end-time`}
                          required
                        />
                        <Button
                          variant="outline"
                          leftSection={<IconPlus size="0.8rem" strokeWidth={3} />}
                          onClick={() => handleOpenCreateBreakModal(field.day_of_week)}
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
                                  onClick={(e) => {
                                    modals.openConfirmModal({
                                      title: 'Eliminar receso',
                                      children: <Text fz="sm">Esta seguro?</Text>,
                                      onConfirm: () => handleDeleteBreak(field.id),
                                      labels: { confirm: 'Eliminar receso', cancel: 'Cancelar' },
                                      confirmProps: {
                                        color: 'red',
                                      },
                                    });
                                  }}
                                  color="red"
                                  variant="transparent"
                                  size="sm"
                                >
                                  <IconTrash />
                                </ActionIcon>
                                <ActionIcon
                                  onClick={(e) => handleOpenEditBreakModal(field)}
                                  color="darkPurple"
                                  variant="transparent"
                                  size="sm"
                                >
                                  <IconEdit />
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
        <Group justify="end" pt="sm">
          <AutoHideSuccess visible={isSuccessWDVisible} />
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
  );
}
