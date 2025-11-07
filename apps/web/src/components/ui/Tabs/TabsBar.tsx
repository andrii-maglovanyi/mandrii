"use client";

import React, { type ReactNode, useEffect, useRef } from "react";

import { Button } from "../Button/Button";

interface TabsBarProps {
  activeIndex: number;
  children: ReactNode;
  onTabChange: (index: number) => void;
}

export const TabsBar = ({ activeIndex = 0, children, onTabChange }: TabsBarProps) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const activeTab = tabRefs.current[activeIndex];

    const setIndicator = () => {
      if (indicatorRef.current && tabRefs.current[activeIndex]) {
        if (activeTab) {
          indicatorRef.current.style.width = `${activeTab.offsetWidth}px`;
          indicatorRef.current.style.transform = `translateX(${activeTab.offsetLeft}px)`;
        }
      }
    };

    setIndicator();

    const resizeObserver = new ResizeObserver(setIndicator);
    if (activeTab) {
      resizeObserver.observe(activeTab);
    }

    return () => {
      if (activeTab) {
        resizeObserver.unobserve(activeTab);
      }
    };
  }, [activeIndex, children]);

  return (
    <div className="border-neutral-disabled relative border-b pt-2">
      <div className="flex overflow-y-hidden px-1 pt-2">
        {React.Children.map(children, (child, index) => {
          if (
            React.isValidElement<{
              icon?: React.ReactNode;
              tab: string;
            }>(child)
          ) {
            return (
              <span aria-selected={activeIndex === index}>
                <Button
                  className="translate-y-0.5"
                  onClick={() => {
                    history.pushState({ some: "state" }, "", `#${child.props.tab}`);
                    onTabChange(index);
                  }}
                  ref={(el: HTMLButtonElement) => {
                    tabRefs.current[index] = el;
                  }}
                  variant="ghost"
                >
                  {child.props.icon} {child.props.tab}
                </Button>
              </span>
            );
          }
          return null;
        })}
      </div>
      <div
        aria-selected
        className={`bg-primary absolute bottom-0 h-1 translate-y-0.5 rounded-full transition-transform duration-200`}
        ref={indicatorRef}
        style={{ width: 0 }}
      />
    </div>
  );
};
