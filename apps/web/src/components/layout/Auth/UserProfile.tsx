import { User } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";

import { useI18n } from "~/i18n/useI18n";

interface UserProfileCardProps {
  profile: Session;
}

export const UserProfileCard = ({ profile }: UserProfileCardProps) => {
  const avatarSize = 48;
  const i18n = useI18n();

  const { user } = profile;
  const { email = "", image, name, role } = user;
  const userName = name ?? i18n("Someone");

  return (
    <div className="flex cursor-default items-center space-x-3">
      {image ? (
        <Image
          alt={userName ?? i18n("Someone")}
          className="rounded-full object-cover"
          height={avatarSize}
          src={image}
          width={avatarSize}
        />
      ) : (
        <div
          className={`bg-surface flex items-center justify-center rounded-full text-neutral-500`}
          style={{ height: avatarSize, width: avatarSize }}
        >
          <User size={20} />
        </div>
      )}
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
