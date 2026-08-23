import Image from "next/image";

import { Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

const TELEGRAM_LOGO = "/static/telegram.svg";

interface TelegramLinkPanelProps {
  error: string;
  isLinked: boolean;
  isUnlinking: boolean;
  onLink: () => void;
  onUnlink: () => void;
}

export const TelegramLinkPanel = ({ error, isLinked, isUnlinking, onLink, onUnlink }: TelegramLinkPanelProps) => {
  const i18n = useI18n();

  return (
    <div className="bg-primary/10 flex items-center justify-between rounded-xl px-4 py-2">
      <div className="flex space-x-2">
        <Image alt="Telegram" width={22} height={22} src={TELEGRAM_LOGO} />
        <p>
          {isLinked ? i18n("Telegram is linked and receiving customer messages") : i18n("Receive messages in Telegram")}
        </p>
      </div>
      {isLinked ? (
        <Button busy={isUnlinking} color="danger" onClick={onUnlink} size="sm" variant="outlined">
          {i18n("Unlink")}
        </Button>
      ) : (
        <div className="flex items-center space-x-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button color="primary" onClick={onLink} size="sm">
            {i18n("Link")}
          </Button>
        </div>
      )}
    </div>
  );
};
