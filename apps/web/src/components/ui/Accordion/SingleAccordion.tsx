import React from "react";

import { AccordionItemProps } from "./AccordionItem";
import { useAccordion } from "./hook";

interface SingleAccordionProps {
  children: React.ReactElement<AccordionItemProps>[];
}

export const SingleAccordion = ({ children }: SingleAccordionProps) => {
  const { openIndices, setOpenIndices } = useAccordion(children);

  const handleToggle = (index: number): void => {
    setOpenIndices((prev) => (prev.includes(index) ? [] : [index]));
  };

  return React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        isOpen: openIndices.includes(index),
        onToggle: () => handleToggle(index),
      } as Partial<AccordionItemProps>);
    }
    return child;
  });
};
