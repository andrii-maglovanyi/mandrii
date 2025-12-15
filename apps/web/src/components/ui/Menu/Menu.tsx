import { useImperativeHandle } from "react";

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
}

export function Menu<K extends React.ReactNode, T>({ onSelect, options, ref }: Readonly<MenuProps<K, T>>) {
  const { focusedIndex, focusItemAtIndex, handleKeyDown, menuRef } = useKeyboardNavigation();

  useImperativeHandle(ref, () => ({
    focusIndex: focusItemAtIndex,
  }));

  return (
    <div
      aria-activedescendant={focusedIndex !== null ? `option-${focusedIndex}` : undefined}
      className={`bg-surface text-on-surface absolute top-full z-50 mt-1.5 h-max max-h-80 w-max min-w-full overflow-y-scroll rounded-lg p-1 shadow-xl`}
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
          className={`hover:bg-surface-tint focus:bg-surface-tint cursor-pointer rounded-lg px-4 py-3 whitespace-nowrap`}
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
}
