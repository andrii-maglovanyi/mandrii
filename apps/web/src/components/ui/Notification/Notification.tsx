"use client";

import { Frown, Info, Meh, Smile } from "lucide-react";
import { memo, useEffect } from "react";

import { ColorVariant } from "~/types";

export interface SnackbarProps {
  header?: string;
  index?: number;
  message: string;
  onClose: () => void;
  open?: boolean;
  variant: ColorVariant;
}

const calculateDisplayTime = (message: string) => {
  const words = message.split(" ").length;
  const timePerWord = 1000;

  return Math.min(Math.max(words * timePerWord, 5000), 15000);
};

const getIcon = (variant: ColorVariant) => {
  switch (variant) {
    case ColorVariant.Error:
      return <Frown size={32} />;
    case ColorVariant.Info:
      return <Info size={32} />;
    case ColorVariant.Success:
      return <Smile size={32} />;
    case ColorVariant.Warning:
      return <Meh size={32} />;
  }
};

export const Notification = memo(function Snackbar({
  header,
  index = 0,
  message,
  onClose,
  open = false,
  variant,
}: SnackbarProps) {
  const SNACKBAR_HEIGHT = header ? 75 : 50; // px

  useEffect(() => {
    setTimeout(onClose, calculateDisplayTime(message));
  }, [message, onClose]);

  return (
    open && (
      <div
        className={`bg-on-surface text-surface fixed right-0 bottom-4 left-0 z-50 mx-auto flex w-min max-w-[90%] min-w-96 transform items-center justify-between rounded-lg p-4 transition-transform`}
        style={{
          height: `${SNACKBAR_HEIGHT}px`,
          transform: `translateY(${-index / 2 - index * SNACKBAR_HEIGHT}px)`,
        }}
      >
        <div className="pr-4">{getIcon(variant)}</div>
        <div className="grow">
          {header ? <div className="mb-1 text-lg font-semibold">{header}</div> : null}
          <div className="truncate">{message}</div>
        </div>
      </div>
    )
  );
});
