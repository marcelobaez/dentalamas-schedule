import { Anchor, useMantineColorScheme } from '@mantine/core';
import Link from 'next/link';
import Image from 'next/image';

function Logo() {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Link href="/" passHref>
      <Anchor component="a" sx={() => ({lineHeight: 1})}>
        <Image
          src={colorScheme === 'dark' ? '/logo-dark.png' : '/logo.png'}
          alt="Logo image"
          width={136}
          height={38}
        />
      </Anchor>
    </Link>
  );
}

export default Logo;
