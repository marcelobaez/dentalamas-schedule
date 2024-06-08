import { Paper, Title, Text, TextInput, Button, Container, Center, Box } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { ReactElement, useState } from 'react';
import Logo from '../components/Layout/Logo';
import { SubmitHandler, useForm } from 'react-hook-form';
import classes from '../styles/pages/reset.module.css';
import useSupabaseBrowser from '../utils/supabase/component';
import { getURL } from '../utils';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseBrowser();

  // form state
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<{ email: string }>({
    defaultValues: {
      email: '',
    },
  });

  const handleLogin = async (values: { email: string }) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${getURL()}password-reset`,
      });

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

  const onSubmit: SubmitHandler<{ email: string }> = (data) => handleLogin(data);

  return (
    <Container size={460} my={30}>
      <Center>
        <Logo />
      </Center>
      <Title className={classes.title} style={{ textAlign: 'center' }}>
        Olvidaste tu contraseña?
      </Title>
      <Text c="dimmed" size="sm" style={{ textAlign: 'center' }}>
        Ingresa tu email para obtener un link de reestablecimiento
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Tu email"
            placeholder="me@mail.com"
            required
            error={
              errors.email
                ? errors.email.type === 'pattern'
                  ? 'Email no valido'
                  : 'Email requerido'
                : ''
            }
            {...register('email', { pattern: /^\S+@\S+$/ })}
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
  return <Box>{page}</Box>;
};
