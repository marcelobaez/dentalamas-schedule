import { Grid } from '@mantine/core';
import Head from 'next/head';
import AppointmentsTable from '../components/features/AppointmentsTable/AppointmentsTable';
import { GetServerSidePropsContext } from 'next';
import { createClient } from '../utils/supabase/server-props';

export default function Appointments() {
  return (
    <>
      <Head>
        <title>Turnos</title>
        <meta name="description" content="Gestion de turnos" />
      </Head>
      <Grid>
        <AppointmentsTable />
      </Grid>
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
