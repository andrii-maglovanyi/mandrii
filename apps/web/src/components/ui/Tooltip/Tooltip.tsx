import { ReactNode, useId } from "react";

export type Position = "bottom-end" | "bottom-start" | "bottom" | "left" | "right" | "top-end" | "top-start" | "top";

type TooltipProps = {
  children: ReactNode;
  className?: string;
  label: string;
  position?: Position;
};

const POSITION_CLASSES: Record<Position, { arrow: string; tooltip: string }> = {
  bottom: {
    arrow: "bottom-full translate-y-1/2 left-1/2 -translate-x-1/2",
    tooltip: "top-full mt-2 left-1/2 -translate-x-1/2",
  },
  "bottom-end": {
    arrow: "bottom-full translate-y-1/2 right-4",
    tooltip: "top-full mt-2 right-0",
  },
  "bottom-start": {
    arrow: "bottom-full translate-y-1/2 left-4",
    tooltip: "top-full mt-2 left-0",
  },
  left: {
    arrow: "left-full -translate-x-1/2 top-1/2 -translate-y-1/2",
    tooltip: "right-full mr-2 top-1/2 -translate-y-1/2",
  },
  right: {
    arrow: "right-full translate-x-1/2 top-1/2 -translate-y-1/2",
    tooltip: "left-full ml-2 top-1/2 -translate-y-1/2",
  },
  top: {
    arrow: "top-full -translate-y-1/2 left-1/2 -translate-x-1/2",
    tooltip: "bottom-full mb-2 left-1/2 -translate-x-1/2",
  },
  "top-end": {
    arrow: "top-full -translate-y-1/2 right-4",
    tooltip: "bottom-full mb-2 right-0",
  },
  "top-start": {
    arrow: "top-full -translate-y-1/2 left-4",
    tooltip: "bottom-full mb-2 left-0",
  },
};

export const Tooltip = ({ children, className = "", label, position = "top" }: TooltipProps) => {
  const id = useId();
  const classes = POSITION_CLASSES[position];

  return (
    <div className={`
      group relative inline-block w-fit
      ${className}
    `}>
      <span aria-describedby={id} data-testid={`target-${id}`}>
        {children}
      </span>

      <div
        className={`
          pointer-events-none absolute z-50 rounded-md bg-surface-tint px-2 py-1
          text-xs whitespace-nowrap text-on-surface opacity-0 shadow
          transition-opacity duration-200
          group-hover:opacity-100
          group-focus:opacity-100
          ${classes.tooltip}
        `}
        id={id}
        role="tooltip"
      >
        {label}
        <div className={`
          absolute h-2 w-2 rotate-45 bg-surface-tint
          ${classes.arrow}
        `} />
      </div>
    </div>
  );
};
