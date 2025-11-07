"use client";

import clsx from "clsx";
import { Phone, Search } from "lucide-react";
import { Ref, useEffect, useId, useMemo, useRef, useState } from "react";

import { getFlagComponent } from "~/lib/icons/flags";
import { CountryPhoneConfig, processPhoneNumber } from "~/lib/utils/phone-number";

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
  max?: number;
  min?: number;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onSelectSuggestion?: (value: string) => void;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
  required?: boolean;
  showErrorMessage?: boolean;
  step?: number | string;
  suggestions?: Array<SuggestOption<K, T>>;
  type?: string;
  value?: null | number | string;
};

export type SuggestOption<K, T> = MenuOption<K, T> | string;

export function Input<K extends string, T extends string>({
  className = "",
  "data-testid": testId = "input",
  disabled = false,
  error,
  id,
  label,
  max,
  min,
  name,
  onBlur,
  onChange,
  onFocus,
  onSelectSuggestion,
  placeholder,
  ref,
  required = false,
  showErrorMessage = false,
  step,
  suggestions = [],
  type = "text",
  value,
}: Readonly<InputProps<K, T>>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [query, setQuery] = useState<string>(() => {
    if (value === null || value === undefined) return "";
    return String(value);
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<CountryPhoneConfig | null>(null);

  const isPhoneInput = type === "tel";

  useEffect(() => {
    const newValue = value === null || value === undefined ? "" : String(value);
    setQuery(newValue);

    if (isPhoneInput && newValue) {
      const result = processPhoneNumber(newValue);
      setDetectedCountry(result.detectedCountry);
      setQuery(result.formatted);
    }
  }, [value, isPhoneInput]);

  const filteredSuggestions = useMemo(
    () =>
      query && showSuggestions
        ? suggestions.filter((suggestion) =>
            (typeof suggestion === "string" ? suggestion : suggestion.label)
              .toLowerCase()
              .includes(query.toLowerCase()),
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
    isPhoneInput || type === "search" ? "pl-12" : "",
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    const node = wrapperRef.current;
    if (node) {
      node.addEventListener("focusout", handleFocusOut);
      node.addEventListener("keydown", handleKeyDown);

      return () => {
        node.removeEventListener("keydown", handleKeyDown);
        node.removeEventListener("focusout", handleFocusOut);
      };
    }
  }, []);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && filteredSuggestions.length > 0) {
      e.preventDefault();
      menuRef.current?.focusIndex(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    menuRef.current?.focusIndex(null);

    let newValue = e.target.value;

    if (isPhoneInput) {
      const result = processPhoneNumber(newValue);
      newValue = result.formatted;

      setDetectedCountry(result.detectedCountry);

      e.target.value = newValue;
    }

    setQuery(newValue);
    setShowSuggestions(true);
    onChange?.(e);
  };

  const formedSuggestions = filteredSuggestions.map((suggestion) =>
    typeof suggestion === "string" ? { label: suggestion, value: suggestion } : suggestion,
  );

  const iconWrapperClass = "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-2xl";

  const renderLeftIcon = () => {
    if (isPhoneInput) {
      const CountryFlag = getFlagComponent(detectedCountry?.country);
      return (
        <span className={iconWrapperClass}>
          {CountryFlag ? (
            <CountryFlag className="h-4 w-6 rounded-sm" />
          ) : (
            <Phone className="text-neutral-disabled mx-1" size={20} />
          )}
        </span>
      );
    }

    if (type === "search") {
      return (
        <span className={iconWrapperClass}>
          <Search className="text-neutral-disabled mx-1" size={20} />
        </span>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-on-surface text-sm font-medium" htmlFor={inputId}>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <span className="relative" ref={wrapperRef}>
        {renderLeftIcon()}
        <input
          aria-required={required}
          autoComplete={onSelectSuggestion ? "off" : undefined}
          className={inputClass}
          data-testid={testId}
          disabled={disabled}
          id={inputId}
          max={max}
          min={min}
          name={name}
          onBlur={onBlur}
          onChange={handleInputChange}
          onFocus={() => {
            setShowSuggestions(true);
            onFocus?.();
          }}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder || (isPhoneInput ? "+44 0123 456 789" : undefined)}
          ref={ref}
          required={required}
          step={step}
          type={isPhoneInput ? "tel" : type}
          value={query}
        />
        {formedSuggestions.length > 0 && showSuggestions && (
          <Menu
            onSelect={(option) => {
              setQuery(formedSuggestions.find(({ value }) => value === option)?.label ?? option);
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
