import clsx from "clsx";
import { useImperativeHandle } from "react";
import ReactDOM from "react-dom";

import { useKeyboardNavigation } from "~/hooks/useKeyboardNavigation";

export interface MenuHandle {
  focusIndex: (index: null | number) => void;
}

export interface MenuOption<K, T> {
  label: K;
  meta?: React.ReactNode;
  value: T;
}

export type MenuFloatingPosition = {
  bottom?: number;
  left: number;
  top?: number;
  width: number;
};

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
  maxHeight?: number;
  onSelect: (value: T) => void;
  options: Array<MenuOption<K, T>>;
  ownerId?: string;
  placement?: "bottom" | "top";
  portalTarget?: HTMLElement | null;
  ref: React.Ref<MenuHandle>;
}

export function Menu<K extends React.ReactNode, T>({
  floatingPosition,
  maxHeight,
  onSelect,
  ownerId,
  options,
  placement = "bottom",
  portalTarget,
  ref,
}: Readonly<MenuProps<K, T>>) {
  const { focusedIndex, focusItemAtIndex, handleKeyDown, menuRef } = useKeyboardNavigation();

  useImperativeHandle(ref, () => ({
    focusIndex: focusItemAtIndex,
  }));

  const menu = (
    <div
      aria-activedescendant={focusedIndex !== null ? `option-${focusedIndex}` : undefined}
      className={clsx(
        "bg-surface text-on-surface absolute z-50 h-max max-h-80 w-full max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-xl",
        floatingPosition ? "" : placement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
      )}
      data-menu-overlay
      data-menu-owner={ownerId}
      onKeyDown={(e) =>
        handleKeyDown(e, () => {
          if (focusedIndex === null) return;

          const selected = options[focusedIndex!];
          if (selected) {
            onSelect(selected.value);
          }
        })
      }
      ref={menuRef}
      role="listbox"
      style={{ ...floatingPosition, ...(maxHeight === undefined ? {} : { maxHeight }) }}
      tabIndex={0}
    >
      {options.map((option, index) => (
        <div
          aria-selected={focusedIndex === index}
          className="hover:bg-surface-tint focus:bg-surface-tint flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base"
          id={`option-${index}`}
          key={String(option.value)}
          onClick={() => onSelect(option.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(option.value);
            }
          }}
          role="option"
          tabIndex={-1}
          title={typeof option.label === "string" ? option.label : undefined}
        >
          <span className="min-w-0 flex-1 truncate">{option.label}</span>
          {option.meta && <span className="ml-3 shrink-0">{option.meta}</span>}
        </div>
      ))}
    </div>
  );

  return portalTarget ? ReactDOM.createPortal(menu, portalTarget) : menu;
}
