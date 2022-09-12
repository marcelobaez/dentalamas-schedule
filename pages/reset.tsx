import {
  createStyles,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Container,
  Center,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { ReactElement, useState } from 'react';
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

export default function ForgotPassword() {
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async (values: FormValues) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.api.resetPasswordForEmail(values.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/password-reset`,
      });

      console.log(data);

      if (error) {
        showNotification({
          title: 'Lo sentimos!',
          message: error.message,
          color: 'red',
        });
      } else {
        showNotification({
          title: 'Listo!',
          message: 'Revisa tu email para encontrar el link de reestablecimiento',
          color: 'green',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Lo sentimos!',
        message: 'No pudimos reestablecer su contraseña, intente mas tarde',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={460} my={30}>
      <Center>
        <Logo />
      </Center>
      <Title className={classes.title} align="center">
        Olvidaste tu contraseña?
      </Title>
      <Text color="dimmed" size="sm" align="center">
        Ingresa tu email para obtener un link de reestablecimiento
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <form onSubmit={form.onSubmit(handleLogin)}>
          <TextInput
            label="Tu email"
            placeholder="me@mail.com"
            required
            {...form.getInputProps('email')}
          />
          <Button loading={loading} type="submit" fullWidth mt="xl">
            Reestablecer contraseña
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

ForgotPassword.getLayout = function getLayout(page: ReactElement) {
  return <Box style={{ width: '100vw', height: '100vh' }}>{page}</Box>;
};
