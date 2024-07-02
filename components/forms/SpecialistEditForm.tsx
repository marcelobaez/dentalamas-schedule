import { Box, Tabs, LoadingOverlay, Title, Stack, Breadcrumbs, Anchor } from '@mantine/core';
import React from 'react';
import { Tables } from '../../types/supabase';
import { SpecialistInfoEditForm } from './SpecialistInfoEditForm';
import SpecialistTreatmentEditForm from './SpecialistTreatmentEditForm';
import useSpecialistByID from '../../hooks/useSpecialists/useSpecialistByID';
import SpecialistWDEditForm from './SpecialistWDEditForm';
import SpecialistNonWDEditForm from './SpecialistNonWDEditForm';
import Link from 'next/link';

export type SpecialistFormValues = {
  specialist: Omit<Tables<'specialists'>, 'id' | 'created_at'>;
  workingDays: { checked: boolean; start_time: string; end_time: string; day_of_week: number }[];
  treatments: { id: number; name: string; checked: boolean }[];
  nonWorkingDays: Tables<'non_working_days'>[];
  breaks: Tables<'breaks'>[];
};

export type ExtendedSpecialist = Tables<'specialists'> & {
  specialist_working_days: Tables<'specialist_working_days'>[];
  treatments: Tables<'treatments'>[];
  specialist_treatments: Tables<'specialist_treatments'>[];
  non_working_days: Tables<'non_working_days'>[];
  breaks: Tables<'breaks'>[];
  specialist_blocks: Tables<'specialist_blocks'>[];
};

export function SpecialistEditForm({ id }: { id: number }) {
  const { data, status } = useSpecialistByID(id);

  if (status === 'pending')
    return (
      <Box pos="relative">
        <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      </Box>
    );

  if (status === 'error') return <div>Hubo un error</div>;

  return (
    <Stack>
      <Breadcrumbs>
        <Anchor href="/specialists" component={Link}>
          Especialistas
        </Anchor>
        <Anchor href={`/specialists/details/${id}`} component={Link}>
          Detalles
        </Anchor>
      </Breadcrumbs>
      <Title order={1} fz="1.35rem">{`Editar: ${data.data.firstName} ${data.data.lastName}`}</Title>
      <Tabs defaultValue="specialist">
        <Tabs.List>
          <Tabs.Tab value="specialist">Informacion</Tabs.Tab>
          <Tabs.Tab value="treatments">Tratamientos</Tabs.Tab>
          <Tabs.Tab value="workDays">Dias Laborales</Tabs.Tab>
          <Tabs.Tab value="blocks">Bloqueos</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="specialist">
          <SpecialistInfoEditForm data={data.data} />
        </Tabs.Panel>

        <Tabs.Panel value="treatments">
          <SpecialistTreatmentEditForm data={data.data} />
        </Tabs.Panel>

        <Tabs.Panel value="workDays">
          <SpecialistWDEditForm data={data.data} />
        </Tabs.Panel>

        <Tabs.Panel value="blocks">
          <SpecialistNonWDEditForm data={data.data} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
