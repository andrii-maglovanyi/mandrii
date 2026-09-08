"use client";

import clsx from "clsx";
import { type ReactNode, type Ref, useId } from "react";

export type SwitchProps = {
  "aria-label"?: string;
  checked?: boolean;
  className?: string;
  "data-testid"?: string;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  label?: ReactNode;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLInputElement>;
  size?: "md" | "sm";
};

const sizeClasses = {
  md: {
    thumb: "h-5 w-5 peer-checked:translate-x-5",
    track: "h-6 w-11",
  },
  sm: {
    thumb: "h-4 w-4 peer-checked:translate-x-4",
    track: "h-5 w-9",
  },
};

/** An accessible native checkbox presented as an on/off switch. */
export function Switch({
  "aria-label": ariaLabel,
  checked = false,
  className,
  "data-testid": testId = "switch",
  description,
  disabled = false,
  id,
  label,
  name,
  onChange,
  ref,
  size = "md",
}: Readonly<SwitchProps>) {
  const generatedId = useId();
  const switchId = id ?? generatedId;
  const dimensions = sizeClasses[size];
  const inputStateProps = onChange ? { checked, onChange } : { defaultChecked: checked };

  return (
    <div className={clsx("flex items-start gap-3", className, disabled && "cursor-not-allowed opacity-60")}>
      <div className="relative shrink-0">
        <input
          aria-label={ariaLabel}
          className="peer sr-only"
          data-testid={testId}
          disabled={disabled}
          id={switchId}
          name={name}
          ref={ref}
          role="switch"
          type="checkbox"
          {...inputStateProps}
        />
        <label
          className={clsx(
            "peer-focus-visible:ring-primary peer-disabled:bg-neutral/20 bg-neutral/35 peer-checked:bg-primary peer-focus-visible:ring-offset-surface relative block cursor-pointer rounded-full transition peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed",
            dimensions.track,
          )}
          htmlFor={switchId}
        >
          <span
            className={clsx(
              "bg-surface pointer-events-none absolute top-0.5 left-0.5 rounded-full shadow-sm transition-transform",
              dimensions.thumb,
            )}
          />
        </label>
      </div>
      {(label || description) && (
        <label className={clsx("min-w-0", disabled ? "cursor-not-allowed" : "cursor-pointer")} htmlFor={switchId}>
          {label && <span className="text-on-surface block font-medium">{label}</span>}
          {description && <span className="text-neutral mt-0.5 block text-sm leading-snug">{description}</span>}
        </label>
      )}
    </div>
  );
}
