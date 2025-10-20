import { Session } from "next-auth";
import { useI18n } from "~/i18n/useI18n";
import Image from "next/image";
import { User } from "lucide-react";
import clsx from "clsx";

interface AvatarProps {
  profile?: Session;
  className?: string;
  avatarSize?: number;
}

export const Avatar = ({ profile, className, avatarSize = 48 }: AvatarProps) => {
  const i18n = useI18n();
  const { image, name } = profile?.user ?? {};

  return (
    <div className={className}>
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
          className={clsx(`bg-surface flex items-center justify-center rounded-full text-neutral-500`)}
          style={{ height: avatarSize, width: avatarSize }}
        >
          <User size={avatarSize / 2} />
        </div>
      )}
    </div>
  );
};
