DROP TRIGGER IF EXISTS content_update_notification_preferences_update_timestamp ON public.content_update_notification_preferences;
CREATE OR REPLACE FUNCTION public.validate_content_update_comment_parent()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  IF NEW.parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.content_update_comments parent WHERE parent.id = NEW.parent_id AND parent.content_update_id = NEW.content_update_id AND parent.parent_id IS NULL) THEN RAISE EXCEPTION 'Replies must belong to a top-level comment on the same update'; END IF; RETURN NEW;
END; $$;
