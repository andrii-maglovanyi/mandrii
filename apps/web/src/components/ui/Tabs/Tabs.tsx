"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";

import { TabPane, type TabPaneProps } from "./TabPane";
import { TabsBar } from "./TabsBar";

export interface TabsMethods {
  changeTab: (index: number) => void;
}

export interface TabsProps {
  children: React.ReactNode;
  defaultActiveKey?: string;
  defer?: boolean;
}

export const Tabs = ({ children, defaultActiveKey = "", defer = false }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (index: number) => {
    if (index !== activeTab) {
      setActiveTab(index);
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
    const activeKey = decodeURIComponent(window.location.hash?.replace("#", "") || defaultActiveKey);

    React.Children.map(tabsOnly, (child, index) => {
      if (
        React.isValidElement<TabPaneProps>(child) &&
        activeKey &&
        child?.props.tab === decodeURIComponent(activeKey)
      ) {
        setActiveTab(index);
      }
    });
  }, [tabsOnly, defaultActiveKey]);

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
                  className="text-on-surface my-4"
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
