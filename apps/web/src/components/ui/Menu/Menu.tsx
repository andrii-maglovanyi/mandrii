import clsx from "clsx";
import { LoaderCircle, Search } from "lucide-react";
import { useId, useImperativeHandle, useRef } from "react";
import ReactDOM from "react-dom";

import { useKeyboardNavigation } from "~/hooks/useKeyboardNavigation";

export type MenuFloatingPosition = {
  bottom?: number;
  left: number;
  top?: number;
  width: number;
};

export interface MenuHandle {
  focusIndex: (index: null | number) => void;
  focusSearch: () => void;
}

export interface MenuOption<K, T> {
  label: K;
  meta?: React.ReactNode;
  value: T;
}

export type MenuOverlayLayout = {
  floatingPosition?: MenuFloatingPosition;
  maxHeight?: number;
  placement: "bottom" | "top";
  portalTarget: HTMLElement | null;
};

export const getMenuOverlayLayout = (anchor: HTMLElement | null, optionCount: number): MenuOverlayLayout => {
  const rect = anchor?.getBoundingClientRect();
  if (!rect) return { placement: "bottom", portalTarget: null };

  const estimatedMenuHeight = Math.min(320, optionCount * 48) + 6;
  const dialog = anchor?.closest("dialog");
  const dialogBounds = dialog?.getBoundingClientRect();
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  const placement = spaceBelow < estimatedMenuHeight && spaceAbove >= spaceBelow ? "top" : "bottom";

  return {
    floatingPosition:
      dialog && dialogBounds
        ? {
            ...(placement === "top"
              ? { bottom: dialogBounds.bottom - rect.top + 6 }
              : { top: rect.bottom - dialogBounds.top + 6 }),
            left: rect.left - dialogBounds.left,
            width: rect.width,
          }
        : undefined,
    maxHeight: Math.max(0, Math.min(320, (placement === "top" ? spaceAbove : spaceBelow) - 6)),
    placement,
    portalTarget: dialog ?? null,
  };
};

interface MenuProps<K, T> {
  floatingPosition?: MenuFloatingPosition;
  loading?: boolean;
  maxHeight?: number;
  onSelect: (value: T) => void;
  options: Array<MenuOption<K, T>>;
  ownerId?: string;
  placement?: "bottom" | "top";
  portalTarget?: HTMLElement | null;
  ref: React.Ref<MenuHandle>;
  search?: {
    emptyLabel: React.ReactNode;
    label: string;
    onChange: (value: string) => void;
    placeholder: string;
    value: string;
  };
  selectedValue?: T;
}

export function Menu<K extends React.ReactNode, T>({
  floatingPosition,
  loading = false,
  maxHeight,
  onSelect,
  options,
  ownerId,
  placement = "bottom",
  portalTarget,
  ref,
  search,
  selectedValue,
}: Readonly<MenuProps<K, T>>) {
  const { focusedIndex, focusItemAtIndex, handleKeyDown, menuRef } = useKeyboardNavigation();
  const menuId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusIndex: focusItemAtIndex,
    focusSearch: () => searchRef.current?.focus(),
  }));

  const menu = (
    <div
      className={clsx(
        `
          absolute z-50 flex h-max max-h-80 w-full max-w-[calc(100vw-2rem)]
          flex-col overflow-hidden rounded-lg bg-surface p-1 text-on-surface
          shadow-xl
        `,
        floatingPosition ? "" : placement === "top" ? "bottom-full mb-1.5" : `
          top-full mt-1.5
        `,
      )}
      data-menu-overlay
      data-menu-owner={ownerId}
      style={{ ...floatingPosition, ...(maxHeight === undefined ? {} : { maxHeight }) }}
    >
      {search && (
        <div className="sticky top-0 z-10 shrink-0 bg-surface p-2 pb-1">
          <label className="sr-only" htmlFor={`${ownerId}-search`}>
            {search.label}
          </label>
          <div className={`
            flex h-10 items-center rounded-md border border-neutral bg-surface
            px-3
            focus-within:ring-2 focus-within:ring-primary
            focus-within:ring-offset-1 focus-within:ring-offset-surface
          `}>
            <Search aria-hidden className="mr-2 shrink-0 text-neutral-500" size={17} />
            <input
              autoComplete="off"
              className={`
                min-w-0 flex-1 bg-transparent text-sm outline-none
                placeholder:text-neutral-500
              `}
              id={`${ownerId}-search`}
              onChange={(event) => search.onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && options.length > 0) {
                  event.preventDefault();
                  focusItemAtIndex(0);
                }
                if (event.key !== "Escape") event.stopPropagation();
              }}
              placeholder={search.placeholder}
              ref={searchRef}
              type="search"
              value={search.value}
            />
          </div>
        </div>
      )}
      <div
        aria-activedescendant={focusedIndex !== null ? `${menuId}-option-${focusedIndex}` : undefined}
        aria-labelledby={ownerId}
        className="min-h-0 overflow-y-auto"
        onKeyDown={(e) =>
          handleKeyDown(e, () => {
            if (focusedIndex === null) return;

            const selected = options[focusedIndex!];
            if (selected) onSelect(selected.value);
          })
        }
        ref={menuRef}
        role="listbox"
        tabIndex={0}
      >
        {loading && options.length === 0 ? (
          <div className={`
            flex items-center gap-2 px-3 py-3 text-sm text-neutral
          `} role="status">
            <LoaderCircle aria-hidden className="animate-spin" size={16} />
            <span>{search?.emptyLabel ?? "Loading options..."}</span>
          </div>
        ) : options.length ? (
          options.map((option, index) => (
            <div
              aria-selected={selectedValue === option.value}
              className={`
                flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm
                hover:bg-surface-tint
                focus:bg-surface-tint
                sm:px-4 sm:py-3 sm:text-base
              `}
              id={`${menuId}-option-${index}`}
              key={String(option.value)}
              onClick={() => onSelect(option.value)}
              role="option"
              tabIndex={-1}
              title={typeof option.label === "string" ? option.label : undefined}
            >
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.meta && <span className="ml-3 shrink-0">{option.meta}</span>}
            </div>
          ))
        ) : (
          <p className="px-3 py-3 text-sm text-neutral">{search?.emptyLabel}</p>
        )}
      </div>
    </div>
  );

  return portalTarget ? ReactDOM.createPortal(menu, portalTarget) : menu;
}
