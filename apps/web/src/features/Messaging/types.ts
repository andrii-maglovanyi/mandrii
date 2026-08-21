export type Conversation = {
  created_at: string;
  id: string;
  last_message_at: null | string;
  unread_count: number | string;
  user_name: null | string;
};

export type ConversationMessage = {
  body: string;
  created_at: string;
  id: string;
  reply_to_body?: null | string;
  reply_to_message_id?: null | string;
  reply_to_sender_type?: null | "USER" | "VENUE";
  reactions?: Array<{ count: number | string; emoji: string; reacted: boolean }>;
  sender_type: "USER" | "VENUE";
  telegram_delivered_at?: null | string;
};
