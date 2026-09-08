"use client";

import { Bell, BellRing } from "lucide-react";
import { useEffect, useState } from "react";

import { ActionButton } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { useRouter } from "~/i18n/navigation";

type FollowContentButtonProps = {
  targetId: string;
  type: "event" | "venue";
};

export const FollowContentButton = ({ targetId, type }: FollowContentButtonProps) => {
  const i18n = useI18n();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUser();
  const { showError, showSuccess } = useNotifications();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsChecking(false);
      setIsFollowing(false);
      return;
    }
    setIsChecking(true);
    const controller = new AbortController();
    const params = new URLSearchParams({ scope: type, targetId });
    void fetch(`/api/following?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const result = (await response.json()) as { subscriptionId?: null | string };
        if (!response.ok) throw new Error();
        if (controller.signal.aborted) return;
        setIsFollowing(Boolean(result.subscriptionId));
      })
      .catch(() => {
        if (!controller.signal.aborted) setIsFollowing(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsChecking(false);
      });
    return () => controller.abort();
  }, [isAuthenticated, targetId, type]);

  const follow = async () => {
    if (isLoading || !isAuthenticated) return;
    if (isFollowing) {
      router.push("/following");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/following", {
        body: JSON.stringify({ scope: type, target: { id: targetId } }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Unable to follow this item");
      }
      setIsFollowing(true);
      showSuccess(i18n(type === "event" ? "Event updates enabled" : "Venue updates enabled"));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to follow this item"));
    } finally {
      setIsSaving(false);
    }
  };

  const label = type === "event" ? i18n("Get event updates") : i18n("Follow venue");

  // These controls belong to the signed-in experience. Keeping them out of the
  // public action bar also avoids an unauthenticated action that cannot complete.
  if (isLoading || !isAuthenticated) return null;

  return (
    <ActionButton
      aria-label={isFollowing ? i18n("Manage alerts") : label}
      busy={isSaving || isChecking}
      color="neutral"
      icon={isFollowing ? <BellRing aria-hidden size={20} /> : <Bell aria-hidden size={20} />}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void follow();
      }}
      variant="ghost"
    />
  );
};
