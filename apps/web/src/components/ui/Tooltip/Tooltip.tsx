"use client";

import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type Position = "bottom-end" | "bottom-start" | "bottom" | "left" | "right" | "top-end" | "top-start" | "top";

type TooltipProps = {
  children: ReactNode;
  className?: string;
  label: string;
  position?: Position;
};

export const Tooltip = ({ children, className = "", label, position = "top" }: TooltipProps) => {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleInteraction = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;

      // Calculate position based on tooltip position prop
      let top = 0;
      let left = 0;

      switch (position) {
        case "bottom":
          top = rect.bottom + scrollY + 8;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case "bottom-end":
          top = rect.bottom + scrollY + 8;
          left = rect.right + scrollX;
          break;
        case "bottom-start":
          top = rect.bottom + scrollY + 8;
          left = rect.left + scrollX;
          break;
        case "left":
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 8;
          break;
        case "right":
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + 8;
          break;
        case "top":
          top = rect.top + scrollY - 32; // tooltip height + gap
          left = rect.left + scrollX + rect.width / 2;
          break;
        case "top-end":
          top = rect.top + scrollY - 32;
          left = rect.right + scrollX;
          break;
        case "top-start":
          top = rect.top + scrollY - 32;
          left = rect.left + scrollX;
          break;
      }

      setTooltipPosition({ left, top });
    }
    setIsVisible(true);
  };

  const handleLeave = () => {
    setIsVisible(false);
  };

  const handleClick = () => {
    // Toggle for touch devices
    setIsVisible((prev) => !prev);
  };

  // Hide tooltip on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      window.addEventListener("scroll", handleScroll, true); // Use capture phase to catch all scrolls
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isVisible]);

  const tooltipContent = isVisible
    ? createPortal(
        <div
          className={`
            pointer-events-none fixed z-9999 rounded-md bg-neutral-hover px-2
            py-1 text-xs whitespace-nowrap text-surface shadow
            transition-opacity duration-200
            ${
            isVisible ? "opacity-100" : "opacity-0"
          }
          `}
          id={id}
          role="tooltip"
          style={{
            left: `${tooltipPosition.left}px`,
            top: `${tooltipPosition.top}px`,
            transform:
              position === "top" || position === "bottom"
                ? "translateX(-50%)"
                : position === "top-end" || position === "bottom-end"
                  ? "translateX(-100%)"
                  : position === "left"
                    ? "translate(-100%, -50%)"
                    : position === "right"
                      ? "translateY(-50%)"
                      : undefined,
          }}
        >
          {label}
          <div
            className="absolute h-2 w-2 rotate-45 bg-neutral-hover"
            style={{
              ...(position === "top" && {
                bottom: "-6px",
                left: "50%",
                transform: "translateX(-50%)",
              }),
              ...(position === "top-start" && {
                bottom: "-3px",
                left: "16px",
              }),
              ...(position === "top-end" && {
                bottom: "-3px",
                right: "16px",
              }),
              ...(position === "bottom" && {
                left: "50%",
                top: "-1px",
                transform: "translateX(-50%)",
              }),
              ...(position === "bottom-start" && {
                left: "16px",
                top: "-3px",
              }),
              ...(position === "bottom-end" && {
                right: "16px",
                top: "-3px",
              }),
              ...(position === "left" && {
                right: "-1px",
                top: "50%",
                transform: "translateY(-50%)",
              }),
              ...(position === "right" && {
                left: "-6px",
                top: "50%",
                transform: "translateY(-50%)",
              }),
            }}
          />
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div
        className={`
          group/tooltip relative inline-block w-fit
          ${className}
        `}
        onClick={handleClick}
        onMouseEnter={handleInteraction}
        onMouseLeave={handleLeave}
        ref={triggerRef}
      >
        <span aria-describedby={id} className="pointer-events-auto" data-testid={`target-${id}`}>
          {children}
        </span>
      </div>
      {tooltipContent}
    </>
  );
};
