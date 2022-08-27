import { Anchor, Center } from "@mantine/core";
import Link from 'next/link';
import Image from "next/image";

function Logo() {
  return (
    <Link href="/" passHref>
      <Anchor component="a">
          <Image src="/logo.png" alt="me" width={180} height={50} />
      </Anchor>
    </Link>
  );
}

export default Logo;
