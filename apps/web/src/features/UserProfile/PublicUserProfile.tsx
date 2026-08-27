"use client";

import { BadgeCheck, CalendarDays, MapPin, ShieldCheck, UserCog } from "lucide-react";
import { useLocale } from "next-intl";

import { Avatar } from "~/components/layout";
import { RichText, TextLink } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { CommunityLevelBadge } from "~/features/Gamification/CommunityLevel";

import { CommunityImpact } from "./CommunityImpact";
import { PublicContributions, type PublicEventContribution, type PublicVenueContribution } from "./PublicContributions";

export type PublicUserProfileData = {
  active_day_count: number;
  bio: null | string;
  city: null | string;
  event_count: number;
  id: string;
  image: null | string;
  isAdmin: boolean;
  is_verified_contributor: boolean;
  joined_at: null | string;
  last_seen_at: null | string;
  name: string;
  points: number;
  review_count: number;
  venue_count: number;
};

type PublicUserProfileProps = {
  events: PublicEventContribution[];
  isOwnProfile: boolean;
  profile: PublicUserProfileData;
  venues: PublicVenueContribution[];
};

export const PublicUserProfile = ({ events, isOwnProfile, profile, venues }: PublicUserProfileProps) => {
  const i18n = useI18n();
  const locale = useLocale();
  const dateLocale = locale === "uk" ? "uk-UA" : "en-GB";
  const relativeTimeFormatter = new Intl.RelativeTimeFormat(dateLocale, { numeric: "auto" });

  const lastSeen = profile.last_seen_at ? new Date(profile.last_seen_at) : null;
  const lastSeenTime = lastSeen?.getTime();
  const lastSeenMinutes =
    lastSeenTime === undefined || Number.isNaN(lastSeenTime)
      ? null
      : Math.min(0, Math.round((lastSeenTime - Date.now()) / 60_000));
  const joinedAtDate = profile.joined_at ? new Date(profile.joined_at) : null;
  const joinedAt =
    joinedAtDate && !Number.isNaN(joinedAtDate.getTime())
      ? new Intl.DateTimeFormat(dateLocale, { month: "long", year: "numeric" }).format(joinedAtDate)
      : null;
  const lastSeenLabel =
    lastSeenMinutes === null
      ? null
      : lastSeenMinutes > -5
        ? i18n("Active recently")
        : `${i18n("Last active")} ${relativeTimeFormatter.format(lastSeenMinutes, "minute")}`;

  return (
    <div className={`flex grow flex-col gap-8 py-4 md:py-8`}>
      <section className={`bg-surface-tint/50 relative rounded-2xl p-6 md:p-8`}>
        {isOwnProfile && (
          <div className="mb-2 flex justify-center sm:mb-0 sm:justify-end">
            <TextLink className="relative" href="/user-profile">
              <UserCog size={18} />
              {i18n("Manage your profile")}
            </TextLink>
          </div>
        )}
        <div className={`flex flex-col items-center gap-6 text-center md:flex-row md:text-left`}>
          <Avatar avatarSize={174} className="border-primary m-0 rounded-full border" profile={profile} />
          <div className="flex flex-col gap-2">
            <h1 className={`text-3xl font-bold md:text-5xl`}>{profile.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm md:justify-start md:text-base">
              <CommunityLevelBadge points={profile.points} />
              {profile.isAdmin && (
                <>
                  &bull;
                  <span className="text-primary inline-flex items-center gap-1 font-medium">
                    <ShieldCheck size={18} />
                    {i18n("Platform admin")}
                  </span>
                </>
              )}
              {profile.is_verified_contributor && (
                <>
                  &bull;
                  <span className="text-primary inline-flex items-center gap-1 font-medium">
                    <BadgeCheck size={18} />
                    {i18n("Trusted contributor")}
                  </span>
                </>
              )}
            </div>
            {(profile.city || joinedAt || (lastSeenLabel && !isOwnProfile)) && (
              <div className="text-neutral flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm md:justify-start md:text-base">
                {profile.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={16} />
                    {profile.city}
                  </span>
                )}
                {joinedAt && profile.city && <span aria-hidden="true">&bull;</span>}
                {joinedAt && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={16} />
                    {i18n("Member since")} {joinedAt}
                  </span>
                )}
                {lastSeenLabel && !isOwnProfile && (profile.city || joinedAt) && <span aria-hidden="true">&bull;</span>}
                {lastSeenLabel && !isOwnProfile && <span>{lastSeenLabel}</span>}
              </div>
            )}
            {profile.bio && <RichText className="text-on-surface mt-3 max-w-2xl">{profile.bio}</RichText>}
          </div>
        </div>
      </section>

      <PublicContributions events={events} showDirectoryLinks={isOwnProfile} venues={venues} />
      <CommunityImpact
        activeDays={profile.active_day_count}
        eventsCreated={profile.event_count}
        isVerified={profile.is_verified_contributor}
        points={profile.points}
        reviewsWritten={profile.review_count}
        showLeaderboardLink={!profile.isAdmin}
        venuesCreated={profile.venue_count}
      />
    </div>
  );
};
