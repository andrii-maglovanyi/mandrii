"use client";

import dynamic from "next/dynamic";

import { TabPane, Tabs } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

export const UserDirectory = () => {
  const i18n = useI18n();

  const tabs = [
    {
      Component: dynamic(() => import("./Venues/Venues"), {
        ssr: false,
      }),
      name: i18n("Venues"),
    },
    {
      Component: dynamic(() => import("./Events/Events"), {
        ssr: false,
      }),
      name: i18n("Events"),
    },
  ];

  return (
    <Tabs defer>
      {tabs.map(({ Component, name }) => (
        <TabPane key={name} tab={name}>
          <Component />
        </TabPane>
      ))}
    </Tabs>
  );
};
