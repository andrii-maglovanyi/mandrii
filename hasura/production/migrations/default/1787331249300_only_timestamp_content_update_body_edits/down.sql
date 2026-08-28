DROP TRIGGER content_updates_update_timestamp ON public.content_updates;

CREATE TRIGGER content_updates_update_timestamp
BEFORE UPDATE ON public.content_updates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
