"use client";

import { useI18n } from "~/i18n/useI18n";
import { UUID } from "~/types/uuid";

import { ContentQrAnalytics } from "./ContentQrAnalytics";

export const ContentAnalyticsPage = ({ targetId, targetType }: { targetId: UUID; targetType: "event" | "venue" }) => {
  const i18n = useI18n();
  const content = targetType === "venue" ? i18n("venue") : i18n("event");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-on-surface text-3xl font-extrabold md:text-5xl">{i18n("Analytics")}</h1>
        <p className="text-neutral mt-2">
          {i18n("Understand how people discover and engage with your {content}.", { content })}
        </p>
      </div>
      <ContentQrAnalytics targetId={targetId} targetType={targetType} />
    </div>
  );
};
