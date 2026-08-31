import { useImperativeHandle } from "react";

import { useKeyboardNavigation } from "~/hooks/useKeyboardNavigation";

export interface MenuHandle {
  focusIndex: (index: null | number) => void;
}

export interface MenuOption<K, T> {
  label: K;
  meta?: React.ReactNode;
  value: T;
}

interface MenuProps<K, T> {
  onSelect: (value: T) => void;
  options: Array<MenuOption<K, T>>;
  placement?: "bottom" | "top";
  ref: React.Ref<MenuHandle>;
}

export function Menu<K extends React.ReactNode, T>({
  onSelect,
  options,
  placement = "bottom",
  ref,
}: Readonly<MenuProps<K, T>>) {
  const { focusedIndex, focusItemAtIndex, handleKeyDown, menuRef } = useKeyboardNavigation();

  useImperativeHandle(ref, () => ({
    focusIndex: focusItemAtIndex,
  }));

  return (
    <div
      aria-activedescendant={focusedIndex !== null ? `option-${focusedIndex}` : undefined}
      className={`bg-surface text-on-surface absolute z-50 h-max max-h-80 w-full max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-xl ${
        placement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
      }`}
      data-menu-overlay
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
      tabIndex={0}
    >
      {options.map((option, index) => (
        <div
          aria-selected={focusedIndex === index}
          className={`hover:bg-surface-tint focus:bg-surface-tint flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base`}
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
}
