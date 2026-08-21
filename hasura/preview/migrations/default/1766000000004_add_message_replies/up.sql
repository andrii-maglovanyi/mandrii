ALTER TABLE public.messages
ADD COLUMN reply_to_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL;
