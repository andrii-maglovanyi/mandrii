import clsx from "clsx";
import { User } from "lucide-react";
import Image from "next/image";

import { useI18n } from "~/i18n/useI18n";
import { UserSession } from "~/types/user";

interface AvatarProps {
  avatarSize?: number;
  className?: string;
  profile?: UserSession;
}

export const Avatar = ({ avatarSize = 48, className, profile }: AvatarProps) => {
  const i18n = useI18n();
  const { image, name } = profile ?? {};

  return (
    <div className={className}>
      {image ? (
        <div
          className={`border-primary relative overflow-hidden rounded-full border`}
          style={{ height: avatarSize, width: avatarSize }}
        >
          <Image alt={name ?? i18n("Someone")} className="object-cover" fill src={image} />
        </div>
      ) : (
        <div
          className={clsx(`bg-surface flex items-center justify-center rounded-full text-neutral-500`)}
          style={{ height: avatarSize, width: avatarSize }}
        >
          <User size={avatarSize / 2} />
        </div>
      )}
    </div>
  );
};
