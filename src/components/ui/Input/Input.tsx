"use client";

import clsx from "clsx";
import { Ref, useEffect, useId, useMemo, useRef, useState } from "react";

import { FieldErrorMessage } from "../FieldErrorMessage/FieldErrorMessage";
import { Menu, MenuHandle, MenuOption } from "../Menu/Menu";
import { commonClass, commonInputClass, sizeClasses } from "../styles";

export type InputProps<K, T> = {
  className?: string;
  "data-testid"?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  label?: string;
  name?: string;
  onBlur?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onSelectSuggestion?: (value: string) => void;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
  required?: boolean;
  showErrorMessage?: boolean;
  suggestions?: Array<SuggestOption<K, T>>;
  type?: string;
  value?: string;
};

export type SuggestOption<K, T> = MenuOption<K, T> | string;

export function Input<K extends string, T extends string>({
  className = "",
  "data-testid": testId = "input",
  disabled = false,
  error,
  id,
  label,
  name,
  onBlur,
  onChange,
  onFocus,
  onSelectSuggestion,
  placeholder,
  ref,
  required = false,
  showErrorMessage = false,
  suggestions = [],
  type = "text",
  value,
}: Readonly<InputProps<K, T>>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [query, setQuery] = useState<string>(String(value ?? ""));
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(
    () =>
      query && showSuggestions
        ? suggestions.filter((suggestion) =>
            (typeof suggestion === "string" ? suggestion : suggestion.label)
              .toLocaleLowerCase()
              .includes(String(query).toLowerCase()),
          )
        : [],
    [suggestions, query, showSuggestions],
  );

  const inputClass = clsx(
    "px-3",
    sizeClasses.md,
    error ? "border-red-500" : "border-neutral",
    commonClass,
    commonInputClass,
    className,
  );

  const menuRef = useRef<MenuHandle>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFocusOut = (e: FocusEvent) => {
      if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent | React.KeyboardEvent<HTMLElement>,
    ) => {
      if (event.key === "Escape") {
        setShowSuggestions(false);
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

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && filteredSuggestions.length > 0) {
      e.preventDefault();
      menuRef.current?.focusIndex(0);
    }
  };

  const formedSuggestions = filteredSuggestions.map((suggestion) =>
    typeof suggestion === "string"
      ? { label: suggestion, value: suggestion }
      : suggestion,
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          className="text-sm font-medium text-on-surface"
          htmlFor={inputId}
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <span className="relative" ref={wrapperRef}>
        <input
          aria-required={required}
          autoComplete={onSelectSuggestion ? "off" : undefined}
          className={inputClass}
          data-testid={testId}
          disabled={disabled}
          id={inputId}
          name={name}
          onBlur={onBlur}
          onChange={(e) => {
            menuRef.current?.focusIndex(null);

            setQuery(e.target.value);
            setShowSuggestions(true);
            onChange?.(e);
          }}
          onFocus={() => {
            setShowSuggestions(true);
            onFocus?.();
          }}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          ref={ref}
          required={required}
          type={type}
          value={query}
        />
        {formedSuggestions.length > 0 && showSuggestions && (
          <Menu
            onSelect={(option) => {
              setQuery(
                formedSuggestions.find(({ value }) => value === option)
                  ?.label ?? option,
              );
              onSelectSuggestion?.(option);
              setShowSuggestions(false);
            }}
            options={formedSuggestions}
            ref={menuRef}
          />
        )}
      </span>
      {showErrorMessage && <FieldErrorMessage error={error} />}
    </div>
  );
}
