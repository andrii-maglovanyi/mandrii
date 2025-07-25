"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import { ActionButton } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

interface LoveButtonProps {
  onClick?: () => void;
}

export const LoveButton = ({ onClick }: LoveButtonProps) => {
  const i18n = useI18n();
  const router = useRouter();

  const handleClick = () => {
    router.push("/love");
    if (onClick) {
      onClick();
    }
  };

  return (
    <ActionButton
      aria-label={i18n("Join & Support")}
      icon={<Heart color="transparent" fill="crimson" />}
      onClick={handleClick}
      variant="ghost"
    />
  );
};
