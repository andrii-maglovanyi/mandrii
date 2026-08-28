ALTER TABLE public.content_update_comments
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT NOW(),
  ADD COLUMN deleted_at timestamptz,
  ADD COLUMN deleted_by_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX content_update_comments_visible_feed_idx
  ON public.content_update_comments (content_update_id, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

CREATE TRIGGER content_update_comments_update_timestamp
BEFORE UPDATE OF body ON public.content_update_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.content_update_comment_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.content_update_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 3 AND 500),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  resolved_at timestamptz,
  resolved_by_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  UNIQUE (comment_id, user_id)
);

CREATE INDEX content_update_comment_reports_open_idx
  ON public.content_update_comment_reports (created_at DESC) WHERE status = 'OPEN';

CREATE TABLE public.content_comment_blocked_terms (
  term text PRIMARY KEY CHECK (char_length(btrim(term)) BETWEEN 2 AND 100),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE public.content_update_notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  comments_enabled boolean NOT NULL DEFAULT true,
  replies_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE public.content_update_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_update_id uuid NOT NULL REFERENCES public.content_updates(id) ON DELETE CASCADE,
  comment_id uuid NOT NULL REFERENCES public.content_update_comments(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('COMMENT', 'REPLY')),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX content_update_notifications_recipient_idx
  ON public.content_update_notifications (recipient_id, read_at, created_at DESC);
