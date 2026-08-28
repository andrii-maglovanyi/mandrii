CREATE TABLE public.content_update_likes (
  content_update_id uuid NOT NULL REFERENCES public.content_updates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_update_id, user_id)
);

CREATE TABLE public.content_update_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_update_id uuid NOT NULL REFERENCES public.content_updates(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.content_update_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX content_update_comments_feed_idx
  ON public.content_update_comments (content_update_id, created_at ASC, id ASC);

-- A reply may only target a top-level comment on the same update. Keeping this
-- rule in the database prevents accidental deep nesting from any future caller.
CREATE FUNCTION public.validate_content_update_comment_parent()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.content_update_comments parent
    WHERE parent.id = NEW.parent_id
      AND parent.content_update_id = NEW.content_update_id
      AND parent.parent_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Replies must belong to a top-level comment on the same update';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER content_update_comments_validate_parent
BEFORE INSERT OR UPDATE OF content_update_id, parent_id ON public.content_update_comments
FOR EACH ROW EXECUTE FUNCTION public.validate_content_update_comment_parent();
