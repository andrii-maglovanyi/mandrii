"use client";

import clsx from "clsx";
import { Phone, Search } from "lucide-react";
import { ReactNode, Ref, useEffect, useId, useMemo, useRef, useState } from "react";

import { getFlagComponent } from "~/lib/icons/flags";
import { processPhoneNumber } from "~/lib/utils/phone-number";

import { FieldErrorMessage } from "../FieldErrorMessage/FieldErrorMessage";
import { getMenuOverlayLayout, Menu, MenuHandle, MenuOption, MenuOverlayLayout } from "../Menu/Menu";
import { commonClass, commonInputClass, sizeClasses } from "../styles";

export type InputProps<K, T> = {
  "aria-label"?: string;
  className?: string;
  "data-testid"?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  label?: string;
  max?: number | string;
  min?: number | string;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onSelectSuggestion?: (value: string) => void;
  placeholder?: string;
  prefix?: ReactNode;
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
  "aria-label": ariaLabel,
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
  prefix,
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
  const isPhoneInput = type === "tel";
  const hasPrefix = prefix !== undefined;
  const newValue = value == null ? "" : String(value);
  const [previousValue, setPreviousValue] = useState({ type, value });
  const [query, setQuery] = useState(() => isPhoneInput ? processPhoneNumber(newValue).formatted : newValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [menuOverlay, setMenuOverlay] = useState<MenuOverlayLayout>({ placement: "bottom", portalTarget: null });

  if (!Object.is(previousValue.value, value) || previousValue.type !== type) {
    setPreviousValue({ type, value });
    setQuery(isPhoneInput ? processPhoneNumber(newValue).formatted : newValue);
  }
  const detectedCountry = isPhoneInput ? processPhoneNumber(query).detectedCountry : null;

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
    hasPrefix ? `
      min-w-0 flex-1 border-0 bg-transparent px-3
      focus:ring-0
    ` : `px-3`,
    sizeClasses.md,
    hasPrefix ? `
      text-on-surface
      placeholder:text-neutral-disabled
    ` : error ? `border-red-500` : `border-neutral`,
    hasPrefix ? "" : commonClass,
    hasPrefix ? "" : commonInputClass,
    !hasPrefix && (isPhoneInput || type === "search") ? "pl-12" : "",
    (type === "datetime-local" || type === "date" || type === "time") && `
      dark:[color-scheme:dark]
    `,
    className,
  );

  const menuRef = useRef<MenuHandle>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSuggestions) return;
    const dismissOutside = (event: Event) => {
      const target = event.target as Element | null;
      if (
        !wrapperRef.current?.contains(target) &&
        target?.closest?.("[data-menu-overlay]")?.getAttribute("data-menu-owner") !== inputId
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("pointerdown", dismissOutside);
    return () => {
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("pointerdown", dismissOutside);
    };
  }, [inputId, showSuggestions]);

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


      e.target.value = newValue;
    }

    setQuery(newValue);
    setShowSuggestions(true);
    onChange?.(e);
  };

  const formedSuggestions = filteredSuggestions.map((suggestion) =>
    typeof suggestion === "string" ? { label: suggestion, value: suggestion } : suggestion,
  );

  useEffect(() => {
    if (!showSuggestions || formedSuggestions.length === 0) return;
    setMenuOverlay(getMenuOverlayLayout(wrapperRef.current, formedSuggestions.length));
  }, [formedSuggestions.length, showSuggestions]);

  const iconWrapperClass = "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-2xl";

  const renderLeftIcon = () => {
    if (hasPrefix) return null;

    if (isPhoneInput) {
      const CountryFlag = getFlagComponent(detectedCountry?.country);
      return (
        <span className={iconWrapperClass}>
          {CountryFlag ? (
            <CountryFlag className="h-4 w-6 rounded-sm" />
          ) : (
            <Phone className="mx-1 text-neutral-disabled" size={20} />
          )}
        </span>
      );
    }

    if (type === "search") {
      return (
        <span className={iconWrapperClass}>
          <Search className="mx-1 text-neutral-disabled" size={20} />
        </span>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-on-surface" htmlFor={inputId}>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <span
        className="relative"
        onKeyDown={(event) => {
          if (event.key === "Escape" && showSuggestions) {
            event.preventDefault();
            event.stopPropagation();
            wrapperRef.current?.querySelector("input")?.focus();
            setShowSuggestions(false);
          }
        }}
        ref={wrapperRef}
      >
        {renderLeftIcon()}
        <span
          className={clsx(
            hasPrefix &&
              `
                flex h-10 w-full overflow-hidden rounded-md border
                border-neutral bg-surface transition
                focus-within:ring-2 focus-within:ring-primary
                focus-within:ring-offset-1 focus-within:ring-offset-surface
                has-[input:disabled]:cursor-not-allowed
                has-[input:disabled]:border-neutral-disabled
                has-[input:disabled]:bg-neutral-500/10
              `,
            hasPrefix && error && "border-red-500",
          )}
        >
          {hasPrefix && (
            <span aria-hidden="true" className={`
              flex shrink-0 items-center border-r border-inherit px-3
              text-neutral
            `}>
              {prefix}
            </span>
          )}
          <input
            aria-describedby={showErrorMessage && error ? `${inputId}-error` : undefined}
            aria-invalid={Boolean(error)}
            aria-label={ariaLabel}
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
        </span>
        {formedSuggestions.length > 0 && showSuggestions && (
          <Menu
            floatingPosition={menuOverlay.floatingPosition}
            maxHeight={menuOverlay.maxHeight}
            onSelect={(option) => {
              setQuery(formedSuggestions.find(({ value }) => value === option)?.label ?? option);
              onSelectSuggestion?.(option);
              wrapperRef.current?.querySelector("input")?.focus();
              setShowSuggestions(false);
            }}
            options={formedSuggestions}
            ownerId={inputId}
            placement={menuOverlay.placement}
            portalTarget={menuOverlay.portalTarget}
            ref={menuRef}
          />
        )}
      </span>

      {showErrorMessage && <FieldErrorMessage error={error} id={`${inputId}-error`} />}
    </div>
  );
}
