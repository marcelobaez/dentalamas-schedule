import { Box, Stack, Title, Text, Checkbox, Group, Button, LoadingOverlay } from '@mantine/core';
import { AutoHideSuccess } from './common/AutoHideSuccess';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExtendedSpecialist, SpecialistFormValues } from './SpecialistEditDrawer';
import useSupabaseBrowser from '../../utils/supabase/component';
import { useToggleByTime } from '../../hooks/useToggleByTime/useToggleByTime';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import useTreatments from '../../hooks/useTreatments/useTreatments';
import { useCallback, useEffect } from 'react';
import React from 'react';

export default function SpecialistTreatmentEditForm({ data }: { data: ExtendedSpecialist }) {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();
  const [isSuccessTrVisible, showSuccesTrMsg] = useToggleByTime();

  const initialTreatments = data.treatments;

  const { data: treatmentsData, status } = useTreatments();

  // form state (treatments)
  const {
    register: registerTr,
    handleSubmit: handleSubmitTr,
    control: controlTr,
    watch: watchTr,
    reset: resetTr,
    formState: { errors: trErrors, isSubmitSuccessful: isTrSubmitSuccess, dirtyFields },
  } = useForm<{ treatments: SpecialistFormValues['treatments'] }>({
    values: {
      treatments: treatmentsData
        ? treatmentsData.data.map((item1) => {
            const checked = data.treatments.some((item2) => item1.id === item2.id);
            return { ...item1, checked };
          })
        : [],
    },
  });

  useEffect(() => {
    if (isTrSubmitSuccess) resetTr();
  }, [isTrSubmitSuccess, resetTr]);

  const isDirty = Object.keys(dirtyFields).length > 0;

  // Update Treatments mutation
  const updateTrMutation = useMutation({
    mutationFn: async (values: SpecialistFormValues['treatments']) => {
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
        const { error } = await supabase.from('specialist_treatments').insert(toCreate);

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

      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialists'] });
    },
    onError: () => {},
  });

  const { fields: treatmentsFields, replace } = useFieldArray({
    control: controlTr,
    name: 'treatments',
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

  const onSubmitTr: SubmitHandler<{ treatments: SpecialistFormValues['treatments'] }> = (data) =>
    updateTrMutation.mutateAsync(data.treatments);

  if (status === 'pending')
    return (
      <Box pos="relative">
        <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      </Box>
    );

  if (status === 'error') return <div>Hubo un error</div>;

  return (
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
          <AutoHideSuccess visible={isSuccessTrVisible} />
          <Button
            onClick={handleSubmitTr(onSubmitTr)}
            loading={updateTrMutation.isPending}
            disabled={!isDirty}
          >
            Guardar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
