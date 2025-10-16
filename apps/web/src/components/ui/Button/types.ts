import { Ref } from "react";

import { Position } from "../Tooltip/Tooltip";

export interface ActionButtonProps extends BaseButton {
  "aria-label": string;
  icon: React.ReactNode;
  tooltipPosition?: Position;
}
export type ButtonColor = "danger" | "neutral" | "primary";
export interface ButtonProps extends BaseButton {
  children: React.ReactNode;
  isFeatured?: boolean;
}

export type ButtonType = "button" | "reset" | "submit";

export type ButtonVariant = "filled" | "ghost" | "outlined";

interface BaseButton {
  busy?: boolean;
  className?: string;
  color?: ButtonColor;
  "data-testid"?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  ref?: Ref<HTMLButtonElement>;
  size?: "lg" | "md" | "sm";
  type?: ButtonType;
  variant?: ButtonVariant;
}
