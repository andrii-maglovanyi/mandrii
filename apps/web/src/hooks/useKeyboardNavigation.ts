import { useRef, useState } from "react";

export const useKeyboardNavigation = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<null | number>(null);

  const focusItemAtIndex = (index: null | number) => {
    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
    const item = index === null ? undefined : items?.[index];
    item?.focus();
    setFocusedIndex(item ? index : null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>, handler: () => void) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    const index = items.findIndex((item) => item === document.activeElement);
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
      setFocusedIndex(null);
    } else if (items.length && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      focusItemAtIndex(
        event.key === "ArrowDown" ? (index + 1) % items.length : index <= 0 ? items.length - 1 : index - 1,
      );
    }
  };

  return { focusedIndex, focusItemAtIndex, handleKeyDown, menuRef };
};
