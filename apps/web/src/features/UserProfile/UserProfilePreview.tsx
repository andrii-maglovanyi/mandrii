"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar } from "~/components/layout";
import { AnimatedEllipsis } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";

import type { PublicUserProfileData } from "./PublicUserProfile";

type UserProfilePreviewProps = {
  fallbackName: string;
  userId: string;
};

export const UserProfilePreview = ({ fallbackName, userId }: UserProfilePreviewProps) => {
  const i18n = useI18n();
  const { closeDialog } = useDialog();
  const [profile, setProfile] = useState<null | PublicUserProfileData>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/public`, { signal: abortController.signal });
        if (!response.ok) throw new Error("Unable to load profile");

        const data = (await response.json()) as { profile: PublicUserProfileData };
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
    events_created: 0,
    id: userId,
    image: null,
    is_verified_contributor: false,
    joined_at: null,
    last_seen_at: null,
    name: fallbackName,
    points: 0,
    venues_created: 0,
  };

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Avatar avatarSize={80} profile={displayedProfile} />
      <div>
        <p className="text-xl font-semibold">{displayedProfile.name}</p>
        <p className="text-neutral mt-1 text-sm">{i18n("Community member")}</p>
      </div>
      <Link
        className="bg-primary hover:bg-primary-hover inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
        href={`/users/${userId}`}
        onClick={closeDialog}
      >
        {i18n("View full profile")}
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );
};
