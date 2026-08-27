import React from "react";

export interface TabPaneProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  tab: string;
}

export const getTabId = (tab: string) => `tab-${encodeURIComponent(tab)}`;
export const getTabPanelId = (tab: string) => `tabpanel-${encodeURIComponent(tab)}`;

export const TabPane = React.memo<TabPaneProps>(({ children, icon, label, tab }) => {
  return (
    <div
      aria-labelledby={getTabId(tab)}
      className="py-4"
      data-icon={!!icon}
      data-label={label}
      id={getTabPanelId(tab)}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
});

TabPane.displayName = "TabPane";
