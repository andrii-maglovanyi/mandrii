"use client";

import { BadgeCheck, CalendarDays, MapPin, Pencil } from "lucide-react";
import { useLocale } from "next-intl";

import { Avatar } from "~/components/layout";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";

import { CommunityImpact } from "./CommunityImpact";
import { PublicContributions, type PublicEventContribution, type PublicVenueContribution } from "./PublicContributions";

export type PublicUserProfileData = {
  bio: null | string;
  city: null | string;
  events_created: number;
  id: string;
  image: null | string;
  is_verified_contributor: boolean;
  joined_at: null | string;
  last_seen_at: null | string;
  name: string;
  points: number;
  venues_created: number;
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
  const lastSeenMinutes = lastSeen ? Math.round((lastSeen.getTime() - Date.now()) / 60_000) : null;
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
          <Link className="absolute top-6 right-6 inline-flex items-center gap-2" href="/user-profile">
            <Pencil size={18} />
            {i18n("Edit your profile")}
          </Link>
        )}
        <div className={`flex flex-col items-center gap-6 text-center md:flex-row md:text-left`}>
          <Avatar avatarSize={174} className="border-primary m-0 rounded-full border" profile={profile} />
          <div className="flex flex-col gap-2">
            <h1 className={`text-3xl font-bold md:text-5xl`}>{profile.name}</h1>
            <div className="text-neutral flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm md:justify-start md:text-base">
              <span>{i18n("Community member")}</span>
              {profile.is_verified_contributor && (
                <span className="text-primary inline-flex items-center gap-1 font-medium">
                  <BadgeCheck size={18} />
                  {i18n("Verified contributor")}
                </span>
              )}
              {profile.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={16} />
                  {profile.city}
                </span>
              )}
              {joinedAt && (
                <>
                  &bull;
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={16} />
                    {i18n("Member since")} {joinedAt}
                  </span>
                </>
              )}
              {lastSeenLabel && !isOwnProfile && (
                <>
                  &bull;<span>{lastSeenLabel}</span>
                </>
              )}
            </div>
            {profile.bio && <p className="text-on-surface mt-3 max-w-2xl whitespace-pre-wrap">{profile.bio}</p>}
          </div>
        </div>
      </section>

      <PublicContributions events={events} venues={venues} />
      <CommunityImpact
        eventsCreated={profile.events_created}
        points={profile.points}
        venuesCreated={profile.venues_created}
      />
    </div>
  );
};
