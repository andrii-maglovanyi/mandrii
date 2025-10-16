"use client";

import React, { useState } from "react";

import { AccordionItemProps } from "./AccordionItem";

export const useAccordion = (children: React.ReactElement<AccordionItemProps>[]) => {
  const [openIndices, setOpenIndices] = useState<number[]>(
    React.Children.map(children, (child, index) => {
      if (child.props.isOpen) {
        return index;
      }
    }).filter((index): index is number => index !== undefined),
  );

  return { openIndices, setOpenIndices };
};
