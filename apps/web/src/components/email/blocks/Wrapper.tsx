import { Body, Container, Head, Html, Tailwind } from "@react-email/components";
import * as React from "react";

import { Logo } from "./Logo";

type WrapperProps = {
  children: React.ReactNode;
};

export const Wrapper = ({ children }: Readonly<WrapperProps>) => {
  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                "neutral-300": "#9fa8b2",
                "neutral-400": "#88939f",
                "neutral-50": "#e6e9eb",
                "neutral-800": "#282d33",
                primary: "#336fb0",
              },
            },
          },
        }}
      >
        <Body className="bg-neutral-50 py-10 font-sans">
          <Container className={`mx-auto max-w-xl rounded-lg bg-white px-8 py-10 shadow-md`}>
            <Logo />
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
