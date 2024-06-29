import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Group,
  NumberFormatter,
  Stack,
  Text,
  rem,
} from '@mantine/core';
import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
  MantineReactTable,
  useMantineReactTable,
} from 'mantine-react-table';
import { IconPlus } from '@tabler/icons-react';
import Head from 'next/head';
import { Tables } from '../types/supabase';
import { useMemo, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import useTreatments from '../hooks/useTreatments/useTreatments';
import { getMantineStyleAndOpts } from '../utils';
import StethoscopeIcon from '../components/assets/icons/StethoscopeIcon';
import dayjs from 'dayjs';
import duration, { DurationUnitType } from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import TreatmentCreateModal from '../components/features/TreatmentCreateModal/TreatmentCreateModal';
import TreatmentEditModal from '../components/features/TreatmentEditModal/TreatmentEditModal';
dayjs.extend(duration);
dayjs.extend(relativeTime);

type ExtendedTreatment = Tables<'treatments'> & {
  treatment_visit_types: Tables<'treatment_visit_types'> | null;
};

export default function Treatments() {
  const [createFormOpened, createFormHandlers] = useDisclosure(false);
  const [editFormOpened, editFormHandlers] = useDisclosure(false);
  const [selectedTr, setTreatment] = useState<ExtendedTreatment>();
  const columns = useMemo<MRT_ColumnDef<ExtendedTreatment>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        Cell: ({ renderedCellValue }) => (
          <Text fw={500} fz="sm">
            {renderedCellValue}
          </Text>
        ),
      },
      {
        accessorKey: 'est_price',
        header: 'Costo estimado',
        enableSorting: false,
        Cell: ({ row }) => (
          <NumberFormatter
            prefix="$ "
            value={row.original.est_price ?? ''}
            thousandSeparator="."
            decimalSeparator=","
          />
        ),
      },
      {
        accessorKey: 'est_duration',
        header: 'Duracion estimada',
        enableSorting: false,
        Cell: ({ row }) => {
          const duration = row.original.est_duration;
          const unit: DurationUnitType = duration && duration < 59 ? 'minutes' : 'hours';
          const isInMinutes = unit === 'minutes';
          const unitLabel = isInMinutes ? 'minutos' : 'hora(s)';

          const durationLabel = duration
            ? isInMinutes
              ? '± ' +
                dayjs
                  .duration({
                    minutes: duration,
                  })
                  .locale('es')
                  .asMinutes() +
                ' ' +
                unitLabel
              : '± ' +
                dayjs
                  .duration({
                    minutes: duration,
                  })
                  .locale('es')
                  .asHours() +
                ' ' +
                unitLabel
            : '';

          return <Text fz="sm">{`${row.original.est_duration ? durationLabel : ''}`}</Text>;
        },
      },
      {
        accessorKey: 'treatment_visit_types',
        header: 'Tipo de Visita',
        enableSorting: false,
        Cell: ({ row }) => {
          const label = row.original.treatment_visit_types?.type ?? 'N/D';
          return (
            <Badge color={label === 'N/D' ? 'gray' : label === 'Unica' ? 'teal' : 'darkPurple'}>
              {label}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  //Manage MRT state that we want to pass to our API
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<MRT_SortingState>([
    {
      id: 'name',
      desc: false,
    },
  ]);

  // get data
  const { data, isLoading, isError, isFetching } = useTreatments();

  //this will depend on your API response shape
  const fetchedTreatments = data?.data ?? [];
  const totalRowCount = data?.count ?? 0;

  const table = useMantineReactTable({
    columns,
    data: fetchedTreatments,
    rowCount: totalRowCount,
    ...getMantineStyleAndOpts<ExtendedTreatment>(isError),
    manualPagination: false,
    manualFiltering: false,
    manualSorting: false,
    enableGlobalFilter: false,
    enableRowActions: false,
    initialState: { showColumnFilters: false },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderTopToolbarCustomActions: () => (
      <Group align="center" gap="xs">
        <Avatar color="violet" radius="md">
          <StethoscopeIcon width="1.3rem" height="1.3rem" />
        </Avatar>
        <Text fz="1.2rem" fw={600}>
          {totalRowCount}
        </Text>
        <Text fz="0.875rem" c="dimmed">
          Tratamientos
        </Text>
      </Group>
    ),
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        setTreatment(row.original);
        editFormHandlers.open();
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

  return (
    <>
      <Head>
        <title>Tratamientos</title>
        <meta name="description" content="Gestion de pacientes" />
      </Head>
      <Stack>
        <Group justify="space-between">
          <Text fw={600} size={'xl'}>
            Tratamientos
          </Text>
          <Button leftSection={<IconPlus size={16} />} onClick={() => createFormHandlers.open()}>
            Nuevo tratamiento
          </Button>
        </Group>
        <MantineReactTable table={table} />
        {/* Create staff Drawer */}
        <Drawer
          offset={8}
          size={rem(570)}
          position="right"
          radius="md"
          opened={createFormOpened}
          onClose={createFormHandlers.close}
          title="Nuevo tratamiento"
          closeOnClickOutside={false}
        >
          <TreatmentCreateModal onClose={createFormHandlers.close} />
        </Drawer>
        {/* Edit staff Drawer */}
        <Drawer
          offset={8}
          size={rem(570)}
          position="right"
          radius="md"
          opened={editFormOpened}
          onClose={editFormHandlers.close}
          title={`Editar: ${selectedTr ? selectedTr.name : ''}`}
          closeOnClickOutside={false}
        >
          {selectedTr && <TreatmentEditModal data={selectedTr} />}
        </Drawer>
      </Stack>
    </>
  );
}
