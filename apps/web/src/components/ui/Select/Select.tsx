"use client";

import clsx from "clsx";
import { ChevronDown, LoaderCircle } from "lucide-react";
import { ChangeEvent, Ref, useEffect, useId, useMemo, useRef, useState } from "react";

import { FieldErrorMessage } from "../FieldErrorMessage/FieldErrorMessage";
import { getMenuOverlayLayout, Menu, MenuHandle, MenuOption, MenuOverlayLayout } from "../Menu/Menu";
import { commonClass, commonInputClass, sizeClasses } from "../styles";

export type SelectProps<K, T> = {
  "aria-label"?: string;
  className?: string;
  "data-testid"?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  label?: string;
  loading?: boolean;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onChange?: (e: { target: { value: T } } & ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange?: (query: string) => void;
  options: Array<MenuOption<K, T>>;
  placeholder?: string;
  ref?: Ref<HTMLButtonElement>;
  required?: boolean;
  searchable?: boolean;
  searchEmptyLabel?: React.ReactNode;
  searchPlaceholder?: string;
  searchText?: (option: MenuOption<K, T>) => string;
  selectedLabel?: React.ReactNode;
  showErrorMessage?: boolean;
  value?: T;
};

export function Select<K extends React.ReactNode, T>({
  "aria-label": ariaLabel,
  className = "",
  "data-testid": testId = "select",
  disabled = false,
  error,
  id,
  label,
  loading = false,
  name,
  onBlur,
  onChange,
  onSearchChange,
  options = [],
  placeholder = "Select...",
  ref,
  required = false,
  searchable = false,
  searchEmptyLabel = "No matching options",
  searchPlaceholder = "Search options...",
  searchText,
  selectedLabel: selectedLabelOverride,
  showErrorMessage = false,
  value,
}: Readonly<SelectProps<K, T>>) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOverlay, setMenuOverlay] = useState<MenuOverlayLayout>({ placement: "bottom", portalTarget: null });

  const selectedLabel = selectedLabelOverride ?? options.find((opt) => opt.value === value)?.label ?? placeholder;
  const visibleOptions = useMemo(() => {
    if (onSearchChange || !searchable || !searchQuery.trim()) return options;

    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    return options.filter((option) =>
      (searchText?.(option) ?? String(option.label)).toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [onSearchChange, options, searchQuery, searchable, searchText]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<MenuHandle>(null);

  useEffect(() => {
    if (!focused) return;

    const dismissOutside = (event: Event) => {
      const target = event.target as Element | null;
      if (
        !wrapperRef.current?.contains(target) &&
        target?.closest?.("[data-menu-overlay]")?.getAttribute("data-menu-owner") !== selectId
      ) {
        setFocused(false);
      }
    };
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("pointerdown", dismissOutside);
    return () => {
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("pointerdown", dismissOutside);
    };
  }, [focused, selectId]);

  const openMenu = () => {
    setSearchQuery("");
    onSearchChange?.("");
    setMenuOverlay(getMenuOverlayLayout(wrapperRef.current, options.length + (searchable ? 2 : 0)));
    setFocused(true);
  };

  const onSelectKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!focused) openMenu();
      else menuRef.current?.focusIndex(e.key === "ArrowUp" ? visibleOptions.length - 1 : 0);
    }
  };

  const toggleMenu = () => {
    if (focused) setFocused(false);
    else openMenu();
  };

  useEffect(() => {
    if (!focused) return;
    if (searchable) menuRef.current?.focusSearch();
    else menuRef.current?.focusIndex(0);
  }, [focused, searchable]);

  const selectClass = clsx(
    "flex items-center px-3 text-left",
    sizeClasses.md,
    error ? "border-red-500" : "border-neutral",
    commonClass,
    commonInputClass,
    className,
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-on-surface text-sm font-medium" htmlFor={selectId}>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div
        className="relative"
        onKeyDown={(event) => {
          if (event.key === "Escape" && focused) {
            event.preventDefault();
            event.stopPropagation();
            setFocused(false);
            buttonRef.current?.focus();
          }
        }}
        ref={wrapperRef}
      >
        <button
          aria-describedby={showErrorMessage && error ? `${selectId}-error` : undefined}
          aria-expanded={focused}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          aria-label={ariaLabel}
          className={selectClass}
          data-testid={testId}
          disabled={disabled}
          id={selectId}
          name={name}
          onBlur={onBlur}
          onClick={toggleMenu}
          onKeyDown={onSelectKeyDown}
          ref={(node) => {
            buttonRef.current = node;
            if (typeof ref === "function") return ref(node);
            if (ref) ref.current = node;
          }}
          type="button"
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          {loading ? (
            <LoaderCircle aria-hidden className={`ml-2 shrink-0 animate-spin text-neutral-500`} size={18} />
          ) : (
            <ChevronDown
              aria-hidden
              className={clsx(`ml-2 shrink-0 text-neutral-500 transition-transform`, focused && `rotate-180`)}
              size={18}
            />
          )}
        </button>
        {focused && (options.length > 0 || searchable) && (
          <Menu
            floatingPosition={menuOverlay.floatingPosition}
            loading={loading}
            maxHeight={menuOverlay.maxHeight}
            onSelect={(value) => {
              const event = {
                target: {
                  name,
                  value,
                },
              } as { target: { value: T } } & ChangeEvent<HTMLSelectElement>;
              onChange?.(event);

              setFocused(false);
              buttonRef.current?.focus();
            }}
            options={visibleOptions}
            ownerId={selectId}
            placement={menuOverlay.placement}
            portalTarget={menuOverlay.portalTarget}
            ref={menuRef}
            search={
              searchable
                ? {
                    emptyLabel: searchEmptyLabel,
                    label: ariaLabel ?? label ?? placeholder,
                    onChange: (query) => {
                      setSearchQuery(query);
                      onSearchChange?.(query);
                    },
                    placeholder: searchPlaceholder,
                    value: searchQuery,
                  }
                : undefined
            }
            selectedValue={value}
          />
        )}
      </div>
      {showErrorMessage && <FieldErrorMessage error={error} id={`${selectId}-error`} />}
    </div>
  );
}
