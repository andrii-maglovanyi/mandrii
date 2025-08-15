/* eslint-disable @next/next/no-img-element */
import { Section, Text } from "@react-email/components";

import { constants } from "~/lib/constants";

export const Logo = () => (
  <Section className="text-center">
    <img alt="Mandrii" className="mx-auto h-20" src={`${constants.baseUrl}/static/logo.svg`} />
    <Text className="mt-1.5 text-xs">мандруй &bull; мрій &bull; дій</Text>
  </Section>
);
