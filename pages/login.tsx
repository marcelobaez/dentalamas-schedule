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
  Divider,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from '../components/Layout/Logo';
import { SubmitHandler, useForm } from 'react-hook-form';
import classes from '../styles/pages/login.module.css';
import useSupabaseBrowser from '../utils/supabase/component';
import { getURL } from '../utils';

type OTPFormValues = {
  email: string;
};

type EmailFormvalues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const supabase = useSupabaseBrowser();

  // form state
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EmailFormvalues>({
    values: {
      email: '',
      password: '',
    },
  });

  // form state
  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: errorsOTP },
  } = useForm<OTPFormValues>({
    defaultValues: {
      email: '',
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

  const handleEmailLogin = async (values: OTPFormValues) => {
    try {
      setEmailLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: getURL(),
        },
      });
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

  const onSubmit: SubmitHandler<EmailFormvalues> = (data) => handleLoginWithEmail(data);

  const onOTPSubmit: SubmitHandler<OTPFormValues> = (data) => handleEmailLogin(data);

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
            required
            mt="md"
            {...register('password')}
          />
          <Group justify="space-between" mt="lg" className={classes.controls}>
            <Link href="/reset" passHref legacyBehavior>
              <Anchor component="a" href="#" c="dimmed" size="sm" className={classes.control}>
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
        <form onSubmit={handleSubmitOTP(onOTPSubmit)}>
          <TextInput
            {...registerOTP('email', { required: true })}
            label="Tu email"
            placeholder="email@ejemplo.com"
            error={errorsOTP.email ? 'Campo requerido' : ''}
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
  return <Box>{page}</Box>;
};
