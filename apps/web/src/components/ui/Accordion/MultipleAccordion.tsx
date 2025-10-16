import React from "react";

import { AccordionItemProps } from "./AccordionItem";
import { useAccordion } from "./hook";

interface MultipleAccordionProps {
  children: React.ReactElement<AccordionItemProps>[];
}

export const MultipleAccordion = ({ children }: MultipleAccordionProps) => {
  const { openIndices, setOpenIndices } = useAccordion(children);

  const handleToggle = (index: number): void => {
    setOpenIndices((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
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
