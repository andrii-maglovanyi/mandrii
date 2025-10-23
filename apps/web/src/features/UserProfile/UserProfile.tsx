"use client";

import { CalendarHeart, LayoutDashboard, Star, UserSearch } from "lucide-react";
import { useLocale } from "next-intl";

import { EmptyState } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { Locale } from "~/types";

import { UserForm } from "./UserForm";

export const UserProfile = () => {
  const { data, isLoading, refetchProfile, update } = useUser();
  console.log("data", data);
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

  const stats = [
    {
      icon: Star,
      label: i18n("points"),
      value: data.points ?? 0,
    },
    {
      icon: LayoutDashboard,
      label: i18n("venues"),
      value: data.venues_created ?? 0,
    },
    {
      icon: CalendarHeart,
      label: i18n("events"),
      value: data.events_created ?? 0,
    },
  ];

  return (
    <div className="flex flex-grow flex-col gap-8 py-4 md:py-8">
      <div className={`bg-surface-tint/50 rounded-2xl p-6 md:p-8`}>
        <div className="mb-8">
          <h2
            className={`from-primary to-secondary mb-2 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent md:text-3xl`}
          >
            {i18n("Your Profile")}
          </h2>
          <p className="text-neutral text-sm md:text-base">
            {i18n("Manage your account settings and view your community contributions")}
          </p>
        </div>

        <UserForm onSubmit={submitProfile} onSuccess={onProfileSaved} profile={data} />
      </div>

      <div>
        <h3
          className={`from-primary to-secondary mb-4 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent md:text-2xl`}
        >
          {i18n("Community Impact")}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              className={`group border-primary/20 from-primary/10 to-primary/5 hover:border-primary/40 hover:shadow-primary/10 relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all duration-300 hover:shadow-lg`}
              key={label}
            >
              <div
                className={`bg-primary/5 absolute -top-4 -right-4 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-110`}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-neutral text-sm font-medium">{label}</span>
                  <span
                    className={`from-primary to-secondary bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent md:text-4xl`}
                  >
                    {value}
                  </span>
                </div>
                <div
                  className={`bg-primary/10 text-primary group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
