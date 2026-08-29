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
  isSavingQrNotifications: boolean;
  isSavingMessageNotifications: boolean;
  isUnlinking: boolean;
  onLink: () => void;
  onReviewNotificationsChange: (enabled: boolean) => void;
  onQrNotificationsChange: (enabled: boolean) => void;
  onMessageNotificationsChange: (enabled: boolean) => void;
  onRetryReviewNotification: () => void;
  onUnlink: () => void;
  reviewNotificationsEnabled: boolean;
  qrNotificationsEnabled: boolean;
  messageNotificationsEnabled: boolean;
  retryingReviewNotification: boolean;
  isVenue?: boolean;
}

export const TelegramLinkPanel = ({
  error,
  delivery,
  isAwaitingLink,
  isLinked,
  isSavingReviewNotifications,
  isSavingQrNotifications,
  isSavingMessageNotifications,
  isUnlinking,
  onLink,
  onReviewNotificationsChange,
  onQrNotificationsChange,
  onMessageNotificationsChange,
  onRetryReviewNotification,
  onUnlink,
  reviewNotificationsEnabled,
  qrNotificationsEnabled,
  messageNotificationsEnabled,
  retryingReviewNotification,
  isVenue,
}: TelegramLinkPanelProps) => {
  const i18n = useI18n();

  return (
    <SectionCard title={i18n("Integrations")}>
      <div className="mt-4 space-y-4">
        <div className="from-primary/10 flex items-center justify-between rounded-xl bg-linear-to-r to-transparent px-4 py-3">
          <div className="flex items-center space-x-2">
            <Image alt="Telegram" height={36} src={TELEGRAM_LOGO} style={{ height: 36, width: 36 }} width={36} />
            <div className="ml-2">
              <p className="font-medium">{i18n("Telegram")}</p>
              <p className="text-on-surface/70 text-sm">
                {isLinked
                  ? i18n("Linked - choose what Telegram receives")
                  : i18n("Link Telegram to choose messages and notifications")}
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
        <div className="my-4 ml-2 space-y-3">
          <Checkbox
            checked={reviewNotificationsEnabled}
            disabled={!isLinked || isSavingReviewNotifications}
            label={i18n("Notify me about new reviews")}
            onChange={(event) => onReviewNotificationsChange(event.target.checked)}
          />
          <p className="text-on-surface/70 -mt-2 ml-10 text-sm">
            {isLinked
              ? i18n("Receive a Telegram message when your {content} gets a new review.", {
                  content: isVenue ? i18n("venue") : i18n("event"),
                })
              : i18n("Link Telegram first ⤴")}
          </p>
        </div>
        {isVenue && (
          <div className="my-4 ml-2 space-y-3">
            <Checkbox
              checked={messageNotificationsEnabled}
              disabled={!isLinked || isSavingMessageNotifications}
              label={i18n("Forward new chat messages to Telegram")}
              onChange={(event) => onMessageNotificationsChange(event.target.checked)}
            />
            <p className="text-on-surface/70 -mt-2 ml-10 text-sm">
              {isLinked ? i18n("Receive new customer chat messages in Telegram.") : i18n("Link Telegram first ⤴")}
            </p>
          </div>
        )}
        <div className="mt-4 mb-8 ml-2 space-y-3">
          <Checkbox
            checked={qrNotificationsEnabled}
            disabled={!isLinked || isSavingQrNotifications}
            label={i18n("Notify me when QR code scanned")}
            onChange={(event) => onQrNotificationsChange(event.target.checked)}
          />
          <p className="text-on-surface/70 -mt-2 ml-10 text-sm">
            {isLinked
              ? i18n("Receive a Telegram message whenever this QR code is scanned.")
              : i18n("Link Telegram first ⤴")}
          </p>
        </div>
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
              <p className="text-neutral mt-1 wrap-break-word">{delivery.last_error}</p>
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
