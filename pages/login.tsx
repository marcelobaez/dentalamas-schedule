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
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';

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
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (email: string) => {
    try {
      setLoading(true)
      const { error } = await supabaseClient.auth.signIn({ email })
      if (error) throw error
      showNotification({
        title: 'Listo!',
        message: 'Revisa tu email para encontrar el link de acceso',
        color: 'green'
      })
    } catch (error) {
      // alert(error.error_description || error.message)
      console.log(error)
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
        <TextInput label="Tu email" placeholder="" type={'email'} required onChange={(e) => setEmail(e.target.value)} value={email}/>
        <Group position="apart" mt="lg" className={classes.controls}>
          <Anchor color="dimmed" size="sm" className={classes.control}>
            <Center inline>
              <IconArrowLeft size={12} stroke={1.5} />
              <Box ml={5}>Regresar a la pagina de inicio</Box>
            </Center>
          </Anchor>
          <Button onClick={() => handleLogin(email)} disabled={loading} loading={loading} className={classes.control}>Obtener link</Button>
        </Group>
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