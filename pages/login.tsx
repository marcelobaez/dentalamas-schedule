import { ReactElement, useState } from 'react';
import {
  TextInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Center,
  Box,
  PasswordInput,
  Space,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from '../components/layout/Logo';
import { SubmitHandler, useForm } from 'react-hook-form';
import classes from '../styles/pages/login.module.css';
import useSupabaseBrowser from '../utils/supabase/component';

type EmailFormvalues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseBrowser();

  // form state
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormvalues>({
    values: {
      email: '',
      password: '',
    },
  });

  const handleLoginWithEmail = async (values: EmailFormvalues) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
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
      router.push('/dashboard');
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

  const onSubmit: SubmitHandler<EmailFormvalues> = (data) => handleLoginWithEmail(data);

  return (
    <Container size={500} my={30}>
      <Center>
        <Logo />
      </Center>
      <Title className={classes.title} style={{ textAlign: 'center' }}>
        Bienvenido/a!
      </Title>
      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <Text size="md" style={{ textAlign: 'center' }}>
          Ingresa con email y contraseña
        </Text>
        <Space h="md" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Tu email"
            placeholder="email@ejemplo.com"
            error={errors.email && 'Campo requerido'}
            {...register('email', { required: true })}
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            error={errors.password ? 'Contraseña requerida' : ''}
            mt="md"
            {...register('password', { required: true })}
          />
          <Group justify="space-between" mt="lg" className={classes.controls}>
            <Link href="/reset" passHref legacyBehavior>
              <Anchor component="a" href="#" c="dimmed" size="sm" className={classes.control}>
                <Center inline>
                  <Box ml={5}>Olvidaste tu contraseña?</Box>
                </Center>
              </Anchor>
            </Link>
            <Button type="submit" loading={isSubmitting}>
              Inciar sesion
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

LoginPage.getLayout = function getLayout(page: ReactElement) {
  return <Box>{page}</Box>;
};
