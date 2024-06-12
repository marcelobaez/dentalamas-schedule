import { useMemo, useState } from 'react';
import { ActionIcon, Avatar, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconMail, IconPhone, IconUsers } from '@tabler/icons-react';
import { Patient } from '../../../types/patient';
import { useModals } from '@mantine/modals';
import PatientsEditModal from '../PatientsEditModal/PatientsEditModal';
import { useIsMobile } from '../../../hooks/useIsMobile/useIsMobile';
import usePatients from '../../../hooks/usePatients/usePatients';
import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import dayjs from 'dayjs';
import { DATE_FORMAT_WITH_TIME } from '../../../utils/constants';
import { getMantineStyleAndOpts } from '../../../utils';

export function PatientsTable() {
  const modals = useModals();
  const isMobile = useIsMobile();

  const columns = useMemo<MRT_ColumnDef<Patient>[]>(
    () => [
      {
        accessorKey: 'lastName',
        header: 'Nombre',
        Cell: ({ row }) => (
          <Group gap="xs" wrap="nowrap">
            <Avatar radius="xl" size="sm" color="violet" />
            <Text size="sm" fw={500}>
              {`${row.original.lastName}, ${row.original.firstName}`}
            </Text>
          </Group>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Telefono',
        Cell: ({ row }) => (
          <Group gap="xs" wrap="nowrap">
            <IconPhone size="0.875rem" />
            <span>{row.original.phone}</span>
          </Group>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        Cell: ({ row }) => (
          <Group gap="xs" wrap="nowrap">
            <IconMail size="0.875rem" />
            <span>{row.original.email}</span>
          </Group>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Registrado',
        Cell: ({ row }) => (
          <span>
            {row.original.created_at
              ? dayjs(row.original.created_at).format(DATE_FORMAT_WITH_TIME)
              : ''}
          </span>
        ),
      },
    ],
    [],
  );

  //Manage MRT state that we want to pass to our API
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);
  const [columnFilterFns, setColumnFilterFns] = //filter modes
    useState<MRT_ColumnFilterFnsState>(
      Object.fromEntries(columns.map(({ accessorKey }) => [accessorKey, 'contains'])),
    ); //default to "contains" for all columns
  const [globalFilter, setGlobalFilter] = useState();
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

  const { data, isLoading, isError, isFetching } = usePatients({
    from: pagination.pageIndex * pagination.pageSize,
    to: pagination.pageIndex * pagination.pageSize + pagination.pageSize,
    sortBy: sorting[0]?.id,
    ascending: !sorting[0]?.desc,
    searchTerm: globalFilter,
  });

  const openEditPatientModal = (item: Patient) => {
    modals.openModal({
      modalId: 'patientsEditModal',
      centered: true,
      size: isMobile ? '100%' : 460,
      title: 'Editar paciente',
      children: <PatientsEditModal data={item} />,
      closeOnClickOutside: false,
    });
  };

  //this will depend on your API response shape
  const fetchedUsers = data?.data ?? [];
  const totalRowCount = data?.count ?? 0;

  const table = useMantineReactTable({
    columns,
    data: fetchedUsers,
    rowCount: totalRowCount,
    ...getMantineStyleAndOpts<Patient>(isError),
    enableRowActions: false,
    onColumnFilterFnsChange: setColumnFilterFns,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderTopToolbarCustomActions: () => (
      <Group align="center" gap="xs">
        <Avatar color="violet" radius="md">
          <IconUsers size="1.3rem" />
        </Avatar>
        <Text fz="1.2rem" fw={600}>
          {totalRowCount}
        </Text>
        <Text fz="0.875rem" c="dimmed">
          Pacientes
        </Text>
      </Group>
    ),
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        openEditPatientModal(row.original);
      },
      sx: {
        cursor: 'pointer',
      },
    }),
    state: {
      density: 'xs',
      columnFilterFns,
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isFetching,
      sorting,
    },
  });

  return <MantineReactTable table={table} />;
}
