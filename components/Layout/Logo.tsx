import { Anchor, Center } from "@mantine/core";
import Image from "next/image";

function Logo() {
  return (
    // <Anchor href="/" target="_blank">
      <Center style={{width: '100%', height: '60px'}}>
        <Image src="/logo.png" alt="me" width={180} height={50} />
      </Center>
    // </Anchor>
  );
}

export default Logo;
