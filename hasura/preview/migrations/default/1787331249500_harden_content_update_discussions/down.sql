DROP TABLE IF EXISTS public.content_update_notifications;
DROP TABLE IF EXISTS public.content_update_notification_preferences;
DROP TABLE IF EXISTS public.content_comment_blocked_terms;
DROP TABLE IF EXISTS public.content_update_comment_reports;
DROP TRIGGER IF EXISTS content_update_comments_update_timestamp ON public.content_update_comments;
DROP INDEX IF EXISTS public.content_update_comments_visible_feed_idx;
ALTER TABLE public.content_update_comments
  DROP COLUMN IF EXISTS deleted_by_user_id,
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS updated_at;
