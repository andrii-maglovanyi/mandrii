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

  return (
    <div className="flex cursor-default items-center space-x-3">
      {image ? (
        <Image
          alt={name ?? i18n("Someone")}
          className="rounded-full object-cover"
          height={avatarSize}
          src={image}
          width={avatarSize}
        />
      ) : (
        <div
          className={`
            flex items-center justify-center rounded-full bg-surface
            text-neutral-500
          `}
          style={{ height: avatarSize, width: avatarSize }}
        >
          <User size={20} />
        </div>
      )}
      <div className="flex flex-col text-on-surface">
        <div className="space-x-2">
          {name && <span className="font-semibold">{name}</span>}
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
