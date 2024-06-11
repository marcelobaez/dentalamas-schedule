import {
  ActionIcon,
  Avatar,
  Button,
  Grid,
  Group,
  LoadingOverlay,
  Select,
  Text,
  Tooltip,
} from '@mantine/core';
import { openConfirmModal, openContextModal, useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import {
  IconEdit,
  IconCheck,
  IconTrash,
  IconCalendar,
  IconPlus,
  IconClock2,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { useIsMobile } from '../../../hooks/useIsMobile/useIsMobile';
import { AppointmentsResponse } from '../../../types/appointment';
import AppointmentsEditModal from '../AppointmentsEditModal/AppointmentsEditModal';
import {
  MantineReactTable,
  MRT_PaginationState,
  MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import dayjs from 'dayjs';
import useAppointments from '../../../hooks/useAppointments/useAppointments';
import { useAppointmentColumns } from './data/columns';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import AppointmentsCreateModal from '../AppointmentsCreateModal/AppointmentsCreateModal';
import useTreatments from '../../../hooks/useTreatments/useTreatments';
import useSpecialists from '../../../hooks/useSpecialists/useSpecialists';
import { getMantineStyleAndOpts } from '../../../utils';

export default function AppointmentsTable() {
  const queryClient = useQueryClient();
  const modals = useModals();
  const isMobile = useIsMobile();
  const columns = useAppointmentColumns();
  const { data: treatmentsData, isLoading: isLoadingTreatments } = useTreatments();
  const { data: specialistsData, isLoading: isLoadingSpecialist } = useSpecialists();

  const [seletedSp, setSelectedSp] = useState<string | null>('');
  const [seletedTr, setSelectedTr] = useState<string | null>('');

  const [dateRangeValue, setRangeValue] = useState<[Date | null, Date | null]>([
    dayjs().startOf('week').add(1, 'day').toDate(),
    dayjs().endOf('week').toDate(),
  ]);

  const [sorting, setSorting] = useState<MRT_SortingState>([
    {
      id: 'lastName',
      desc: false,
    },
  ]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Get appointments with filters
  const { data, isLoading, isError, isFetching } = useAppointments({
    fromDate: dayjs(dateRangeValue[0]).isValid() ? dayjs(dateRangeValue[0]).format() : null,
    toDate: dayjs(dateRangeValue[1]).isValid() ? dayjs(dateRangeValue[1]).format() : null,
    specialist: seletedSp,
    treatment: seletedTr,
    options: {
      enabled: Boolean(dateRangeValue[0]) && Boolean(dateRangeValue[1]),
    },
  });

  const memoData = useMemo(() => {
    const fetchedAppointments = data?.data ?? [];
    const totalRowCount = data?.count ?? 0;
    return { fetchedAppointments, totalRowCount };
  }, [data]);

  // Create appointment mutation
  const { mutate } = useMutation({
    mutationFn: (id) => axios.delete(`/api/appointments/${id}`),
    onSuccess: (newAppointment: AppointmentsResponse, id: string) => {
      queryClient.setQueryData(['appointments'], newAppointment);
      // Show success notification
      showNotification({
        title: 'Exito!',
        message: 'Se elimino el turno correctamente',
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

  const openEditModal = (item: AppointmentsResponse) => {
    modals.openModal({
      modalId: 'appointmentsEditModal',
      centered: true,
      size: isMobile ? '100%' : '55%',
      title: 'Editar turno',
      children: <AppointmentsEditModal data={item} />,
    });
  };

  const openDeleteModal = (id: string) =>
    openConfirmModal({
      title: 'Eliminar el turno',
      children: (
        <Text size="sm">Seguro que quiere eliminar el turno? Esta accion no es reversible</Text>
      ),
      centered: true,
      labels: { confirm: 'Eliminar turno', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => mutate(id),
    });

  const openCreatePatientModal = () => {
    openContextModal({
      modal: 'patientsCreate',
      size: 460,
      title: 'Registrar paciente',
      innerProps: {},
    });
  };

  const openCreateAppointmentModal = () => {
    modals.openModal({
      modalId: 'appointmentsCreateModal',
      centered: true,
      size: isMobile ? '100%' : '55%',
      title: 'Registrar turno',
      children: (
        <AppointmentsCreateModal
          onClose={() => {
            modals.closeModal('appointmentsCreateModal');
          }}
          onCreatePatient={() => openCreatePatientModal()}
        />
      ),
    });
  };

  const table = useMantineReactTable({
    columns,
    data: memoData.fetchedAppointments,
    rowCount: memoData.totalRowCount,
    ...getMantineStyleAndOpts(isError),
    initialState: { showColumnFilters: false },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderRowActions: ({ row }) => (
      <Group>
        <Tooltip label="Editar turno">
          <ActionIcon size="1rem" variant="transparent">
            <IconEdit onClick={() => openEditModal(row.original)} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar turno">
          <ActionIcon
            variant="transparent"
            onClick={() => openDeleteModal(String(row.original.id))}
            color="red"
            size="1rem"
          >
            <IconTrash stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
    renderTopToolbarCustomActions: () => (
      <Group align="center" gap="xs">
        <Avatar color="violet" radius="md">
          <IconClock2 size="1.3rem" />
        </Avatar>
        <Text fz="1.2rem" fw={600}>
          {memoData.totalRowCount}
        </Text>
        <Text fz="0.875rem" c="dimmed">
          Turnos
        </Text>
      </Group>
    ),
    state: {
      density: 'xs',
      isLoading,
      pagination,
      sorting,
      showAlertBanner: isError,
      showProgressBars: isFetching,
    },
  });

  if (isLoadingTreatments || isLoadingSpecialist) {
    return <LoadingOverlay visible />;
  }

  if (!treatmentsData || !specialistsData) {
    return <div>Error...</div>;
  }

  return (
    <>
      <Grid.Col span={12}>
        <Group justify="space-between">
          <Text fw={600} size={'xl'}>
            Turnos
          </Text>
          <Group justify="end">
            <DatePickerInput
              leftSection={<IconCalendar size={16} />}
              placeholder="Elija el rango de fechas"
              type="range"
              value={dateRangeValue}
              onChange={setRangeValue}
              locale="es"
              allowSingleDateInRange={true}
              w={{ base: '100%', sm: 'auto' }}
            />
            <Select
              value={seletedSp}
              onChange={setSelectedSp}
              data={[
                {
                  label: 'Todos los especialistas',
                  value: '',
                },
                ...(specialistsData.data
                  ? specialistsData.data.map((item) => ({
                      label: `${item.firstName} ${item.lastName}`,
                      value: String(item.id),
                    }))
                  : []),
              ]}
              w={{ base: '100%', sm: 'auto' }}
            />
            <Select
              value={seletedTr}
              onChange={setSelectedTr}
              data={[
                {
                  label: 'Todos los tipos',
                  value: '',
                },
                ...treatmentsData.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                })),
              ]}
              w={{ base: '100%', sm: 'auto' }}
            />
            <Button
              leftSection={<IconPlus />}
              onClick={() => openCreateAppointmentModal()}
              w={{ base: '100%', sm: 'auto' }}
            >
              Nuevo turno
            </Button>
          </Group>
        </Group>
      </Grid.Col>
      <Grid.Col span={12}>
        <MantineReactTable table={table} />
      </Grid.Col>
    </>
  );
}
