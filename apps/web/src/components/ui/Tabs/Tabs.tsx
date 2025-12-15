"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";

import { TabPane, type TabPaneProps } from "./TabPane";
import { TabsBar } from "./TabsBar";

export interface TabsMethods {
  changeTab: (index: number) => void;
}

export interface TabsProps {
  activeKey?: string;
  children: React.ReactNode;
  defaultActiveKey?: string;
  defer?: boolean;
  onChange?: (tab: string) => void;
}

export const Tabs = ({ activeKey, children, defaultActiveKey = "", defer = false, onChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const isControlled = activeKey !== undefined;

  const handleTabChange = (index: number) => {
    if (index !== activeTab) {
      if (!isControlled) {
        setActiveTab(index);
      }

      const activeChild = tabsOnly[index];
      if (React.isValidElement<TabPaneProps>(activeChild)) {
        onChange?.(activeChild.props.tab);
      }
    }
  };

  const tabsOnly = useMemo(
    () =>
      React.Children.toArray(children).filter((child) => {
        return React.isValidElement(child) && child.type === TabPane;
      }),
    [children],
  );

  useEffect(() => {
    if (activeTab >= tabsOnly.length) {
      setActiveTab(0);
    }

    if (!isControlled) return;

    const targetIndex = tabsOnly.findIndex(
      (child) => React.isValidElement<TabPaneProps>(child) && child.props.tab === activeKey,
    );

    if (targetIndex >= 0 && targetIndex !== activeTab) {
      setActiveTab(targetIndex);
    }
  }, [activeKey, activeTab, isControlled, tabsOnly]);

  useEffect(() => {
    if (isControlled) return;

    const updateActiveTab = () => {
      const activeHashKey = decodeURIComponent(window.location.hash?.replace("#", "") || defaultActiveKey);

      React.Children.map(tabsOnly, (child, index) => {
        if (
          React.isValidElement<TabPaneProps>(child) &&
          activeHashKey &&
          child?.props.tab === decodeURIComponent(activeHashKey)
        ) {
          setActiveTab(index);
        }
      });
    };

    updateActiveTab();
    window.addEventListener("hashchange", updateActiveTab);

    return () => {
      window.removeEventListener("hashchange", updateActiveTab);
    };
  }, [tabsOnly, defaultActiveKey, isControlled]);

  return (
    <div className="flex w-full">
      <div className="grow">
        <TabsBar activeIndex={activeTab} onTabChange={handleTabChange}>
          {tabsOnly}
        </TabsBar>

        {defer
          ? React.Children.map(tabsOnly, (child, index) =>
              React.isValidElement<TabPaneProps>(child) && index === activeTab ? (
                <div className="my-4">
                  <Suspense fallback="Loading">{child.props.children}</Suspense>
                </div>
              ) : null,
            )
          : React.Children.map(tabsOnly, (child, index) =>
              React.isValidElement<TabPaneProps>(child) ? (
                <div
                  className="my-4 text-on-surface"
                  style={{
                    display: `${index === activeTab ? "block" : "none"}`,
                  }}
                >
                  {child.props.children}
                </div>
              ) : null,
            )}
      </div>
    </div>
  );
};
