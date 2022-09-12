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
  PasswordInput,
  Space,
  Divider,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { useUser } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import Logo from '../components/Layout/Logo';

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
  const [emailLoading, setEmailLoading] = useState(false);
  const { user, isLoading } = useUser();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Email no valido'),
    },
  });

  const emailForm = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Email no valido'),
    },
  });

  // Get inferred form values type
  type FormValues = typeof form.values;

  // Get inferred form values type
  type EmailFormValues = typeof emailForm.values;

  useEffect(() => {
    if (user) {
      router.push('/calendar');
    }
  }, [isLoading, user]);

  const handleLogin = async (values: FormValues) => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.auth.signIn(
        { email: values.email, password: values.password },
        { redirectTo: process.env.NEXT_PUBLIC_SITE_URL },
      );
      if (error) {
        error.status === 403
          ? showNotification({
              title: 'Lo sentimos!',
              message: 'Los registros no estan habilitados. Solicite al administrador una cuenta',
              color: 'red',
            })
          : showNotification({
              title: 'Error',
              message: 'Usuario y/o contraseña no validos',
              color: 'red',
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

  const handleEmailLogin = async (values: EmailFormValues) => {
    try {
      setEmailLoading(true);
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
      setEmailLoading(false);
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
      <Center>
        <Logo />
      </Center>
      <Title className={classes.title} align="center">
        Bienvenido/a!
      </Title>
      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <Text size="md" align="center">
          Ingresa con email y contraseña
        </Text>
        <Space h="md" />
        <form onSubmit={form.onSubmit(handleLogin)}>
          <TextInput
            label="Tu email"
            placeholder="email@ejemplo.com"
            required
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          <Group position="apart" mt="lg" className={classes.controls}>
            <Link href="/reset" passHref>
              <Anchor component="a" href="#" color="dimmed" size="sm" className={classes.control}>
                <Center inline>
                  <Box ml={5}>Olvidaste tu contraseña?</Box>
                </Center>
              </Anchor>
            </Link>
            <Button type="submit" loading={loading}>
              Inciar sesion
            </Button>
          </Group>
        </form>
        <Space h="md" />
        <Divider label="O accede con un link en tu correo" labelPosition="center" />
        <form onSubmit={emailForm.onSubmit(handleEmailLogin)}>
          <TextInput
            label="Tu email"
            placeholder="email@ejemplo.com"
            {...emailForm.getInputProps('email')}
          />
          <Button loading={emailLoading} fullWidth mt="xl" type="submit">
            Obtener link
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

LoginPage.getLayout = function getLayout(page: ReactElement) {
  return <Box style={{ width: '100vw', height: '100vh' }}>{page}</Box>;
};
