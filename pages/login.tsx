import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { ReactElement, useEffect, useState } from 'react';
import {
  TextInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  createStyles,
  Center,
  Box,
  Loader,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { useUser } from '@supabase/auth-helpers-react';

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 26,
    fontWeight: 900,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  controls: {
    [theme.fn.smallerThan('xs')]: {
      flexDirection: 'column-reverse',
    },
  },

  control: {
    [theme.fn.smallerThan('xs')]: {
      width: '100%',
      textAlign: 'center',
    },
  },
}));

export default function LoginPage() {
  const router = useRouter();
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false);
  const { user, isLoading } = useUser();

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Email no valido'),
    },
  });

  // Get inferred form values type
  type FormValues = typeof form.values;

  useEffect(() => {
    if (user) {
      router.push('/calendar');
    }
  }, [isLoading, user]);

  const handleLogin = async (values: FormValues) => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.auth.signIn(
        { email: values.email },
        { redirectTo: process.env.NEXT_PUBLIC_SITE_URL },
      );
      if (error && error.status === 403) {
        showNotification({
          title: 'Lo sentimos!',
          message: 'Los registros no estan habilitados. Solicite al administrador una cuenta',
          color: 'red',
        });
      } else {
        showNotification({
          title: 'Listo!',
          message: 'Revisa tu email para encontrar el link de acceso',
          color: 'green',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Lo sentimos!',
        message: 'Ocurrio un error al intentar inciar sesion',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading && !user)
    return (
      <Container sx={() => ({ height: '100%' })}>
        <Center>
          <Loader size={'xl'} />
        </Center>
      </Container>
    );

  return (
    <Container size={500} my={30}>
      <Title className={classes.title} align="center">
        Bienvenido/a!
      </Title>
      <Text color="dimmed" size="sm" align="center">
        Ingresa tu email para obtener un link de acceso
      </Text>
      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <form onSubmit={form.onSubmit(handleLogin)}>
          <TextInput
            label="Tu email"
            placeholder="email@ejemplo.com"
            required
            {...form.getInputProps('email')}
          />
          <Group position="apart" mt="lg" className={classes.controls}>
            <Anchor color="dimmed" size="sm" className={classes.control}>
              <Center inline>
                <IconArrowLeft size={12} stroke={1.5} />
                <Box ml={5}>Regresar a la pagina de inicio</Box>
              </Center>
            </Anchor>
            <Button type="submit" loading={loading} className={classes.control}>
              Obtener link
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

LoginPage.getLayout = function getLayout(page: ReactElement) {
  return <Box style={{ width: '100vw', height: '100vh' }}>{page}</Box>;
};
