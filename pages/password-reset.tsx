import { ReactElement } from 'react';
import {
  Paper,
  Title,
  Text,
  Button,
  Container,
  Group,
  Center,
  Box,
  Progress,
  PasswordInput,
} from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import Logo from '../components/Layout/Logo';
import { SubmitHandler, useForm } from 'react-hook-form';
import classes from '../styles/pages/password-reset.module.css';
import useSupabaseBrowser from '../utils/supabase/component';

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text c={meets ? 'teal' : 'red'} mt={5} size="sm">
      <Center inline>
        {meets ? <IconCheck size={14} stroke={1.5} /> : <IconX size={14} stroke={1.5} />}
        <Box ml={7}>{label}</Box>
      </Center>
    </Text>
  );
}

const requirements = [
  { re: /[0-9]/, label: 'Incluye un numero' },
  { re: /[a-z]/, label: 'Incluye una minuscula' },
  { re: /[A-Z]/, label: 'Incluye una mayuscula' },
];

function getStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

export default function PasswordReset() {
  const [value, setValue] = useInputState('');
  const strength = getStrength(value);
  const supabase = useSupabaseBrowser();

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
  ));

  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        styles={{ section: { transitionDuration: '0ms' } }}
        value={
          value.length > 0 && index === 0 ? 100 : strength >= ((index + 1) / 4) * 100 ? 100 : 0
        }
        color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
        key={index}
        size={4}
      />
    ));

  // form state
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<{ password: string }>({
    defaultValues: {
      password: '',
    },
  });

  const handlePaswordChange = async () => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: value });

      if (error) {
        showNotification({
          title: 'Lo sentimos!',
          message: error.message,
          color: 'red',
        });
      } else {
        console.log(data);
        showNotification({
          title: 'Listo!',
          message: 'Ya puedes iniciar sesion con tu nueva contraseña',
          color: 'green',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Lo sentimos!',
        message: 'No pudimos cambiar su contraseña, intente mas tarde',
        color: 'red',
      });
    }
  };

  const onSubmit: SubmitHandler<{ password: string }> = (data) => handlePaswordChange();

  return (
    <Container size={460} my={30}>
      <Center>
        <Logo />
      </Center>
      <Title className={classes.title} style={{ textAlign: 'center' }}>
        Actualizacion de contraseña
      </Title>
      <Text c="dimmed" size="sm" style={{ textAlign: 'center' }}>
        Ingresa una nueva contraseña que cumpla con los requisitos
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <PasswordInput
            value={value}
            onChange={setValue}
            placeholder="Nueva contraseña"
            label="Contraseña"
            required
          />

          <Group gap={5} grow mt="xs" mb="md">
            {bars}
          </Group>

          <PasswordRequirement
            label="Debe contener al menos 6 caracteres"
            meets={value.length > 5}
          />
          {checks}
          <Button type="submit" disabled={strength < 100} fullWidth mt="xl">
            Actualizar contraseña
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

PasswordReset.getLayout = function getLayout(page: ReactElement) {
  return <Box>{page}</Box>;
};
