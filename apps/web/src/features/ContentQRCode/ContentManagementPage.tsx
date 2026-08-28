"use client";

import { TabPane, Tabs } from "~/components/ui";
import { VenueTelegramIntegrations } from "~/features/Messaging/components/VenueTelegramIntegrations";
import { useI18n } from "~/i18n/useI18n";
import { UUID } from "~/types/uuid";

import { ContentQrAnalytics } from "./ContentQrAnalytics";
import { ContentQRCode } from "./ContentQRCode";

export const ContentManagementPage = ({ targetId, targetType }: { targetId: UUID; targetType: "event" | "venue" }) => {
  const i18n = useI18n();

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Tabs defaultActiveKey={i18n("Settings")} defer mobileFullWidth>
        <TabPane tab={i18n("Settings")}>
          <div className="space-y-4">
            <ContentQRCode targetId={targetId} targetType={targetType} />
            <VenueTelegramIntegrations
              initialLinked={false}
              initialReviewNotificationsEnabled={false}
              targetId={targetId}
              targetType={targetType}
            />
          </div>
        </TabPane>
        <TabPane tab={i18n("Analytics")}>
          <ContentQrAnalytics targetId={targetId} targetType={targetType} />
        </TabPane>
      </Tabs>
    </div>
  );
};
