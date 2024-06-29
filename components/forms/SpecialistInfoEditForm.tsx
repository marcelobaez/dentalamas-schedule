import { Button, Group, Stack, TextInput } from '@mantine/core';
import { AutoHideSuccess } from './common/AutoHideSuccess';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToggleByTime } from '../../hooks/useToggleByTime/useToggleByTime';
import useSupabaseBrowser from '../../utils/supabase/component';
import { ExtendedSpecialist, SpecialistFormValues } from './SpecialistEditDrawer';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IconBuilding, IconMail, IconPhone } from '@tabler/icons-react';
import { useEffect } from 'react';

export function SpecialistInfoEditForm({ data }: { data: ExtendedSpecialist }) {
  const supabase = useSupabaseBrowser();
  const queryClient = useQueryClient();
  const [isSuccessStaffVisible, showSuccessStaffMsg] = useToggleByTime();

  // form state (specialist)
  const {
    register: registerStaff,
    handleSubmit: handleSubmitStaff,
    reset: resetStaff,
    formState: {
      errors: staffErrors,
      isDirty: isStaffDirty,
      isSubmitSuccessful: isStaffSubmitSuccess,
    },
  } = useForm<SpecialistFormValues['specialist']>({
    values: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      streetAddress: data.streetAddress,
      title: data.title,
    },
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: async (values: SpecialistFormValues['specialist']) => {
      const { data: updatedRecord, error } = await supabase
        .from('specialists')
        .update(values)
        .eq('id', data.id)
        .select()
        .single()
        .throwOnError();

      if (error) throw error;

      resetStaff(updatedRecord);

      return updatedRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialists'] });
      showSuccessStaffMsg();
    },
    onError: () => {},
  });

  const onSubmitStaff: SubmitHandler<SpecialistFormValues['specialist']> = (data) =>
    updateStaffMutation.mutate(data);

  return (
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
          <AutoHideSuccess visible={isSuccessStaffVisible} />
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
  );
}
