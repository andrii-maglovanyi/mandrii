DROP TRIGGER IF EXISTS content_update_comments_validate_parent ON public.content_update_comments;
DROP FUNCTION IF EXISTS public.validate_content_update_comment_parent();
DROP TABLE IF EXISTS public.content_update_comments;
DROP TABLE IF EXISTS public.content_update_likes;
