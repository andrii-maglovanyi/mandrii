"use client";

import React, { useState } from "react";

import { AccordionItemProps } from "./AccordionItem";

interface AccordionProps {
  allowMultiple?: boolean;
  children: React.ReactElement<AccordionItemProps>[];
}

export const Accordion = ({ allowMultiple = false, children }: AccordionProps) => {
  const [openIndices, setOpenIndices] = useState<number[]>(
    React.Children.map(children, (child, index) => {
      if (child.props.isOpen) {
        return index;
      }
    }),
  );

  const handleToggle = (index: number): void => {
    if (allowMultiple) {
      setOpenIndices((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
    } else {
      setOpenIndices((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen: openIndices.includes(index),
            onToggle: () => handleToggle(index),
          } as Partial<AccordionItemProps>);
        }
        return child;
      })}
    </div>
  );
};
