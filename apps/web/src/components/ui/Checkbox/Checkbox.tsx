"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import { Ref, useId } from "react";

import { FieldErrorMessage } from "../FieldErrorMessage/FieldErrorMessage";

export type CheckboxProps = {
  checked?: boolean;
  className?: string;
  "data-testid"?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  label?: string;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLInputElement>;
  required?: boolean;
  showErrorMessage?: boolean;
  value?: boolean | string;
};

export function Checkbox({
  checked: checkedProp,
  className = "",
  "data-testid": testId = "checkbox",
  disabled = false,
  error,
  id,
  label,
  name,
  onBlur,
  onChange,
  ref,
  required = false,
  showErrorMessage = false,
  value,
}: Readonly<CheckboxProps>) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  const isChecked = checkedProp !== undefined ? checkedProp : Boolean(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const checkboxClass = clsx(
    "flex h-7 w-7 items-center justify-center rounded border-2 transition",
    "cursor-pointer border-neutral bg-surface",
    "peer-checked:border-primary peer-checked:bg-primary",
    `
      peer-disabled:pointer-events-none peer-disabled:cursor-default
      peer-disabled:border-neutral-disabled peer-disabled:bg-neutral-500/10
    `,
    `
      peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-1
      peer-focus:ring-offset-surface peer-focus:outline-none
    `,
    error && "border-red-500",
    className,
  );

  const labelClass = clsx(
    "text-base text-on-surface select-none",
    disabled ? "pointer-events-none cursor-not-allowed text-neutral-disabled" : `
      cursor-pointer
    `,
  );

  return (
    <div className="flex flex-col gap-1">
      <div className={clsx("flex items-center gap-3", disabled && `
        cursor-not-allowed
      `)}>
        <div className="relative">
          <input
            aria-required={required}
            checked={isChecked}
            className="peer absolute opacity-0"
            data-testid={testId}
            disabled={disabled}
            id={checkboxId}
            name={name}
            onBlur={onBlur}
            onChange={handleChange}
            ref={ref}
            required={required}
            type="checkbox"
          />
          <label className={checkboxClass} htmlFor={checkboxId}>
            {isChecked && (
              <Check className={clsx("text-white", disabled && `
                stroke-neutral-disabled
              `)} size={18} strokeWidth={3} />
            )}
          </label>
        </div>
        {label && (
          <label className={labelClass} htmlFor={checkboxId}>
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
      </div>
      {showErrorMessage && <FieldErrorMessage error={error} />}
    </div>
  );
}
