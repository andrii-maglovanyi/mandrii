import { Img, Section, Text } from "@react-email/components";

import { UrlHelper } from "~/lib/url-helper";

export const Logo = () => (
  <Section className="text-center">
    <Img alt="Mandrii" className="mx-auto h-20" src={`https://${UrlHelper.getProductionHostname()}/static/logo.png`} />
    <Text className="mt-1.5 text-xs text-neutral-800">мандруй &bull; мрій &bull; дій</Text>
  </Section>
);
