import { getUser, supabaseClient } from '@supabase/auth-helpers-nextjs';
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
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ApiError } from 'next/dist/server/api-utils';
import { useForm } from '@mantine/form';

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

export default function AuthenticationTitle() {
  const router = useRouter();
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      email: ''
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Email no valido'),
    },
  });

  // Get inferred form values type
  type FormValues = typeof form.values;

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/calendar');
        }
      }
    )

    return () => {
      authListener!.unsubscribe()
    }
  }, [])

  const handleLogin = async (values: FormValues) => {
    try {
      setLoading(true)
      const { error } = await supabaseClient.auth.signIn({ email: values.email }, {redirectTo: process.env.NEXT_PUBLIC_SITE_URL})
      if (error && error.status === 403) {
        showNotification({
          title: 'Lo sentimos!',
          message: 'Los registros no estan habilitados. Solicite al administrador una cuenta',
          color: 'red'
        })
      } else {
        showNotification({
          title: 'Listo!',
          message: 'Revisa tu email para encontrar el link de acceso',
          color: 'green'
        })
      }
    } catch (error) {
      showNotification({
        title: 'Lo sentimos!',
        message: 'Ocurrio un error al intentar inciar sesion',
        color: 'red'
      })
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

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
          <TextInput label="Tu email" placeholder="email@ejemplo.com" required {...form.getInputProps('email')}/>
          <Group position="apart" mt="lg" className={classes.controls}>
            <Anchor color="dimmed" size="sm" className={classes.control}>
              <Center inline>
                <IconArrowLeft size={12} stroke={1.5} />
                <Box ml={5}>Regresar a la pagina de inicio</Box>
              </Center>
            </Anchor>
            <Button type='submit' loading={loading} className={classes.control}>Obtener link</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

AuthenticationTitle.getLayout = function getLayout(page: ReactElement) {
  return (
    <Box style={{width: '100vw', height: '100vh'}}>
      {page}
    </Box>
  )
}