import clsx from "clsx";
import { User } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";

import { useI18n } from "~/i18n/useI18n";

interface AvatarProps {
  avatarSize?: number;
  className?: string;
  profile?: Session;
}

export const Avatar = ({ avatarSize = 48, className, profile }: AvatarProps) => {
  const i18n = useI18n();
  const { image, name } = profile?.user ?? {};

  return (
    <div className={className}>
      {image ? (
        <div
          className={`
            relative overflow-hidden rounded-full border border-primary
          `}
          style={{ height: avatarSize, width: avatarSize }}
        >
          <Image alt={name ?? i18n("Someone")} className="object-cover" fill src={image} />
        </div>
      ) : (
        <div
          className={clsx(`
            flex items-center justify-center rounded-full bg-surface
            text-neutral-500
          `)}
          style={{ height: avatarSize, width: avatarSize }}
        >
          <User size={avatarSize / 2} />
        </div>
      )}
    </div>
  );
};
