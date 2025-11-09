"use client";
import { useEffect, useImperativeHandle, useState } from "react";
import { createPortal } from "react-dom";

import { useKeyboardNavigation } from "~/hooks/useKeyboardNavigation";

export interface MenuHandle {
  focusIndex: (index: null | number) => void;
}

export interface MenuOption<K, T> {
  label: K;
  value: T;
}

interface MenuProps<K, T> {
  onSelect: (value: T) => void;
  options: Array<MenuOption<K, T>>;
  ref: React.Ref<MenuHandle>;
  triggerRef?: React.RefObject<HTMLButtonElement | HTMLInputElement | null>;
}

export function Menu<K extends React.ReactNode, T>({ onSelect, options, ref, triggerRef }: Readonly<MenuProps<K, T>>) {
  const { focusedIndex, focusItemAtIndex, handleKeyDown, menuRef } = useKeyboardNavigation();
  const [position, setPosition] = useState<{ left: number; top: number; width: number } | null>(null);

  useImperativeHandle(ref, () => ({
    focusIndex: focusItemAtIndex,
  }));

  useEffect(() => {
    if (triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY + 6, // 6px gap (mt-1.5)
        width: rect.width,
      });
    }
  }, [triggerRef]);

  if (!position) {
    return null;
  }

  const menuContent = (
    <div
      aria-activedescendant={focusedIndex !== null ? `option-${focusedIndex}` : undefined}
      className={`
        fixed z-50 h-max max-h-80 w-max overflow-y-scroll rounded-lg bg-surface
        p-1 text-on-surface shadow-xl
      `}
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
      style={{
        left: `${position.left}px`,
        minWidth: `${position.width}px`,
        top: `${position.top}px`,
      }}
      tabIndex={0}
    >
      {options.map((option, index) => (
        <div
          aria-selected={focusedIndex === index}
          className={`
            cursor-pointer rounded-lg px-4 py-3 whitespace-nowrap
            hover:bg-surface-tint
            focus:bg-surface-tint
          `}
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
        >
          {option.label}
        </div>
      ))}
    </div>
  );

  return createPortal(menuContent, document.body);
}
