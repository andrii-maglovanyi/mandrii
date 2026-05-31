"use client";

import { LogIn, Plus } from "lucide-react";

import { Button } from "~/components/ui";

interface AddEntityButtonProps {
  className?: string;
  isAuthenticated: boolean;
  label: string;
  onClick: () => void;
  signInLabel: string;
  size?: "lg" | "md" | "sm";
}

const GRADIENT_CLASSES =
  "animate-[gradientShift_5s_ease_infinite] border border-on-surface bg-[linear-gradient(270deg,#f9556d,#9670f7,#4d94f8,#20c997)] bg-size-[300%_300%] font-semibold text-white shadow-xl gap-2 p-5";

export function AddEntityButton({
  className,
  isAuthenticated,
  label,
  onClick,
  signInLabel,
  size = "md",
}: AddEntityButtonProps) {
  const iconSize = size === "sm" ? 16 : 20;

  return (
    <Button
      className={`${GRADIENT_CLASSES} ${className ?? ""}`}
      color="primary"
      onClick={onClick}
      size={size}
      variant="filled"
    >
      {isAuthenticated ? (
        <>
          <Plus size={iconSize} strokeWidth={3} />
          {label}
        </>
      ) : (
        <>
          <LogIn size={iconSize} strokeWidth={3} />
          {signInLabel}
        </>
      )}
    </Button>
  );
}
