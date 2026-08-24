import type { RefObject } from "react";

import { Button, Textarea } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

import type { ConversationMessage } from "../types";

interface MessageComposerProps {
  disabled: boolean;
  error: string;
  isSending: boolean;
  messageBeingEdited: ConversationMessage | null;
  messageBody: string;
  onCancelEdit: () => void;
  onCancelReply: () => void;
  onChange: (body: string) => void;
  onSend: () => void;
  replyToMessage: ConversationMessage | null;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export const MessageComposer = ({
  disabled,
  error,
  isSending,
  messageBeingEdited,
  messageBody,
  onCancelEdit,
  onCancelReply,
  onChange,
  onSend,
  replyToMessage,
  textareaRef,
}: MessageComposerProps) => {
  const i18n = useI18n();

  return (
    <div className="shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
      {messageBeingEdited && (
        <div className="border-primary bg-primary/8 mb-2 flex items-center justify-between rounded-lg border-l-4 px-3 py-2 text-xs">
          <span className="truncate">{i18n("Editing message")}</span>
          <button aria-label={i18n("Cancel editing")} className="ml-3 text-base" onClick={onCancelEdit} type="button">
            ×
          </button>
        </div>
      )}
      {replyToMessage && (
        <div className="border-primary bg-primary/8 mb-2 flex items-center justify-between rounded-lg border-l-4 px-3 py-2 text-xs">
          <span className="truncate">
            {i18n("Replying to")}: {replyToMessage.body}
          </span>
          <button aria-label={i18n("Cancel reply")} className="ml-3 text-base" onClick={onCancelReply} type="button">
            ×
          </button>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="w-full min-w-0">
          <Textarea
            className="min-h-18 resize-none"
            disabled={disabled}
            maxChars={4096}
            onChange={(event) => onChange(event.target.value)}
            placeholder={i18n("Write a message")}
            ref={textareaRef}
            rows={2}
            value={messageBody}
          />
        </div>
        <div className="-mt-3 flex w-full justify-end">
          <Button busy={isSending} className="min-h-11" disabled={!messageBody.trim() || disabled} onClick={onSend}>
            {messageBeingEdited ? i18n("Save") : i18n("Send")}
          </Button>
        </div>
      </div>
      {error && <p className="mt-1 text-right text-sm text-red-600">{error}</p>}
    </div>
  );
};
