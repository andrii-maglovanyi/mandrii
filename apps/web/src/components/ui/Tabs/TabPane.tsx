import React from "react";

export interface TabPaneProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  label?: string;
  tab: string;
}

export const TabPane = React.memo<TabPaneProps>(({ children, icon, label, tab }) => {
  return (
    <div
      aria-labelledby={`tab-${tab}`}
      className="py-4"
      data-icon={!!icon}
      data-label={label}
      id={`tabpanel-${tab}`}
      role="tabpanel"
    >
      {children}
    </div>
  );
});

TabPane.displayName = "TabPane";
