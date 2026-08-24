import clsx from "clsx";
import Image from "next/image";

import { getPublicMediaUrl } from "~/lib/media";
import { getSenderColour, getSenderInitials } from "~/lib/messaging/sender";

type ParticipantAvatarProps = {
  className?: string;
  image?: null | string;
  name: string;
  size?: "lg" | "md" | "sm";
};

export const ParticipantAvatar = ({ className, image, name, size = "md" }: ParticipantAvatarProps) => {
  const senderColour = getSenderColour(name);
  const imageUrl = getPublicMediaUrl(image);
  const sizeClassName = size === "lg" ? "h-20 w-20 text-xl" : size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm";

  return (
    <div
      className={clsx(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold tracking-tight text-white",
        sizeClassName,
        imageUrl ? "border-primary border" : senderColour.avatarClassName,
        className,
      )}
    >
      {imageUrl ? (
        <Image
          alt=""
          className="object-cover"
          fill
          sizes={size === "lg" ? "80px" : size === "sm" ? "36px" : "40px"}
          src={imageUrl}
        />
      ) : (
        getSenderInitials(name)
      )}
    </div>
  );
};
