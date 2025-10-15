"use client";

import clsx from "clsx";
import { CheckCircle, Info, TriangleAlert, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { ColorVariant } from "~/types";

import { ActionButton } from "../Button/ActionButton";

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  dismissLabel?: string;
  fadeAfter?: number;
  onDismiss?: () => void;
  variant?: ColorVariant;
}

const alertConfig = {
  error: {
    bgColor: "bg-red-500/20",
    icon: TriangleAlert,
    textColor: "text-red-800 dark:text-red-200",
  },
  info: {
    bgColor: "bg-blue-500/20",
    icon: Info,
    textColor: "text-blue-800 dark:text-blue-200",
  },
  success: {
    bgColor: "bg-green-500/20",
    icon: CheckCircle,
    textColor: "text-green-800 dark:text-green-200",
  },
  warning: {
    bgColor: "bg-yellow-500/20",
    icon: TriangleAlert,
    textColor: "text-yellow-800 dark:text-yellow-200",
  },
};

export const Alert = ({
  children,
  className,
  dismissLabel,
  fadeAfter,
  onDismiss,
  variant = ColorVariant.Error,
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const { bgColor, icon: Icon, textColor } = alertConfig[variant];

  const handleDismiss = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (!fadeAfter) return;
    const timer = setTimeout(handleDismiss, fadeAfter);
    return () => clearTimeout(timer);
  }, [fadeAfter, handleDismiss]);

  return (
    isVisible && (
      <div
        aria-live="polite"
        className={clsx(
          `flex w-full items-center gap-2 rounded-lg px-4 py-2.5 transition-opacity duration-300`,
          bgColor,
          textColor,
          isFading && "opacity-0",
          className,
        )}
        role="alert"
      >
        <div className="mr-3 flex-shrink-0">
          <Icon aria-hidden="true" size={18} />
        </div>

        <div className="flex-1">
          <div className="text-sm leading-relaxed">{children}</div>
        </div>

        {dismissLabel ? (
          <ActionButton aria-label={dismissLabel} icon={<X />} onClick={handleDismiss} variant="ghost" />
        ) : null}
      </div>
    )
  );
};
