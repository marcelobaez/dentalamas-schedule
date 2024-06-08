import { useMantineColorScheme, Image } from '@mantine/core';
import Link from 'next/link';
// import Image from 'next/legacy/image';

function Logo() {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Link href="/" passHref>
      <Image
        src={colorScheme === 'dark' ? '/logo-dark.png' : '/logo.png'}
        alt="Logo image"
        width={108}
        height={30}
      />
    </Link>
  );
}

export default Logo;
