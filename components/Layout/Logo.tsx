import { useMantineColorScheme, Image } from '@mantine/core';
import Link from 'next/link';

function Logo() {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Link href="/" passHref>
      <Image
        src={colorScheme === 'dark' ? '/logo-dark.png' : '/logo.png'}
        alt="Logo image"
        w="auto"
        h={30}
        fit="contain"
      />
    </Link>
  );
}

export default Logo;
