"use client";

import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { useUser } from "~/hooks/useUser";
import { UserForm } from "./UserForm";
import { EmptyState } from "~/components/ui";
import { UserSearch } from "lucide-react";
import { useI18n } from "~/i18n/useI18n";
import { Locale } from "~/types";
import { useLocale } from "next-intl";
import { useNotifications } from "~/hooks/useNotifications";

export const UserProfile = () => {
  const { data, isLoading, refetchProfile, update } = useUser();
  const { showSuccess } = useNotifications();
  const locale = useLocale() as Locale;
  const i18n = useI18n();

  if (isLoading) {
    return <AnimatedEllipsis centered size="md" />;
  }

  if (!data) {
    return (
      <EmptyState
        body={i18n("This is the glitch you get when there is no profile data available. Please contact me.")}
        heading={i18n("Oops! Who are you?")}
        icon={<UserSearch size={50} />}
      />
    );
  }

  const submitProfile = async (body: FormData) => {
    const res = await fetch(`/api/user/save?locale=${locale}`, {
      body,
      method: "POST",
    });

    const result = await res.json();

    return { errors: result.errors, ok: res.ok };
  };

  const onProfileSaved = async () => {
    showSuccess(i18n("Profile updated successfully"));

    await refetchProfile();
    await update();
  };

  return (
    <div className="mt-4 flex flex-grow flex-col space-y-6">
      <UserForm profile={data} onSubmit={submitProfile} onSuccess={onProfileSaved} />
    </div>
  );
};
