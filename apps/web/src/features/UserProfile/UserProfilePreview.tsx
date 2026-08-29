"use client";

import { ArrowUpRight, BadgeCheck, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

import { Avatar } from "~/components/layout";
import { AnimatedEllipsis } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { CommunityLevelBadge } from "~/features/Gamification/CommunityLevel";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { Locale } from "~/types";

import type { PublicUserProfileData } from "./PublicUserProfile";

type UserProfilePreviewProps = {
  fallbackName: string;
  userId: string;
};

type UserProfilePreviewData = Pick<
  PublicUserProfileData,
  | "bio"
  | "city"
  | "id"
  | "image"
  | "isAdmin"
  | "is_verified_contributor"
  | "joined_at"
  | "last_seen_at"
  | "name"
  | "points"
  | "username"
>;

export const UserProfilePreview = ({ fallbackName, userId }: UserProfilePreviewProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { closeDialog } = useDialog();
  const [profile, setProfile] = useState<null | UserProfilePreviewData>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/public`, { signal: abortController.signal });
        if (!response.ok) throw new Error("Unable to load profile");

        const data = (await response.json()) as { profile: UserProfilePreviewData };
        setProfile(data.profile);
      } catch {
        if (!abortController.signal.aborted) setHasError(true);
      }
    };

    void load();
    return () => abortController.abort();
  }, [userId]);

  if (!profile && !hasError) {
    return (
      <div aria-live="polite" className="flex min-h-36 items-center justify-center">
        <AnimatedEllipsis size="md" />
      </div>
    );
  }

  const displayedProfile = profile || {
    bio: null,
    city: null,
    id: userId,
    image: null,
    isAdmin: false,
    is_verified_contributor: false,
    joined_at: null,
    last_seen_at: null,
    name: fallbackName,
    points: 0,
    username: null,
  };
  const dateLocale = locale === "uk" ? "uk-UA" : "en-GB";
  const relativeTimeFormatter = new Intl.RelativeTimeFormat(dateLocale, { numeric: "auto" });
  const lastSeen = displayedProfile.last_seen_at ? new Date(displayedProfile.last_seen_at) : null;
  const lastSeenTime = lastSeen?.getTime();
  const lastSeenMinutes =
    lastSeenTime === undefined || Number.isNaN(lastSeenTime)
      ? null
      : Math.min(0, Math.round((lastSeenTime - Date.now()) / 60_000));
  const lastSeenLabel =
    lastSeenMinutes === null
      ? null
      : lastSeenMinutes > -5
        ? i18n("Active recently")
        : `${i18n("Last active")} ${relativeTimeFormatter.format(lastSeenMinutes, "minute")}`;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Avatar avatarSize={80} profile={displayedProfile} />
      <div className="flex max-w-md flex-col items-center">
        <p className="text-xl font-semibold">{displayedProfile.name}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <CommunityLevelBadge points={displayedProfile.points} />
          {displayedProfile.isAdmin && (
            <p className="text-primary inline-flex items-center gap-1 text-xs font-medium">
              <ShieldCheck aria-hidden size={14} />
              {i18n("Platform admin")}
            </p>
          )}
          {displayedProfile.is_verified_contributor && (
            <p className="text-primary inline-flex items-center gap-1 text-xs font-medium">
              <BadgeCheck aria-hidden size={14} />
              {i18n("Trusted contributor")}
            </p>
          )}
        </div>
        {(displayedProfile.city || lastSeenLabel) && (
          <div className="text-neutral mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            {displayedProfile.city && (
              <p className="inline-flex items-center gap-1">
                <MapPin aria-hidden size={14} />
                {displayedProfile.city}
              </p>
            )}
            {displayedProfile.city && lastSeenLabel && <span aria-hidden="true">&bull;</span>}
            {lastSeenLabel && (
              <p className="inline-flex items-center gap-1">
                <Clock3 aria-hidden size={14} />
                {lastSeenLabel}
              </p>
            )}
          </div>
        )}
      </div>
      <Link
        className="bg-primary hover:bg-primary-hover inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:no-underline"
        href={`/users/${displayedProfile.username ?? userId}`}
        onClick={closeDialog}
      >
        {i18n("View full profile")}
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );
};
