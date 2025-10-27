"use client";

import Editor, { ICommand } from "@uiw/react-md-editor";
import clsx from "clsx";
import React, { ChangeEvent, forwardRef, Ref, useId } from "react";

import { FieldErrorMessage } from "../FieldErrorMessage/FieldErrorMessage";
import { commonClass, commonInputClass } from "../styles";

export type MDEditorProps = {
  className?: string;
  "data-testid"?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  isDark?: boolean;
  label?: string;
  maxChars?: number;
  name: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  ref?: Ref<HTMLDivElement>;
  required?: boolean;
  showErrorMessage?: boolean;
  value?: null | string;
};

export const MDEditor = forwardRef<HTMLDivElement, Readonly<MDEditorProps>>(
  (
    {
      className = "",
      "data-testid": testId = "md-editor",
      disabled = false,
      error,
      id,
      isDark,
      label,
      maxChars,
      name,
      onBlur,
      onChange,
      placeholder,
      required = false,
      showErrorMessage = false,
      value = "",
    },
    ref,
  ) => {
    const generatedId = useId();
    const editorId = id ?? generatedId;

    const charCount = value?.length ?? 0;
    const showCharCount = typeof maxChars === "number";
    const isOverLimit = showCharCount && charCount > maxChars;

    const editorClass = clsx(
      error || isOverLimit ? "border-red-500" : "border-on-surface",
      commonClass,
      commonInputClass,
      className,
    );

    const handleMDChange = (val: string | undefined) => {
      if (onChange) {
        const syntheticEvent = {
          target: { value: val || "" },
        } as ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-on-surface text-sm font-medium" htmlFor={editorId}>
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        <div className={editorClass} data-testid={testId} id={editorId} ref={ref}>
          <Editor
            commandsFilter={(cmd: ICommand) => {
              if (cmd.name && /(code|codeBlock|comment|image)/.test(cmd.name)) {
                return false;
              }
              return cmd;
            }}
            data-color-mode={isDark ? "dark" : "light"}
            height={400}
            onBlur={onBlur}
            onChange={handleMDChange}
            textareaProps={{
              disabled,
              name,
              placeholder,
              required,
            }}
            value={value || ""}
          />
        </div>

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
  },
);

MDEditor.displayName = "MDEditor";
