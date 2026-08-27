import Image from "next/image";

import { Button, Checkbox, SectionCard } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

const TELEGRAM_LOGO = "/static/telegram.svg";

interface TelegramLinkPanelProps {
  delivery: null | {
    attempts: number;
    delivered_at: null | string;
    last_error: null | string;
    next_attempt_at: string;
    status: "DELIVERED" | "FAILED" | "PENDING" | "PROCESSING";
  };
  error: string;
  isAwaitingLink: boolean;
  isLinked: boolean;
  isSavingReviewNotifications: boolean;
  isUnlinking: boolean;
  onLink: () => void;
  onReviewNotificationsChange: (enabled: boolean) => void;
  onRetryReviewNotification: () => void;
  onUnlink: () => void;
  reviewNotificationsEnabled: boolean;
  retryingReviewNotification: boolean;
  supportsCustomerMessages?: boolean;
}

export const TelegramLinkPanel = ({
  error,
  delivery,
  isAwaitingLink,
  isLinked,
  isSavingReviewNotifications,
  isUnlinking,
  onLink,
  onReviewNotificationsChange,
  onRetryReviewNotification,
  onUnlink,
  reviewNotificationsEnabled,
  retryingReviewNotification,
  supportsCustomerMessages = true,
}: TelegramLinkPanelProps) => {
  const i18n = useI18n();

  return (
    <SectionCard title={i18n("Integrations")}>
      <div className="space-y-4">
        <div className="bg-primary/10 flex items-center justify-between rounded-xl px-4 py-3">
          <div className="flex space-x-2">
            <Image alt="Telegram" width={22} height={22} src={TELEGRAM_LOGO} />
            <div>
              <p className="font-medium">{i18n("Telegram")}</p>
              <p className="text-on-surface/70 text-sm">
                {isLinked
                  ? supportsCustomerMessages
                    ? i18n("Linked — customer messages are forwarded to Telegram")
                    : i18n("Linked — review notifications can be sent to Telegram")
                  : supportsCustomerMessages
                    ? i18n("Link Telegram to forward customer messages")
                    : i18n("Link Telegram to receive review notifications")}
              </p>
            </div>
          </div>
          {isLinked ? (
            <Button busy={isUnlinking} color="danger" onClick={onUnlink} size="sm" variant="outlined">
              {i18n("Unlink")}
            </Button>
          ) : (
            <Button color="primary" onClick={onLink} size="sm">
              {i18n("Link")}
            </Button>
          )}
        </div>
        {isAwaitingLink && !isLinked && (
          <p className="text-neutral -mt-1 text-sm">{i18n("Waiting for Telegram confirmation…")}</p>
        )}
        <Checkbox
          checked={reviewNotificationsEnabled}
          disabled={!isLinked || isSavingReviewNotifications}
          label={i18n("Notify me about new written reviews")}
          onChange={(event) => onReviewNotificationsChange(event.target.checked)}
        />
        <p className="text-on-surface/70 -mt-2 text-sm">
          {isLinked
            ? i18n("Receive a Telegram message when your {content} gets a new written review.", {
                content: supportsCustomerMessages ? i18n("venue") : i18n("event"),
              })
            : i18n("Link Telegram before enabling review notifications.")}
        </p>
        {isLinked && reviewNotificationsEnabled && delivery && (
          <div className="border-on-surface/10 rounded-lg border px-3 py-2 text-sm">
            <p className="font-medium">
              {delivery.status === "DELIVERED"
                ? i18n("Last review notification delivered")
                : delivery.status === "FAILED"
                  ? i18n("Last review notification failed")
                  : i18n("Review notification is waiting to be delivered")}
            </p>
            {delivery.status === "FAILED" && delivery.last_error && (
              <p className="text-neutral mt-1 break-words">{delivery.last_error}</p>
            )}
            {delivery.status !== "DELIVERED" && (
              <p className="text-neutral mt-1">
                {i18n("Attempt {count}; next retry {time}", {
                  count: delivery.attempts,
                  time: new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
                    new Date(delivery.next_attempt_at),
                  ),
                })}
              </p>
            )}
            {delivery.status === "FAILED" && (
              <Button
                busy={retryingReviewNotification}
                className="mt-2"
                onClick={onRetryReviewNotification}
                size="sm"
                variant="outlined"
              >
                {i18n("Retry notification")}
              </Button>
            )}
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </SectionCard>
  );
};
