"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { SignInForm } from "~/components/layout/Auth/SignInForm";
import { useDialog } from "~/contexts/DialogContext";
import { useUser } from "~/hooks/useUser";
import { sendToMixpanel } from "~/lib/mixpanel";

interface UseAddEntityOptions {
  mixpanelEvent: string;
  mixpanelSource: string;
  route: string;
}

interface UseAddEntityResult {
  handleAdd: () => void;
  isAuthenticated: boolean;
}

export function useAddEntity({ mixpanelEvent, mixpanelSource, route }: UseAddEntityOptions): UseAddEntityResult {
  const { data: session } = useUser();
  const router = useRouter();
  const { openCustomDialog } = useDialog();

  const isAuthenticated = !!session;

  const handleAdd = useCallback(() => {
    sendToMixpanel(mixpanelEvent, {
      authenticated: isAuthenticated,
      source: mixpanelSource,
    });

    if (isAuthenticated) {
      router.push(route);
    } else {
      openCustomDialog({
        children: <SignInForm callbackUrl={route} />,
      });
    }
  }, [isAuthenticated, router, openCustomDialog, mixpanelEvent, mixpanelSource, route]);

  return { handleAdd, isAuthenticated };
}
