import { Avatar, Button, Drawer, Group, Stack, Text, Tooltip, rem } from '@mantine/core';
import useSpecialists from '../hooks/useSpecialists/useSpecialists';
import Head from 'next/head';
import { GetServerSidePropsContext } from 'next';
import { IconUserPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
  MantineReactTable,
  useMantineReactTable,
} from 'mantine-react-table';
import { createClient } from '../utils/supabase/server-props';
import { getMantineStyleAndOpts } from '../utils';
import StethoscopeIcon from '../components/assets/icons/StethoscopeIcon';
import { useDisclosure } from '@mantine/hooks';
import { SpecialistCreateForm } from '../components/forms/SpecialistCreateForm';
import { Tables } from '../types/supabase';
import { SpecialistEditForm } from '../components/forms/SpecialistEditForm';

type StringDays = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';

const laborDays: Record<StringDays, number> = {
  L: 1,
  M: 2,
  X: 3,
  J: 4,
  V: 5,
  S: 6,
  D: 7,
};

type WorkDay = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type ExtendedSpecialist = Tables<'specialists'> & {
  specialist_working_days: Tables<'specialist_working_days'>[];
  treatments: Tables<'treatments'>[];
  specialist_treatments: Tables<'specialist_treatments'>[];
  locations: Tables<'locations'>[];
};

const getColorByDay = (day: StringDays, workDays: WorkDay[]) => {
  const numberDay = laborDays[day];
  const workDay = workDays.find((item) => item.day_of_week === numberDay);

  return workDay ? 'violet.3' : 'gray.4';
};

const getRangeLabelByDay = (day: StringDays, workDays: WorkDay[]) => {
  const numberDay = laborDays[day];

  const workDay = workDays.find((item) => item.day_of_week === numberDay);

  return workDay ? `${workDay.start_time} - ${workDay.end_time}` : 'No laboral';
};

export default function Specialists() {
  const [createFormOpened, createFormHandlers] = useDisclosure(false);
  const [editFormOpened, editFormHandlers] = useDisclosure(false);
  const [selectedStaff, setStaff] = useState<
    Tables<'specialists'> & {
      specialist_working_days: Tables<'specialist_working_days'>[];
      treatments: Tables<'treatments'>[];
      specialist_treatments: Tables<'specialist_treatments'>[];
    }
  >();
  const columns = useMemo<MRT_ColumnDef<ExtendedSpecialist>[]>(
    () => [
      {
        accessorKey: 'lastName',
        header: 'Nombre',
        Cell: ({ row }) => (
          <Group gap="sm" wrap="nowrap">
            <Avatar radius="xl" size="md" color="violet" variant="transparent" />
            <div>
              <Text fz="sm" fw={500}>
                {`${row.original.lastName}, ${row.original.firstName}`}
              </Text>
              <Text c="dimmed" fz="xs">
                {row.original.title}
              </Text>
            </div>
          </Group>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Contacto',
        enableSorting: false,
        Cell: ({ row }) => (
          <div>
            <Text fz="sm" fw={500}>
              {row.original.phone}
            </Text>
            <Text fz="xs" c="gray">
              {row.original.email}
            </Text>
          </div>
        ),
      },
      {
        accessorKey: 'specialist_working_days',
        header: 'Disponibilidad',
        enableSorting: false,
        Cell: ({ row }) => {
          return (
            <Group gap="0.2rem" wrap="nowrap">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                <Tooltip
                  key={day}
                  label={getRangeLabelByDay(
                    day as StringDays,
                    row.original.specialist_working_days,
                  )}
                >
                  <Avatar
                    color={getColorByDay(day as StringDays, row.original.specialist_working_days)}
                    // key={day}
                    radius="xl"
                    size="sm"
                    variant="filled"
                  >
                    {day}
                  </Avatar>
                </Tooltip>
              ))}
            </Group>
          );
        },
      },
      {
        accessorKey: 'treatments',
        header: 'Tratamientos asignados',
        enableSorting: false,
        size: 200,
        Cell: ({ row }) => {
          const cellValue = row.original.treatments.flatMap((item) => item.name).join(', ');
          return (
            <div style={{ maxWidth: 300 }}>
              <Text truncate="end" fz="sm" title={cellValue}>
                {cellValue}
              </Text>
            </div>
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
      id: 'lastName',
      desc: false,
    },
  ]);

  // get data
  const { data, isLoading, isError, isFetching } = useSpecialists();

  //this will depend on your API response shape
  const fetchedUsers = data?.data ?? [];
  const totalRowCount = data?.count ?? 0;

  const table = useMantineReactTable({
    columns,
    data: fetchedUsers,
    rowCount: totalRowCount,
    ...getMantineStyleAndOpts<ExtendedSpecialist>(isError),
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
          Profesionales
        </Text>
      </Group>
    ),
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        setStaff(row.original);
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
        <title>Profesionales</title>
        <meta name="description" content="Gestion de pacientes" />
      </Head>
      <Stack>
        <Group justify="space-between">
          <Text fw={600} size={'xl'}>
            Profesionales
          </Text>
          <Button
            leftSection={<IconUserPlus size={16} />}
            onClick={() => createFormHandlers.open()}
          >
            Nuevo profesional
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
          title="Nuevo profesional"
          closeOnClickOutside={false}
        >
          <SpecialistCreateForm />
        </Drawer>
        {/* Edit staff Drawer */}
        <Drawer
          offset={8}
          size={rem(570)}
          position="right"
          radius="md"
          opened={editFormOpened}
          onClose={editFormHandlers.close}
          title={`Editar info: ${
            selectedStaff ? selectedStaff.firstName + ' ' + selectedStaff.lastName : ''
          }`}
          closeOnClickOutside={false}
        >
          {selectedStaff && <SpecialistEditForm data={selectedStaff} />}
        </Drawer>
      </Stack>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createClient(ctx);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: data.user,
    },
  };
};
