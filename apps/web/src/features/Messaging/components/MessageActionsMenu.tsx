import { Copy, Pencil, Reply, Trash2 } from "lucide-react";

import { useI18n } from "~/i18n/useI18n";
import { MESSAGE_REACTION_EMOJIS } from "~/lib/messaging/constants";

import type { ConversationMessage } from "../types";

export type MessageActionsMenuState = {
  actionsTop: number;
  emojisTop: number;
  message: ConversationMessage;
  x: number;
};

interface MessageActionsMenuProps {
  canDelete: boolean;
  canEdit: boolean;
  menu: MessageActionsMenuState;
  onClose: () => void;
  onCopy: (body: string) => void;
  onDelete: (message: ConversationMessage) => void;
  onEdit: (message: ConversationMessage) => void;
  onReply: (message: ConversationMessage) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

export const MessageActionsMenu = ({
  canDelete,
  canEdit,
  menu,
  onClose,
  onCopy,
  onDelete,
  onEdit,
  onReply,
  onToggleReaction,
}: MessageActionsMenuProps) => {
  const i18n = useI18n();

  return (
    <>
      <div
        data-message-actions
        className="bg-surface fixed z-[70] flex max-w-[calc(100vw-1rem)] touch-manipulation items-center gap-0.5 rounded-full p-1.5 shadow-xl ring-1 ring-neutral-200"
        style={{ left: menu.x, top: menu.emojisTop }}
      >
        {MESSAGE_REACTION_EMOJIS.map((emoji) => (
          <button
            aria-label={emoji}
            className="hover:bg-surface-tint active:bg-surface-tint h-11 w-11 shrink-0 rounded-full px-1.5 py-1 text-2xl transition-transform hover:scale-110"
            key={emoji}
            onClick={() => {
              onClose();
              onToggleReaction(menu.message.id, emoji);
            }}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>
      <div
        data-message-actions
        className="bg-surface fixed z-[70] min-w-44 touch-manipulation overflow-hidden rounded-xl shadow-xl ring-1 ring-neutral-200"
        style={{ left: menu.x, top: menu.actionsTop }}
      >
        <button
          className="hover:bg-surface-tint active:bg-surface-tint flex min-h-12 w-full items-center gap-2 px-4 py-3 text-sm font-medium"
          onClick={() => onReply(menu.message)}
          type="button"
        >
          <Reply size={18} />
          {i18n("Reply")}
        </button>
        <button
          className="border-neutral/10 hover:bg-surface-tint active:bg-surface-tint flex min-h-12 w-full items-center gap-2 border-t px-4 py-3 text-sm font-medium"
          onClick={() => onCopy(menu.message.body)}
          type="button"
        >
          <Copy size={18} />
          {i18n("Copy")}
        </button>
        {canEdit && (
          <button
            className="border-neutral/10 hover:bg-surface-tint active:bg-surface-tint flex min-h-12 w-full items-center gap-2 border-t px-4 py-3 text-sm font-medium"
            onClick={() => onEdit(menu.message)}
            type="button"
          >
            <Pencil size={18} />
            {i18n("Edit")}
          </button>
        )}
        {canDelete && (
          <button
            className="border-neutral/10 text-danger hover:bg-danger/10 active:bg-danger/10 flex min-h-12 w-full items-center gap-2 border-t px-4 py-3 text-sm font-medium"
            onClick={() => onDelete(menu.message)}
            type="button"
          >
            <Trash2 size={18} />
            {i18n("Delete")}
          </button>
        )}
      </div>
    </>
  );
};
