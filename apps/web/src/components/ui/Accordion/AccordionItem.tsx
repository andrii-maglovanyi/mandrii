import { ChevronDown } from "lucide-react";
import React from "react";

export interface AccordionItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  title: string;
}

export const AccordionItem = ({ children, icon, isOpen = false, onToggle, title }: AccordionItemProps) => {
  return (
    <div className="mb-2 overflow-hidden">
      <button
        className={`hover:bg-neutral/5 flex w-full cursor-pointer items-center justify-between px-6 py-4 transition-colors duration-200`}
        onClick={onToggle}
        type="button"
      >
        <span className={`flex items-center gap-3 text-left text-lg font-semibold`}>
          {icon} {title}
        </span>
        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? `rotate-180 transform` : ""} `} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-150 ease-in-out ${isOpen ? `max-h-[9999px]` : `max-h-0`} `}
      >
        <div className="border-neutral-disabled border-t px-6 py-4">{children}</div>
      </div>
    </div>
  );
};
