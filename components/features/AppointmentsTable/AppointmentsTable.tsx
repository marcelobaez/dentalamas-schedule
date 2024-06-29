import {
  Avatar,
  Button,
  Drawer,
  Grid,
  Group,
  LoadingOverlay,
  Select,
  Text,
  rem,
} from '@mantine/core';
import { IconCalendar, IconPlus, IconClock2 } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useIsMobile } from '../../../hooks/useIsMobile/useIsMobile';
import { AppointmentsResponse } from '../../../types/appointment';
import AppointmentsEditDrawer from '../AppointmentEditDrawer/AppointmentsEditDrawer';
import {
  MantineReactTable,
  MRT_PaginationState,
  MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import dayjs from 'dayjs';
import useAppointments from '../../../hooks/useAppointments/useAppointments';
import { useAppointmentColumns } from './data/columns';
import { DatePickerInput } from '@mantine/dates';
import useTreatments from '../../../hooks/useTreatments/useTreatments';
import useSpecialists from '../../../hooks/useSpecialists/useSpecialists';
import { getMantineStyleAndOpts } from '../../../utils';
import { AppointmentCreateDrawer } from '../AppointmentCreateDrawer/AppointmentCreateDrawer';
import { useDisclosure } from '@mantine/hooks';

export default function AppointmentsTable() {
  const [createOpened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [selectedAppointment, setSelectedAp] = useState<AppointmentsResponse>();
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

  const table = useMantineReactTable({
    columns,
    data: memoData.fetchedAppointments,
    rowCount: memoData.totalRowCount,
    ...getMantineStyleAndOpts<AppointmentsResponse>(isError),
    enableRowActions: false,
    initialState: { showColumnFilters: false },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
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
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        setSelectedAp(row.original);
        openEdit();
      },
      sx: {
        cursor: 'pointer',
      },
    }),
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
                ...treatmentsData.data.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                })),
              ]}
              w={{ base: '100%', sm: 'auto' }}
            />
            <Button
              leftSection={<IconPlus />}
              onClick={() => open()}
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
      <Drawer
        opened={createOpened}
        onClose={close}
        position="right"
        offset={isMobile ? 0 : 8}
        radius="md"
        size={rem(500)}
        title="Nuevo turno"
      >
        <AppointmentCreateDrawer onClose={close} />
      </Drawer>
      <Drawer
        opened={editOpened}
        onClose={closeEdit}
        position="right"
        offset={isMobile ? 0 : 8}
        radius="md"
        size={rem(500)}
        withCloseButton={false}
      >
        {selectedAppointment && (
          <AppointmentsEditDrawer data={selectedAppointment} onClose={closeEdit} />
        )}
      </Drawer>
    </>
  );
}
