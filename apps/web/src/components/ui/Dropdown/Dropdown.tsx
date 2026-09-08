"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { Button } from "../Button/Button";
import type { ButtonColor, ButtonVariant } from "../Button/types";

type DropdownProps = {
  "aria-label": string;
  children: ReactNode;
  className?: string;
  color?: ButtonColor;
  contentClassName?: string;
  disabled?: boolean;
  label: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  size?: "lg" | "md" | "sm";
  variant?: ButtonVariant;
};

/**
 * A compact, accessible dropdown for controls that must stay interactive while
 * open (unlike Menu, which is a single-select listbox).
 */
export function Dropdown({
  "aria-label": ariaLabel,
  children,
  className,
  color = "neutral",
  contentClassName,
  disabled = false,
  label,
  onOpenChange,
  open: openProp,
  size = "sm",
  variant = "ghost",
}: Readonly<DropdownProps>) {
  const contentId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (!open) return;

    const updatePlacement = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPlacement(
        window.innerHeight - rect.bottom < 220 && rect.top > window.innerHeight - rect.bottom ? "top" : "bottom",
      );
    };
    const closeOnOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    document.addEventListener("mousedown", closeOnOutsideInteraction);
    document.addEventListener("touchstart", closeOnOutsideInteraction);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      document.removeEventListener("mousedown", closeOnOutsideInteraction);
      document.removeEventListener("touchstart", closeOnOutsideInteraction);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <Button
        aria-controls={open ? contentId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        className={className}
        color={color}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        ref={triggerRef}
        size={size}
        variant={variant}
      >
        {label}
        <ChevronDown aria-hidden className={clsx("transition-transform", open && "rotate-180")} size={17} />
      </Button>
      {open && (
        <div
          aria-label={ariaLabel}
          className={clsx(
            "bg-surface text-on-surface absolute right-0 z-50 min-w-72 rounded-xl p-3 shadow-xl",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
            contentClassName,
          )}
          id={contentId}
          role="dialog"
        >
          {children}
        </div>
      )}
    </div>
  );
}
