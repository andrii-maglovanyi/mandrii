import clsx from "clsx";
import React from "react";

import { AnimatedEllipsis } from "../AnimatedEllipsis/AnimatedEllipsis";
import { sizeClasses } from "../styles";
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
  ref,
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
      className={clsx(baseClass, sizeClass, paddingClass, variantClass, className)}
      data-testid={testId}
      disabled={disabled || busy}
      onClick={onClick}
      ref={ref}
      type={type}
      {...rest}
    >
      {children}
      {busy && <AnimatedEllipsis el="." />}
    </button>
  );
};
