import React from "react";

import { AnimatedEllipsis } from "../AnimatedEllipsis/AnimatedEllipsis";
import { sizeClasses } from "../styles";
import { Tooltip } from "../Tooltip/Tooltip";
import { baseClass, variantClasses } from "./styles";
import { ActionButtonProps } from "./types";

const widthClasses = {
  lg: "w-12",
  md: "w-10",
  sm: "w-8",
};

export const ActionButton = ({
  "aria-label": ariaLabel,
  busy = false,
  className = "",
  color = "neutral",
  "data-testid": testId = "action-button",
  disabled = false,
  icon,
  onClick,
  size = "md",
  tooltipPosition = "bottom-end",
  type = "button",
  variant = "outlined",
  ...rest
}: ActionButtonProps) => {
  const sizeClass = sizeClasses[size];
  const widthClass = widthClasses[size];
  const variantClass = variantClasses[variant][color];

  return (
    <Tooltip label={ariaLabel} position={tooltipPosition}>
      <button
        aria-label={ariaLabel}
        className={`
          ${baseClass}
          ${sizeClass}
          ${widthClass}
          ${variantClass}
          ${className}
        `}
        data-testid={testId}
        disabled={disabled || busy}
        onClick={onClick}
        type={type}
        {...rest}
      >
        {busy ? <AnimatedEllipsis /> : icon}
      </button>
    </Tooltip>
  );
};
