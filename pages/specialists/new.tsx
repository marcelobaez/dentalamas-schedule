import { Paper } from '@mantine/core';
import { createClient } from '../../utils/supabase/server-props';
import { SpecialistCreateForm } from '../../components/forms/SpecialistCreateForm';
import { GetServerSidePropsContext } from 'next';

export default function NewSpecialist() {
  return (
    <Paper p="md">
      <SpecialistCreateForm />
    </Paper>
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
