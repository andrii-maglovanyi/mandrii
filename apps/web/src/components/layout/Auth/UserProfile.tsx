import { useI18n } from "~/i18n/useI18n";
import { UserSession } from "~/types/user";

import { Avatar } from "../Avatar/Avatar";

interface UserProfileCardProps {
  profile: UserSession;
}

export const UserProfileCard = ({ profile }: UserProfileCardProps) => {
  const i18n = useI18n();

  const { email = "", name, role } = profile;
  const userName = name ?? i18n("Someone");

  return (
    <div className="flex cursor-default items-center space-x-3">
      <Avatar profile={profile} />
      <div className="text-on-surface flex flex-col">
        <div className="space-x-2">
          <span className="font-semibold">{userName}</span>
          {role === "admin" ? (
            <div className={`bg-primary text-surface inline-flex rounded px-1 text-sm`}>admin</div>
          ) : null}
        </div>
        <span className="text-base text-neutral-500">{email}</span>
      </div>
    </div>
  );
};
