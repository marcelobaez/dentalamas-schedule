import { GetServerSidePropsContext } from 'next/types';
import { createClient } from '../utils/supabase/server-props';
import {
  Alert,
  Avatar,
  Box,
  Button,
  LoadingOverlay,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from '@mantine/core';
import { IconBuilding, IconInfoCircle, IconLocation } from '@tabler/icons-react';
import useLocations from '../hooks/useLocations/useLocations';
import Head from 'next/head';

export default function Locations() {
  const { data, status } = useLocations();

  if (status === 'pending')
    return (
      <Box pos="relative" w="100%" h="calc(100dvh - 96px)">
        <LoadingOverlay visible zIndex={1000} overlayProps={{ blur: 2 }} />
      </Box>
    );

  if (status === 'error')
    return (
      <Alert variant="light" color="red" title="Hubo un error!" icon={<IconInfoCircle />}>
        Intente nuevamente en un instante. Si el error persiste, contacte al soporte
      </Alert>
    );

  return (
    <>
      <Head>
        <title>Sucursales</title>
        <meta name="description" content="Sucursales" />
      </Head>
      <Title order={1} fz="1.5rem" pb="md">
        Sucursales
      </Title>
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing={{ base: 10, sm: 'xl' }}
        verticalSpacing={{ base: 'md', sm: 'xl' }}
      >
        {data.data.map((location, index) => (
          <Paper
            key={`card-${index}-location`}
            radius="md"
            withBorder
            p="lg"
            bg="var(--mantine-color-body)"
          >
            <Avatar size={120} radius={120} mx="auto">
              <IconBuilding size="3rem" />
            </Avatar>
            <Text ta="center" fz="lg" fw={500} mt="md">
              {location.title}
            </Text>
            <Text ta="center" c="dimmed" fz="sm">
              {location.streetAddress}
            </Text>

            <Button variant="default" fullWidth mt="md" leftSection={<IconLocation size="1rem" />}>
              Ver Ubicacion
            </Button>
          </Paper>
        ))}
      </SimpleGrid>
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
