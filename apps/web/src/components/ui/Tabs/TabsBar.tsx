"use client";

import React, { type ReactNode, useEffect, useRef } from "react";

import { Button } from "../Button/Button";
import { getTabId, getTabPanelId } from "./TabPane";

interface TabsBarProps {
  activeIndex: number;
  children: ReactNode;
  onTabChange: (index: number) => void;
}

export const TabsBar = ({ activeIndex = 0, children, onTabChange }: TabsBarProps) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  const selectTab = (index: number) => {
    const child = React.Children.toArray(children)[index];
    if (!React.isValidElement<{ tab: string }>(child)) return;

    history.pushState({ some: "state" }, "", `#${child.props.tab}`);
    onTabChange(index);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = React.Children.count(children);
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % count;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + count) % count;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = count - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    selectTab(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

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
      <div
        aria-label="Content sections"
        className="flex gap-1 overflow-x-auto overflow-y-hidden px-1 pt-2"
        role="tablist"
      >
        {React.Children.map(children, (child, index) => {
          if (
            React.isValidElement<{
              icon?: React.ReactNode;
              label?: React.ReactNode;
              tab: string;
            }>(child)
          ) {
            const tabLabel = child.props.label ?? child.props.tab;
            return (
              <Button
                aria-controls={getTabPanelId(child.props.tab)}
                aria-selected={activeIndex === index}
                className="relative translate-y-0.5"
                id={getTabId(child.props.tab)}
                key={child.props.tab}
                onClick={() => selectTab(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(el: HTMLButtonElement) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                tabIndex={activeIndex === index ? 0 : -1}
                variant="ghost"
              >
                {child.props.icon} {tabLabel}
              </Button>
            );
          }
          return null;
        })}
      </div>
      <div
        aria-hidden
        className={`bg-primary absolute bottom-0 h-1 translate-y-0.5 rounded-full transition-transform duration-200`}
        ref={indicatorRef}
        style={{ width: 0 }}
      />
    </div>
  );
};
