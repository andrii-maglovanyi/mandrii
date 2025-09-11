"use client";
import { useSession } from "next-auth/react";

import { useI18n } from "~/i18n/useI18n";

export const Profile = () => {
  const i18n = useI18n();

  const { data: profileData } = useSession();

  return (
    <div className="flex flex-grow flex-col space-y-6">
      <h1 className="text-4xl font-bold">{i18n("Profile")}</h1>

      <h2>{profileData?.user.name}</h2>
    </div>
  );
};
