import { Session } from "next-auth";

import { useI18n } from "~/i18n/useI18n";

import { Avatar } from "../Avatar/Avatar";

interface UserProfileCardProps {
  profile: Session;
}

export const UserProfileCard = ({ profile }: UserProfileCardProps) => {
  const i18n = useI18n();

  const { user } = profile;
  const { email = "", name, role } = user;
  const userName = name ?? i18n("Someone");

  return (
    <div className="flex cursor-default items-center space-x-3">
      <Avatar profile={profile} />
      <div className="flex flex-col text-on-surface">
        <div className="space-x-2">
          <span className="font-semibold">{userName}</span>
          {role === "admin" ? (
            <div className={`
              inline-flex rounded bg-primary px-1 text-sm text-surface
            `}>admin</div>
          ) : null}
        </div>
        <span className="text-base text-neutral-500">{email}</span>
      </div>
    </div>
  );
};
