"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type Position = "bottom-end" | "bottom-start" | "bottom" | "left" | "right" | "top-end" | "top-start" | "top";

type TooltipProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  label: string;
  position?: Position;
};

const POSITION_CONFIGS = {
  bottom: {
    arrow: { bottom: "-6px", left: "50%", transform: "translateX(-50%)" },
    getCoords: (rect: DOMRect, scroll: { x: number; y: number }) => ({
      left: rect.left + scroll.x + rect.width / 2,
      top: rect.bottom + scroll.y + 8,
    }),
    transform: "translateX(-50%)",
  },
  "bottom-end": {
    arrow: { right: "16px", top: "-3px" },
    getCoords: (rect: DOMRect, scroll: { x: number; y: number }) => ({
      left: rect.right + scroll.x,
      top: rect.bottom + scroll.y + 8,
    }),
    transform: "translateX(-100%)",
  },
  "bottom-start": {
    arrow: { left: "16px", top: "-3px" },
    getCoords: (rect: DOMRect, scroll: { x: number; y: number }) => ({
      left: rect.left + scroll.x,
      top: rect.bottom + scroll.y + 8,
    }),
    transform: undefined,
  },
  left: {
    arrow: { right: "-1px", top: "50%", transform: "translateY(-50%)" },
    getCoords: (rect: DOMRect, scroll: { x: number; y: number }) => ({
      left: rect.left + scroll.x - 8,
      top: rect.top + scroll.y + rect.height / 2,
    }),
    transform: "translate(-100%, -50%)",
  },
  right: {
    arrow: { left: "-6px", top: "50%", transform: "translateY(-50%)" },
    getCoords: (rect: DOMRect, scroll: { x: number; y: number }) => ({
      left: rect.right + scroll.x + 8,
      top: rect.top + scroll.y + rect.height / 2,
    }),
    transform: "translateY(-50%)",
  },
  top: {
    arrow: { bottom: "-6px", left: "50%", transform: "translateX(-50%)" },
    getCoords: (rect: DOMRect, scroll: { x: number; y: number }) => ({
      left: rect.left + scroll.x + rect.width / 2,
      top: rect.top + scroll.y - 32,
    }),
    transform: "translateX(-50%)",
  },
  "top-end": {
    arrow: { bottom: "-3px", right: "16px" },
    getCoords: (rect: DOMRect, scroll: { x: number; y: number }) => ({
      left: rect.right + scroll.x,
      top: rect.top + scroll.y - 32,
    }),
    transform: "translateX(-100%)",
  },
  "top-start": {
    arrow: { bottom: "-3px", left: "16px" },
    getCoords: (rect: DOMRect, scroll: { x: number; y: number }) => ({
      left: rect.left + scroll.x,
      top: rect.top + scroll.y - 32,
    }),
    transform: undefined,
  },
} as const;

export const Tooltip = ({ children, className = "", delay = 0, label, position = "top" }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const isMountedRef = useRef(true);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scroll = {
      x: window.scrollX,
      y: window.scrollY,
    };

    const config = POSITION_CONFIGS[position];
    const coords = config.getCoords(rect, scroll);

    if (isMountedRef.current) {
      setTooltipPosition(coords);
    }
  }, [position]);

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          updatePosition();
          setIsVisible(true);
        }
      }, delay);
    } else {
      updatePosition();
      setIsVisible(true);
    }
  }, [delay, updatePosition]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  const toggleTooltip = useCallback(() => {
    setIsVisible((prev) => {
      if (!prev) {
        updatePosition();
      }
      return !prev;
    });
  }, [updatePosition]);

  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => {
      hideTooltip();
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isVisible, hideTooltip]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const config = POSITION_CONFIGS[position];

  const tooltipContent = isVisible
    ? createPortal(
        <div
          className={`
            pointer-events-none fixed z-9999 rounded-md bg-neutral-hover px-2
            py-1 text-xs whitespace-nowrap text-surface opacity-100 shadow
            transition-opacity duration-200
          `}
          role="tooltip"
          style={{
            left: `${tooltipPosition.left}px`,
            top: `${tooltipPosition.top}px`,
            transform: config.transform,
          }}
        >
          {label}
          <div className="absolute h-2 w-2 rotate-45 bg-neutral-hover" style={config.arrow} />
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div
        className={`
          group/tooltip pointer-events-auto relative inline-block w-fit
          ${className}
        `}
        onClick={toggleTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        ref={triggerRef}
      >
        {children}
      </div>
      {tooltipContent}
    </>
  );
};
