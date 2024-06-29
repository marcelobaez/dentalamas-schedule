import { Paper } from '@mantine/core';
import { createClient } from '../../../utils/supabase/server-props';
import { SpecialistEditDrawer } from '../../../components/forms/SpecialistEditDrawer';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { z } from 'zod';

// Define a schema for the query parameter
const queryParamSchema = z
  .string()
  .refine(
    (value) => {
      const number = Number(value);
      return !isNaN(number);
    },
    {
      message: 'String must be parseable as a number',
    },
  )
  .transform((value) => Number(value));

const parseQueryParam = (param: string | string[] | undefined) => {
  const result = queryParamSchema.safeParse(param);
  if (!result.success) {
    console.error(result.error);
    return undefined;
  }
  return result.data;
};

export default function SpecialistDetails() {
  const {
    query: { id },
  } = useRouter();

  const parsed = parseQueryParam(id);

  if (!parsed) return <div>Parametro invalido</div>;

  return (
    <Paper p="md" shadow="sm" radius="sm">
      <SpecialistEditDrawer id={parsed} />
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
