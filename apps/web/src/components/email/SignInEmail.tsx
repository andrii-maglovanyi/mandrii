import { Heading, Hr, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailActionButton } from "./blocks/ActionButton";
import { Wrapper } from "./blocks/Wrapper";

type SignInEmailProps = {
  i18n: (key: string, params?: Record<string, string>) => string;
  url: string;
};

export default function SignInEmail({ i18n = (value) => value, url }: Readonly<SignInEmailProps>) {
  return (
    <Wrapper>
      <Section className="mt-2 text-center">
        <Heading className="mb-2 text-lg font-bold text-neutral-800">{i18n("Sign in to Mandrii")}</Heading>
        <Text className="text-neutral-600">{i18n("Tap the button below to access your account")}</Text>
      </Section>

      <Section className="mt-6 text-center text-white">
        <EmailActionButton url={url}>{i18n("Sign in")}</EmailActionButton>
      </Section>

      <Hr className="my-10 border-neutral-300" />

      <Section className="text-center text-sm text-neutral-400">
        <Text className="my-0">{i18n("If you didn't request this email, you can ignore it")}</Text>
      </Section>
    </Wrapper>
  );
}
