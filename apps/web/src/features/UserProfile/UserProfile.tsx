"use client";

import { Eye, UserSearch } from "lucide-react";
import { useLocale } from "next-intl";

import { EmptyState } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { Link } from "~/i18n/navigation";
import { Locale } from "~/types";

import { UserForm } from "./UserForm";
import { CommunityImpact } from "./CommunityImpact";

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
    <div className={`flex grow flex-col gap-8 py-4 md:py-8`}>
      <div className={`bg-surface-tint/50 rounded-2xl p-6 md:p-8`}>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2
              className={`from-primary to-secondary mb-2 bg-linear-to-r bg-clip-text text-2xl font-bold text-transparent md:text-3xl`}
            >
              {i18n("Your Profile")}
            </h2>
            <Link className="inline-flex items-center gap-2" href={`/users/${data.id}`}>
              <Eye size={18} />
              {i18n("View your public profile")}
            </Link>
          </div>
          <p className={`text-neutral text-sm md:text-base`}>
            {i18n("Manage your account settings and view your community contributions")}
          </p>
        </div>

        <UserForm onSubmit={submitProfile} onSuccess={onProfileSaved} profile={data} />
      </div>

      <CommunityImpact eventsCreated={data.events_created} points={data.points} venuesCreated={data.venues_created} />
    </div>
  );
};
