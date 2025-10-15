import clsx from "clsx";
import React, { Ref, useId } from "react";

import { FieldErrorMessage } from "../FieldErrorMessage/FieldErrorMessage";
import { commonClass, commonInputClass } from "../styles";

export type TextareaProps = {
  className?: string;
  "data-testid"?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  label?: string;
  maxChars?: number;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  ref?: Ref<HTMLTextAreaElement>;
  required?: boolean;
  rows?: number;
  showErrorMessage?: boolean;
  value?: null | string;
};

export function Textarea({
  className = "",
  "data-testid": testId = "textarea",
  disabled = false,
  error,
  id,
  label,
  maxChars,
  name,
  onBlur,
  onChange = () => {},
  placeholder,
  ref,
  required = false,
  rows = 4,
  showErrorMessage = false,
  value = "",
}: Readonly<TextareaProps>) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  const charCount = value?.length ?? 0;
  const showCharCount = typeof maxChars === "number";
  const isOverLimit = showCharCount && charCount > maxChars;

  const textareaClass = clsx(
    "px-3 py-2.5",
    error || isOverLimit ? "border-red-500" : "border-neutral",
    commonClass,
    commonInputClass,
    className,
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-on-surface" htmlFor={textareaId}>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <textarea
        aria-required={required}
        className={textareaClass}
        data-testid={testId}
        disabled={disabled}
        id={textareaId}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        ref={ref}
        required={required}
        rows={rows}
        value={value ?? ""}
      />
      <div className="flex h-4 justify-between text-sm">
        {showErrorMessage && <FieldErrorMessage error={error} />}
        {showCharCount && (
          <span className={clsx(isOverLimit ? "text-red-500" : "text-neutral")}>
            {charCount} / {maxChars}
          </span>
        )}
      </div>
    </div>
  );
}
