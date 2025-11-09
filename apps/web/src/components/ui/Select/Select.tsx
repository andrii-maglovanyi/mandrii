"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { ChangeEvent, Ref, useEffect, useId, useRef, useState } from "react";

import { FieldErrorMessage } from "../FieldErrorMessage/FieldErrorMessage";
import { Menu, MenuHandle, MenuOption } from "../Menu/Menu";
import { commonClass, commonInputClass, sizeClasses } from "../styles";

export type SelectProps<K, T> = {
  className?: string;
  "data-testid"?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  label?: string;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onChange?: (e: { target: { value: T } } & ChangeEvent<HTMLSelectElement>) => void;
  options: Array<MenuOption<K, T>>;
  placeholder?: string;
  ref?: Ref<HTMLButtonElement>;
  required?: boolean;
  showErrorMessage?: boolean;
  value?: T;
};

export function Select<K extends React.ReactNode, T>({
  className = "",
  "data-testid": testId = "select",
  disabled = false,
  error,
  id,
  label,
  name,
  onBlur,
  onChange,
  options = [],
  placeholder = "Select...",
  ref,
  required = false,
  showErrorMessage = false,
  value,
}: Readonly<SelectProps<K, T>>) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const [focused, setFocused] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label ?? placeholder;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<MenuHandle>(null);

  useEffect(() => {
    const handleFocusOut = (e: FocusEvent) => {
      if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
        setFocused(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent | React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape") {
        setFocused(false);
      }
    };

    const node = wrapperRef.current;
    if (node) {
      node.addEventListener("focusout", handleFocusOut);
      node.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      node?.removeEventListener("keydown", handleKeyDown);
      node?.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const onSelectKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" && options.length > 0) {
      e.preventDefault();
      menuRef.current?.focusIndex(0);
    }
  };

  const selectClass = clsx(
    "flex items-center px-3 pr-10 text-left",
    sizeClasses.md,
    error ? "border-red-500" : "border-neutral",
    commonClass,
    commonInputClass,
    className,
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-on-surface" htmlFor={selectId}>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative" ref={wrapperRef}>
        <button
          aria-expanded={focused}
          aria-haspopup="listbox"
          className={selectClass}
          data-testid={testId}
          disabled={disabled}
          id={selectId}
          name={name}
          onBlur={onBlur}
          onClick={() => setFocused((f) => !f)}
          onKeyDown={onSelectKeyDown}
          ref={ref}
          type="button"
        >
          <span className="max-w-max min-w-full flex-1 truncate">{selectedLabel}</span>
          <ChevronDown
            aria-hidden
            className={clsx(`
              ml-2 shrink-0 text-neutral-500 transition-transform
            `, focused && `rotate-180`)}
            size={18}
          />
        </button>
        {focused && options.length > 0 && (
          <Menu
            onSelect={(value) => {
              const event = {
                target: {
                  name,
                  value,
                },
              } as { target: { value: T } } & ChangeEvent<HTMLSelectElement>;
              onChange?.(event);

              setFocused(false);
            }}
            options={options}
            ref={menuRef}
          />
        )}
      </div>
      {showErrorMessage && <FieldErrorMessage error={error} />}
    </div>
  );
}
