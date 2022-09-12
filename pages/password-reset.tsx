import { ReactElement } from 'react';
import {
  createStyles,
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
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { useInputState } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { IconCheck, IconX } from '@tabler/icons';
import Logo from '../components/Layout/Logo';

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text color={meets ? 'teal' : 'red'} mt={5} size="sm">
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

export default function PasswordReset() {
  const { classes } = useStyles();
  const [value, setValue] = useInputState('');
  const strength = getStrength(value);

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
  ));

  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        styles={{ bar: { transitionDuration: '0ms' } }}
        value={
          value.length > 0 && index === 0 ? 100 : strength >= ((index + 1) / 4) * 100 ? 100 : 0
        }
        color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
        key={index}
        size={4}
      />
    ));

  const form = useForm({
    initialValues: {
      password: '',
    },
  });

  console.log(strength);

  // Get inferred form values type
  type FormValues = typeof form.values;

  const handlePaswordChange = async () => {
    try {
      const { user, error } = await supabaseClient.auth.update({ password: value });

      if (error) {
        showNotification({
          title: 'Lo sentimos!',
          message: error.message,
          color: 'red',
        });
      } else {
        console.log(user);
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

  return (
    <Container size={460} my={30}>
      <Center>
        <Logo />
      </Center>
      <Title className={classes.title} align="center">
        Actualizacion de contraseña
      </Title>
      <Text color="dimmed" size="sm" align="center">
        Ingresa una nueva contraseña que cumpla con los requisitos
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <form onSubmit={form.onSubmit((values) => handlePaswordChange())}>
          <PasswordInput
            value={value}
            onChange={setValue}
            placeholder="Nueva contraseña"
            label="Contraseña"
            required
          />

          <Group spacing={5} grow mt="xs" mb="md">
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
        {/* <Group position="apart" mt="lg" className={classes.controls}>
          <Anchor color="dimmed" size="sm" className={classes.control}>
            <Center inline>
              <IconArrowLeft size={12} stroke={1.5} />
              <Box ml={5}>Regresar al inicio</Box>
            </Center>
          </Anchor>
        </Group> */}
      </Paper>
    </Container>
  );
}

PasswordReset.getLayout = function getLayout(page: ReactElement) {
  return <Box style={{ width: '100vw', height: '100vh' }}>{page}</Box>;
};
