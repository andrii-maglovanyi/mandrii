import { User } from "lucide-react";
import Image from "next/image";

interface UserProfileProps {
  email: string;
  imageUrl?: null | string;
  name?: string;
}

export const UserProfile = ({ email, imageUrl, name }: UserProfileProps) => {
  const avatarSize = 48;

  return (
    <div className="flex cursor-default items-center space-x-3">
      {imageUrl ? (
        <Image
          alt={name ?? email}
          className="rounded-full object-cover"
          height={avatarSize}
          src={imageUrl}
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
        {name && <span className="font-semibold">{name}</span>}
        <span className="text-neutral-500">{email}</span>
      </div>
    </div>
  );
};
