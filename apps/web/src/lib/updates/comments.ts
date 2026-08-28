import { ContentUpdateComment } from "~/lib/updates/types";

export const COMMENT_EDIT_WINDOW_MS = 15 * 60 * 1000;

export const canEditContentUpdateComment = (comment: ContentUpdateComment, userId: null | string, now = Date.now()) =>
  comment.author.id === userId && new Date(comment.createdAt).getTime() > now - COMMENT_EDIT_WINDOW_MS;

export const mergeContentUpdateCommentPage = (current: ContentUpdateComment[], page: ContentUpdateComment[]) => {
  const known = new Set(current.map((comment) => comment.id));
  return [...current, ...page.filter((comment) => !known.has(comment.id))].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime() || left.id.localeCompare(right.id),
  );
};

export const reconcileContentUpdateCommentPreview = (
  current: ContentUpdateComment[],
  preview: ContentUpdateComment[],
) => {
  const byId = new Map(preview.map((comment) => [comment.id, comment]));
  const retained = current.map((comment) => byId.get(comment.id) ?? comment);
  return mergeContentUpdateCommentPage(retained, preview);
};
