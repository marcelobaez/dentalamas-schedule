import { Anchor, Center, useMantineColorScheme } from "@mantine/core";
import Link from 'next/link';
import Image from "next/image";

function Logo() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <Link href="/" passHref>
      <Anchor component="a">
          <Image src={colorScheme === 'dark' ? '/logo-dark.png': '/logo.png'} alt="me" width={160} height={45} />
      </Anchor>
    </Link>
  );
}

export default Logo;
