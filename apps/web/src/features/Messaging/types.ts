export type Conversation = {
  archived_at: null | string;
  created_at: string;
  id: string;
  last_message_deleted?: boolean;
  last_message_body: null | string;
  last_message_at: null | string;
  unread_count: number | string;
  user_name: null | string;
};

export type ConversationMessage = {
  body: string;
  created_at: string;
  deleted_at?: null | string;
  edited_at?: null | string;
  editable?: boolean;
  id: string;
  reply_to_body?: null | string;
  reply_to_deleted?: boolean;
  reply_to_message_id?: null | string;
  reply_to_sender_type?: null | "USER" | "VENUE";
  reactions?: Array<{ count: number | string; emoji: string; reacted: boolean }>;
  sent_from_telegram?: boolean;
  sender_type: "USER" | "VENUE";
  telegram_delivered_at?: null | string;
};
