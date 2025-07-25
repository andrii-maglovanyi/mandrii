import { useEffect, useRef, useState } from "react";

export const useKeyboardNavigation = () => {
  const menuRef = useRef<HTMLDivElement>(null);

  const [itemsLength, setItemsLength] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<null | number>(null);

  useEffect(() => {
    const items = menuRef.current?.querySelectorAll("li") ?? [];

    setItemsLength(items.length);
    focusItemAtIndex(focusedIndex);
  }, [focusedIndex]);

  const focusItemAtIndex = (index: null | number) => {
    const items = menuRef.current?.querySelectorAll<HTMLLIElement>("li");
    if (index !== null && items?.[index]) {
      items[index].focus();
    }
    setFocusedIndex(index);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    handler: () => void,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setFocusedIndex(null);
      handler();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((prevIndex) =>
        prevIndex === null || prevIndex === itemsLength - 1 ? 0 : prevIndex + 1,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prevIndex) =>
        prevIndex === null || prevIndex === 0 ? itemsLength - 1 : prevIndex - 1,
      );
    }
  };

  return { focusedIndex, focusItemAtIndex, handleKeyDown, menuRef };
};
