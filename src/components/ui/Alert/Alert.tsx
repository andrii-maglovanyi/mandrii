"use client";

import clsx from "clsx";
import { CheckCircle, Info, TriangleAlert, X } from "lucide-react";
import React, { useState } from "react";

import { ColorVariant } from "~/types";

import { ActionButton } from "../Button/ActionButton";

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  dismissLabel?: string;
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
  dismissLabel = "Dismiss",
  onDismiss,
  variant = ColorVariant.Error,
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const { bgColor, icon: Icon, textColor } = alertConfig[variant];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    isVisible && (
      <div
        aria-live="polite"
        className={clsx(
          "flex h-12 items-center rounded-md pr-1 pl-4",
          bgColor,
          textColor,
          className,
        )}
        role="alert"
      >
        <div className="mr-3 flex-shrink-0">
          <Icon aria-hidden="true" />
        </div>

        <div className="flex-1">
          <div className="text-sm leading-relaxed">{children}</div>
        </div>

        <ActionButton
          aria-label={dismissLabel}
          icon={<X />}
          onClick={handleDismiss}
          variant="ghost"
        />
      </div>
    )
  );
};
