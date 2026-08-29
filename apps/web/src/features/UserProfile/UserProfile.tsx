"use client";

import { Eye, Settings, UserSearch } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

import { EmptyState, TextLink } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { type CommunityContributionStats } from "~/lib/gamification/community";
import { useGetOwnUserRecentContributionsQuery } from "~/types/graphql.generated";
import { Locale } from "~/types";

import { CommunityImpact } from "./CommunityImpact";
import { PublicContributions } from "./PublicContributions";
import { UserForm } from "./UserForm";

type ContributionCounts = Pick<CommunityContributionStats, "activeDays" | "events" | "reviews" | "venues">;

type LoadedContributionCounts = ContributionCounts & {
  userId: string;
};

export const UserProfile = () => {
  const { data, isLoading, refetchProfile, update } = useUser();
  const { showSuccess } = useNotifications();
  const locale = useLocale() as Locale;
  const i18n = useI18n();
  const [contributionStats, setContributionStats] = useState<LoadedContributionCounts | null>(null);
  const { data: recentContributions, loading: recentContributionsLoading } = useGetOwnUserRecentContributionsQuery({
    skip: !data?.id,
    variables: { id: data?.id! },
  });

  useEffect(() => {
    if (!data?.id) return;

    const abortController = new AbortController();

    const loadContributionStats = async () => {
      try {
        const response = await fetch("/api/user/contribution-stats", { signal: abortController.signal });
        if (!response.ok) throw new Error("Unable to load contribution stats");

        const stats = (await response.json()) as ContributionCounts;
        setContributionStats({ ...stats, userId: data.id });
      } catch {
        if (!abortController.signal.aborted) {
          setContributionStats({ activeDays: 0, events: 0, reviews: 0, userId: data.id, venues: 0 });
        }
      }
    };

    void loadContributionStats();
    return () => abortController.abort();
  }, [data?.id]);

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

  if (!contributionStats || contributionStats.userId !== data.id || recentContributionsLoading) {
    return <AnimatedEllipsis centered size="md" />;
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-end gap-4 px-4">
          <TextLink href={`/users/${data.username ?? data.id}`}>
            <Eye size={18} />
            {i18n("View your public profile")}
          </TextLink>
          &bull;
          <TextLink href="/user-profile/settings">
            <Settings size={18} />
            {i18n("Settings")}
          </TextLink>
        </div>
        <div className={`bg-surface-tint/50 rounded-2xl p-6 md:p-8`}>
          <div className="mb-8">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2
                className={`from-primary to-secondary bg-linear-to-r bg-clip-text text-2xl font-bold text-transparent md:text-3xl`}
              >
                {i18n("Your Profile")}
              </h2>
            </div>
            <p className={`text-neutral text-sm md:text-base`}>
              {i18n("Manage your account and view your contributions")}
            </p>
          </div>

          <UserForm onSubmit={submitProfile} onSuccess={onProfileSaved} profile={data} />
        </div>
      </div>

      <PublicContributions
        events={recentContributions?.events ?? []}
        showDirectoryLinks
        venues={recentContributions?.venues ?? []}
      />

      <CommunityImpact
        activeDays={contributionStats.activeDays}
        eventsCreated={contributionStats.events}
        isVerified={Boolean(data.is_verified_contributor)}
        points={data.points}
        reviewsWritten={contributionStats.reviews}
        showLeaderboardLink={data.role !== "admin"}
        venuesCreated={contributionStats.venues}
      />
    </div>
  );
};
