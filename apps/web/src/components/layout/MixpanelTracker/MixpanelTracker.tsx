"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

import { sendToMixpanel } from "~/lib/mixpanel";

type Props = {
  event: string;
  props?: Record<string, unknown>;
};

export function MixpanelTracker({ event, props }: Props) {
  const locale = useLocale();

  useEffect(() => {
    sendToMixpanel(event, { ...props, locale });
  }, [event, props, locale]);

  return null;
}
