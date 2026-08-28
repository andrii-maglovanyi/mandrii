CREATE OR REPLACE FUNCTION public.validate_content_update_comment_parent()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.content_update_comments parent
    WHERE parent.id = NEW.parent_id AND parent.content_update_id = NEW.content_update_id
      AND parent.parent_id IS NULL AND parent.deleted_at IS NULL
  ) THEN RAISE EXCEPTION 'Replies must belong to an active top-level comment on the same update'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER content_update_notification_preferences_update_timestamp
BEFORE UPDATE ON public.content_update_notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
