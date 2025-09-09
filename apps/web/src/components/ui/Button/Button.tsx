import React from "react";

import { sizeClasses } from "../styles";
import { AnimatedEllipsis } from "./AnimateEllipsis";
import { baseClass, variantClasses } from "./styles";
import { ButtonProps } from "./types";

const paddingClasses = {
  lg: "px-6",
  md: "px-4",
  sm: "px-3",
};

export const Button = ({
  busy = false,
  children,
  className = "",
  color = "neutral",
  "data-testid": testId = "button",
  disabled = false,
  isFeatured = false,
  onClick,
  size = "md",
  type = "button",
  variant = "filled",
  ...rest
}: ButtonProps) => {
  const sizeClass = sizeClasses[size];
  const paddingClass = paddingClasses[size];
  const variantClass = isFeatured ? variantClasses.featured : variantClasses[variant][color];

  return (
    <button
      className={`
        ${baseClass}
        ${sizeClass}
        ${paddingClass}
        ${variantClass}
        ${className}
      `}
      data-testid={testId}
      disabled={disabled || busy}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {children}
      {busy && <AnimatedEllipsis el="." />}
    </button>
  );
};
