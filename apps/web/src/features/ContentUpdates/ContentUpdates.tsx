"use client";

import {
  Bell,
  Flag,
  Heart,
  ImagePlus,
  MessageSquareText,
  Pencil,
  Pin,
  PinOff,
  Reply,
  Send,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Avatar, ImagePreview } from "~/components/layout";
import {
  ActionButton,
  AnimatedEllipsis,
  Button,
  Checkbox,
  EmptyState,
  FilePicker,
  ImageCarousel,
  RichText,
  TextLink,
  Tooltip,
} from "~/components/ui";
import { SignInForm } from "~/components/layout/Auth/SignInForm";
import { useDialog } from "~/contexts/DialogContext";
import { useTheme } from "~/contexts/ThemeContext";
import { AddEntityButton } from "~/features/shared/AddEntityButton";
import { useImageUploadPreparation } from "~/hooks/useImageUploadPreparation";
import { useUser } from "~/hooks/useUser";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { getPublicMediaUrl } from "~/lib/media";
import {
  canEditContentUpdateComment,
  mergeContentUpdateCommentPage,
  reconcileContentUpdateCommentPreview,
} from "~/lib/updates/comments";
import { IMAGE_UPLOAD_ACCEPT } from "~/lib/images/uploadConfig";
import { RatingTargetType } from "~/lib/ratings/types";
import {
  CONTENT_UPDATE_MAX_IMAGE_BYTES,
  CONTENT_UPDATE_MAX_IMAGES,
  CONTENT_UPDATE_PAGE_SIZE,
} from "~/lib/updates/constants";
import { ContentUpdate, ContentUpdateComment, ContentUpdatesResponse } from "~/lib/updates/types";

type ContentUpdatesProps = {
  canManage: boolean;
  targetId: string;
  type: RatingTargetType;
};

const EMPTY_RESPONSE: ContentUpdatesResponse = { nextCursor: null, updates: [] };

const mergeContentUpdatePage = (current: ContentUpdate[], page: ContentUpdate[]) => {
  const pageById = new Map(page.map((update) => [update.id, update]));
  const currentIds = new Set(current.map((update) => update.id));

  return [
    ...current.map((update) => pageById.get(update.id) ?? update),
    ...page.filter((update) => !currentIds.has(update.id)),
  ].sort(
    (left, right) =>
      Number(right.isPinned) - Number(left.isPinned) ||
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime() ||
      right.id.localeCompare(left.id),
  );
};

const MarkdownEditor = dynamic(() => import("~/components/ui/MDEditor/MDEditor").then((module) => module.MDEditor), {
  loading: () => <AnimatedEllipsis centered size="md" />,
  ssr: false,
});
const UpdateImagePreviews = ({ images, onRemove }: { images: File[]; onRemove: (index: number) => void }) => {
  const i18n = useI18n();
  const previews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview)), [previews]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {previews.map((preview, index) => (
        <ImagePreview
          key={`${images[index].name}-${images[index].lastModified}`}
          number={index + 1}
          onRemove={() => onRemove(index)}
          previewAlt={i18n("Preview {number}", { number: index + 1 })}
          previewUrl={preview}
          removeLabel={i18n("Remove image {number}", { number: index + 1 })}
        />
      ))}
    </div>
  );
};

type CommentThreadProps = {
  canManage: boolean;
  commentCount: number;
  comments: ContentUpdateComment[];
  isAuthenticated: boolean;
  viewerId: null | string;
  onDelete: (comment: ContentUpdateComment) => Promise<boolean>;
  onEdit: (comment: ContentUpdateComment, body: string) => Promise<boolean>;
  onReport: (comment: ContentUpdateComment) => void;
  onSubmit: (body: string, parentId: null | string) => Promise<boolean>;
  updateId: string;
};

const CommentThread = ({
  canManage,
  commentCount,
  comments,
  isAuthenticated,
  onDelete,
  onEdit,
  onReport,
  onSubmit,
  updateId,
  viewerId,
}: CommentThreadProps) => {
  const i18n = useI18n();
  const { showError } = useNotifications();
  const locale = useLocale();
  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<null | string>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<null | string>(null);
  const [editDraft, setEditDraft] = useState("");
  const [loadedComments, setLoadedComments] = useState(comments);
  const [nextCursor, setNextCursor] = useState<null | string>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExhausted, setIsExhausted] = useState(false);
  const [replyCursors, setReplyCursors] = useState<Record<string, null | string>>({});
  const [loadedReplyParents, setLoadedReplyParents] = useState<Set<string>>(new Set());
  const [loadingReplyParents, setLoadingReplyParents] = useState<Set<string>>(new Set());
  useEffect(() => setLoadedComments(comments), [updateId]);
  useEffect(() => setLoadedComments((current) => reconcileContentUpdateCommentPreview(current, comments)), [comments]);
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const topLevel = loadedComments.filter((comment) => !comment.parentId);

  const loadReplies = async (commentId: string) => {
    if (loadingReplyParents.has(commentId)) return;
    const cursor = replyCursors[commentId];
    setLoadingReplyParents((current) => new Set(current).add(commentId));
    try {
      const response = await fetch(
        `/api/updates/${updateId}/comments/${commentId}/replies${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
      );
      const result = (await response.json()) as { comments: ContentUpdateComment[]; nextCursor: null | string };
      if (!response.ok) throw new Error();
      setLoadedComments((current) => mergeContentUpdateCommentPage(current, result.comments));
      setReplyCursors((current) => ({ ...current, [commentId]: result.nextCursor }));
      setLoadedReplyParents((current) => new Set(current).add(commentId));
    } catch {
      showError(i18n("Unable to load replies"));
    } finally {
      setLoadingReplyParents((current) => {
        const next = new Set(current);
        next.delete(commentId);
        return next;
      });
    }
  };

  const loadMoreComments = async () => {
    setIsLoadingMore(true);
    try {
      const response = await fetch(
        `/api/updates/${updateId}/comments${nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : ""}`,
      );
      const result = (await response.json()) as { comments: ContentUpdateComment[]; nextCursor: null | string };
      if (!response.ok) throw new Error();
      setLoadedComments((current) => mergeContentUpdateCommentPage(current, result.comments));
      setNextCursor(result.nextCursor);
      setIsExhausted(result.nextCursor === null);
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to load comments"));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const submit = async (body: string, parentId: null | string, reset: () => void) => {
    if (!body.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (await onSubmit(body.trim(), parentId)) reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = (comment: ContentUpdateComment, isReply = false) => (
    <div className={isReply ? "mt-3 ml-8" : "mt-3"} key={comment.id}>
      <div className="flex gap-2">
        <Avatar avatarSize={28} profile={comment.author} />
        <div className="bg-surface rounded-lg px-3 py-2 text-sm">
          <p className="font-semibold">{comment.author.name ?? i18n("Member")}</p>
          {editingCommentId === comment.id ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void onEdit(comment, editDraft).then((saved) => {
                  if (saved) setEditingCommentId(null);
                });
              }}
            >
              <input
                autoFocus
                className="bg-surface border-primary/20 w-full rounded border px-2 py-1"
                maxLength={1000}
                onChange={(event) => setEditDraft(event.target.value)}
                value={editDraft}
              />
            </form>
          ) : (
            <p className="whitespace-pre-wrap">{comment.body}</p>
          )}
          <div className="text-neutral mt-1 flex items-center gap-2 text-xs">
            <span>{dateFormatter.format(new Date(comment.createdAt))}</span>
            {!isReply && isAuthenticated && (
              <button
                className="hover:text-primary inline-flex items-center gap-1"
                onClick={() => setReplyingTo(comment.id)}
                type="button"
              >
                <Reply aria-hidden size={13} /> {i18n("Reply")}
              </button>
            )}
            {(canManage || canEditContentUpdateComment(comment, viewerId)) && (
              <button
                className="hover:text-danger"
                onClick={() => {
                  void onDelete(comment).then(
                    (removed) =>
                      removed &&
                      setLoadedComments((current) =>
                        current.filter((item) => item.id !== comment.id && item.parentId !== comment.id),
                      ),
                  );
                }}
                type="button"
              >
                {i18n("Remove")}
              </button>
            )}
            {canEditContentUpdateComment(comment, viewerId) && (
              <button
                className="hover:text-primary"
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditDraft(comment.body);
                }}
                type="button"
              >
                {i18n("Edit")}
              </button>
            )}
            {isAuthenticated && comment.author.id !== viewerId && (
              <button
                className="hover:text-primary inline-flex items-center gap-1"
                onClick={() => onReport(comment)}
                type="button"
              >
                <Flag aria-hidden size={13} /> {i18n("Report")}
              </button>
            )}
          </div>
        </div>
      </div>
      {!isReply && replyingTo === comment.id && (
        <form
          className="mt-2 ml-8 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(replyDraft, comment.id, () => {
              setReplyDraft("");
              setReplyingTo(null);
            });
          }}
        >
          <input
            autoFocus
            className="bg-surface border-primary/20 min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
            disabled={isSubmitting}
            maxLength={1000}
            onChange={(event) => setReplyDraft(event.target.value)}
            placeholder={i18n("Write a reply")}
            value={replyDraft}
          />
          <ActionButton
            aria-label={i18n("Post reply")}
            busy={isSubmitting}
            disabled={isSubmitting}
            icon={<Send aria-hidden size={15} />}
            size="sm"
            type="submit"
          />
        </form>
      )}
      {!isReply &&
        loadedComments.filter((reply) => reply.parentId === comment.id).map((reply) => renderComment(reply, true))}
      {!isReply &&
        loadedComments.some((reply) => reply.parentId === comment.id) &&
        (!loadedReplyParents.has(comment.id) || replyCursors[comment.id]) && (
          <button
            className="text-primary mt-2 ml-8 text-xs disabled:cursor-wait disabled:opacity-60"
            disabled={loadingReplyParents.has(comment.id)}
            onClick={() => void loadReplies(comment.id)}
            type="button"
          >
            {loadingReplyParents.has(comment.id) ? i18n("Loading replies") : i18n("View replies")}
          </button>
        )}
    </div>
  );

  return (
    <div className="border-primary/10 mt-4 border-t pt-3">
      {isAuthenticated && (
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(draft, null, () => setDraft(""));
          }}
        >
          <input
            className="bg-surface border-primary/20 min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
            disabled={isSubmitting}
            maxLength={1000}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={i18n("Add a comment")}
            value={draft}
          />
          <ActionButton
            aria-label={i18n("Post comment")}
            busy={isSubmitting}
            disabled={isSubmitting}
            icon={<Send aria-hidden size={15} />}
            size="sm"
            type="submit"
          />
        </form>
      )}
      {topLevel.map((comment) => renderComment(comment))}
      {topLevel.length < commentCount && !isExhausted && (
        <button
          className="text-primary mt-3 text-sm"
          disabled={isLoadingMore}
          onClick={() => void loadMoreComments()}
          type="button"
        >
          {isLoadingMore ? i18n("Loading comments") : i18n("View more comments")}
        </button>
      )}
    </div>
  );
};

export const ContentUpdates = ({ canManage, targetId, type }: ContentUpdatesProps) => {
  const i18n = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { isDark } = useTheme();
  const { openConfirmDialog, openCustomDialog } = useDialog();
  const { data: viewer, isAuthenticated } = useUser();
  const { showError, showSuccess } = useNotifications();
  const [data, setData] = useState<ContentUpdatesResponse>(EMPTY_RESPONSE);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pinningId, setPinningId] = useState<null | string>(null);
  const [likingId, setLikingId] = useState<null | string>(null);
  const [activity, setActivity] = useState<
    Array<{ actor_name: null | string; comment_body: string; id: string; kind: "COMMENT" | "REPLY"; update_id: string }>
  >([]);
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<null | string>(null);
  const [images, setImages] = useState<File[]>([]);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const requestedDeepLinks = useRef(new Set<string>());
  const { isPreparing: isPreparingImages, prepareImages } = useImageUploadPreparation(CONTENT_UPDATE_MAX_IMAGE_BYTES);

  const load = useCallback(
    async (cursor?: null | string, append = false, signal?: AbortSignal) => {
      const query = new URLSearchParams({ limit: String(CONTENT_UPDATE_PAGE_SIZE), targetId, type });
      if (cursor) query.set("cursor", cursor);

      const response = await fetch(`/api/updates?${query}`, { signal });
      const result = (await response.json()) as ContentUpdatesResponse & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to load updates");

      setData((current) =>
        append
          ? { nextCursor: result.nextCursor, updates: mergeContentUpdatePage(current.updates, result.updates) }
          : { nextCursor: result.nextCursor, updates: result.updates },
      );
    },
    [targetId, type],
  );

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    void load(null, false, controller.signal)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        showError(error instanceof Error ? error.message : i18n("Unable to load updates"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [i18n, load, showError]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetch("/api/updates/notifications")
      .then(async (response) => {
        if (!response.ok) return;
        const result = (await response.json()) as {
          notifications: typeof activity;
        };
        setActivity(result.notifications);
      })
      .catch(() => undefined);
  }, [isAuthenticated]);

  useEffect(() => {
    const updateId = new URLSearchParams(window.location.search).get("update");
    if (!updateId) return;

    const update = document.getElementById(`update-${updateId}`);
    if (update) {
      update.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (isLoading || requestedDeepLinks.current.has(updateId)) return;

    requestedDeepLinks.current.add(updateId);
    const query = new URLSearchParams({ targetId, type });
    void fetch(`/api/updates/${updateId}?${query}`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const linkedUpdate = (await response.json()) as ContentUpdate;
        setData((current) =>
          current.updates.some((item) => item.id === linkedUpdate.id)
            ? current
            : { ...current, updates: [...current.updates, linkedUpdate] },
        );
      })
      .catch(() => undefined);
  }, [data, isLoading, targetId, type]);

  const resetDraft = () => {
    setBody("");
    setEditingId(null);
    setImages([]);
    setIsHighlighted(false);
    setShowImagePicker(false);
  };

  const resetComposer = () => {
    resetDraft();
    setIsComposerOpen(false);
  };

  const openComposer = () => {
    resetDraft();
    setIsComposerOpen(true);
  };

  const save = async () => {
    const trimmedBody = body.trim();
    if (!trimmedBody) return;
    setIsSaving(true);

    try {
      const payload = new FormData();
      payload.set("body", trimmedBody);
      if (!editingId) {
        payload.set("isHighlighted", String(isHighlighted));
        payload.set("targetId", targetId);
        payload.set("type", type);
        images.forEach((image) => payload.append("images", image));
      }

      const response = await fetch(editingId ? `/api/updates/${editingId}` : "/api/updates", {
        body: payload,
        method: editingId ? "PUT" : "POST",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to save update");

      showSuccess(i18n(editingId ? "Update saved" : "Update published"));
      resetComposer();
      await load();
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to save update"));
    } finally {
      setIsSaving(false);
    }
  };

  const edit = (update: ContentUpdate) => {
    setBody(update.body);
    setImages([]);
    setShowImagePicker(false);
    setEditingId(update.id);
    setIsComposerOpen(true);
  };

  const remove = async (update: ContentUpdate) => {
    const confirmed = await openConfirmDialog({
      message: i18n("This update will be removed from the public feed."),
      title: i18n("Remove update?"),
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/updates/${update.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to remove update");

      showSuccess(i18n("Update removed"));
      await load();
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to remove update"));
    }
  };

  const togglePinned = async (update: ContentUpdate) => {
    if (pinningId) return;
    setPinningId(update.id);

    try {
      const response = await fetch(`/api/updates/${update.id}/pin`, {
        body: JSON.stringify({ pinned: !update.isPinned }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to update pinned status");

      showSuccess(update.isPinned ? i18n("Update unpinned") : i18n("Update pinned"));
      await load();
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to update pinned status"));
    } finally {
      setPinningId(null);
    }
  };

  const toggleLike = async (update: ContentUpdate) => {
    if (!isAuthenticated) {
      openCustomDialog({ children: <SignInForm /> });
      return;
    }
    if (likingId) return;
    setLikingId(update.id);
    try {
      const response = await fetch(`/api/updates/${update.id}/reaction`, { method: "PUT" });
      const result = (await response.json()) as { error?: string; isLikedByViewer?: boolean; likeCount?: number };
      if (!response.ok || result.isLikedByViewer === undefined || result.likeCount === undefined) {
        throw new Error(result.error ?? "Unable to update reaction");
      }
      setData((current) => ({
        ...current,
        updates: current.updates.map((item) =>
          item.id === update.id
            ? { ...item, isLikedByViewer: result.isLikedByViewer!, likeCount: result.likeCount! }
            : item,
        ),
      }));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to update reaction"));
    } finally {
      setLikingId(null);
    }
  };

  const addComment = async (update: ContentUpdate, body: string, parentId: null | string) => {
    try {
      const response = await fetch(`/api/updates/${update.id}/comments`, {
        body: JSON.stringify({ body, parentId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const comment = (await response.json()) as ContentUpdateComment & { error?: string };
      if (!response.ok) throw new Error(comment.error ?? "Unable to post comment");
      setData((current) => ({
        ...current,
        updates: current.updates.map((item) =>
          item.id === update.id
            ? { ...item, commentCount: item.commentCount + 1, comments: [...item.comments, comment] }
            : item,
        ),
      }));
      return true;
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to post comment"));
      return false;
    }
  };

  const removeComment = async (update: ContentUpdate, comment: ContentUpdateComment) => {
    const confirmed = await openConfirmDialog({
      message: i18n("This comment and any replies will be removed."),
      title: i18n("Remove comment?"),
    });
    if (!confirmed) return false;
    try {
      const response = await fetch(`/api/updates/${update.id}/comments/${comment.id}`, { method: "DELETE" });
      const result = (await response.json()) as { deletedCount?: number; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to remove comment");
      const deletedCount = result.deletedCount;
      if (typeof deletedCount !== "number" || !Number.isInteger(deletedCount) || deletedCount < 1)
        throw new Error(i18n("Unable to remove comment"));
      const removedIds = new Set([
        comment.id,
        ...update.comments.filter((item) => item.parentId === comment.id).map((item) => item.id),
      ]);
      setData((current) => ({
        ...current,
        updates: current.updates.map((item) =>
          item.id === update.id
            ? {
                ...item,
                commentCount: Math.max(0, item.commentCount - deletedCount),
                comments: item.comments.filter((item) => !removedIds.has(item.id)),
              }
            : item,
        ),
      }));
      return true;
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to remove comment"));
      return false;
    }
  };

  const editComment = async (update: ContentUpdate, comment: ContentUpdateComment, commentBody: string) => {
    try {
      const response = await fetch(`/api/updates/${update.id}/comments/${comment.id}`, {
        body: JSON.stringify({ body: commentBody }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const edited = (await response.json()) as ContentUpdateComment & { error?: string };
      if (!response.ok) throw new Error(edited.error ?? "Unable to edit comment");
      setData((current) => ({
        ...current,
        updates: current.updates.map((item) =>
          item.id === update.id
            ? { ...item, comments: item.comments.map((entry) => (entry.id === comment.id ? edited : entry)) }
            : item,
        ),
      }));
      return true;
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to edit comment"));
      return false;
    }
  };

  const reportComment = async (update: ContentUpdate, comment: ContentUpdateComment) => {
    const reason = window.prompt(i18n("Why are you reporting this comment?"));
    if (!reason?.trim()) return;
    try {
      const response = await fetch(`/api/updates/${update.id}/comments/${comment.id}/report`, {
        body: JSON.stringify({ reason: reason.trim() }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to report comment");
      showSuccess(i18n("Comment reported"));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to report comment"));
    }
  };

  const loadMore = async () => {
    if (!data.nextCursor) return;
    setIsLoadingMore(true);
    try {
      await load(data.nextCursor, true);
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to load updates"));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  const addImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    const remaining = CONTENT_UPDATE_MAX_IMAGES - images.length;
    if (!selected.length || remaining <= 0) return;

    try {
      const prepared = await prepareImages(selected.slice(0, remaining));
      setImages((current) => [...current, ...prepared].slice(0, CONTENT_UPDATE_MAX_IMAGES));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to prepare photos"));
    }
  };

  const visibleActivity = activity.filter((item) => data.updates.some((update) => update.id === item.update_id));

  const scrollToUpdate = (event: React.MouseEvent<HTMLAnchorElement>, updateId: string) => {
    const update = document.getElementById(`update-${updateId}`);
    if (!update) return;

    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set("update", updateId);
    router.replace(`${pathname}?${params.toString()}${window.location.hash}`, { scroll: false });
    update.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section aria-label={i18n("Feed")} className="space-y-4">
      {canManage && !isComposerOpen && (
        <div className="flex justify-end rounded-xl">
          <AddEntityButton
            signInLabel={i18n("Sign in to post update")}
            isAuthenticated={canManage}
            onClick={() => openComposer()}
            label={i18n("Post update")}
          />
        </div>
      )}

      {isAuthenticated && visibleActivity.length > 0 && (
        <aside
          aria-label={i18n("Updates activity")}
          className="bg-surface-tint/50 border-primary/10 rounded-xl border p-3"
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bell aria-hidden size={16} /> {i18n("Updates activity")}
          </div>
          {visibleActivity.slice(0, 3).map((item) => (
            <a
              className="text-neutral mt-2 block text-sm hover:underline"
              href={`?update=${item.update_id}`}
              key={item.id}
              onClick={(event) => scrollToUpdate(event, item.update_id)}
            >
              {item.actor_name ?? i18n("Someone")} · {item.comment_body}
            </a>
          ))}
        </aside>
      )}

      {isAuthenticated && (
        <TextLink href="/user-profile/settings#updates-notifications">
          {i18n("Manage Updates notification settings")}
        </TextLink>
      )}

      {canManage && isComposerOpen && (
        <div className="bg-surface-tint/50 border-primary/20 space-y-4 rounded-xl border p-4">
          <MarkdownEditor
            height={260}
            isDark={isDark}
            label={i18n(editingId ? "Edit update" : "New update")}
            maxChars={1500}
            name="update"
            onChange={(event) => setBody(event.target.value)}
            placeholder={i18n("Share news, a practical update, or something visitors should know.")}
            preview="edit"
            required
            value={body}
          />
          {!editingId && (
            <div className="flex items-center justify-between">
              {showImagePicker ? (
                <FilePicker
                  accept={IMAGE_UPLOAD_ACCEPT}
                  disabled={isPreparingImages}
                  isMultiple
                  label={i18n("Add photos")}
                  onChange={(event) => void addImages(event)}
                  placeholder={i18n("Up to {count} photos", { count: CONTENT_UPDATE_MAX_IMAGES })}
                />
              ) : (
                <Button disabled={isPreparingImages} onClick={() => setShowImagePicker(true)} variant="outlined">
                  <ImagePlus aria-hidden className="mr-1" size={18} />
                  {i18n("Add photos")}
                </Button>
              )}
              {images.length > 0 && (
                <UpdateImagePreviews
                  images={images}
                  onRemove={(index) => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                />
              )}
              {isPreparingImages && (
                <span className="text-neutral inline-flex items-center gap-1 text-sm">
                  {i18n("Preparing photos")}
                  <AnimatedEllipsis el="." />
                </span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <Checkbox
              checked={isHighlighted}
              label={i18n("Highlight it")}
              onChange={(event) => setIsHighlighted(event.target.checked)}
            />
            <div>
              <Button disabled={isSaving} onClick={resetComposer} variant="ghost">
                {i18n("Cancel")}
              </Button>
              <Button
                busy={isSaving}
                color="primary"
                disabled={isPreparingImages || !body.trim()}
                onClick={() => void save()}
              >
                {i18n(editingId ? "Save update" : "Publish update")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <AnimatedEllipsis centered size="lg" />
      ) : data.updates.length ? (
        <div className="space-y-3">
          {data.updates.map((update) => {
            const imageUrls = update.images
              .map((image) => getPublicMediaUrl(image))
              .filter((image): image is string => Boolean(image));
            const pinLabel = update.isPinned ? i18n("Unpin update") : i18n("Pin update");

            return (
              <article
                id={`update-${update.id}`}
                className={
                  update.isHighlighted
                    ? "bg-primary/10 border-primary/20 rounded-xl border p-4"
                    : "bg-surface-tint/50 border-primary/10 rounded-xl border p-4"
                }
                key={update.id}
              >
                <header className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar avatarSize={32} profile={update.author} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{update.author.name ?? i18n("Content owner")}</p>
                      <p className="text-neutral text-xs">
                        {dateFormatter.format(new Date(update.createdAt))}
                        {update.updatedAt !== update.createdAt && <> &bull; {i18n("Edited")}</>}
                      </p>
                    </div>
                  </div>
                  {update.isPinned && !canManage && (
                    <span className="text-primary flex shrink-0 items-center gap-1">
                      <Tooltip label={i18n("Pinned")}>
                        <Pin aria-hidden size={16} />
                      </Tooltip>
                    </span>
                  )}
                  {canManage && (
                    <div className="flex shrink-0 gap-1">
                      <ActionButton
                        aria-label={pinLabel}
                        busy={pinningId === update.id}
                        disabled={Boolean(pinningId)}
                        icon={update.isPinned ? <PinOff aria-hidden size={16} /> : <Pin aria-hidden size={16} />}
                        onClick={() => void togglePinned(update)}
                        size="sm"
                        variant="ghost"
                      />
                      <ActionButton
                        aria-label={i18n("Edit update")}
                        icon={<Pencil aria-hidden size={16} />}
                        onClick={() => edit(update)}
                        size="sm"
                        variant="ghost"
                      />
                      <ActionButton
                        aria-label={i18n("Remove update")}
                        icon={<Trash2 aria-hidden size={16} />}
                        onClick={() => void remove(update)}
                        size="sm"
                        variant="ghost"
                      />
                    </div>
                  )}
                </header>
                <RichText>{update.body}</RichText>
                {imageUrls.length > 0 && (
                  <div className="mt-4 aspect-video overflow-hidden rounded-lg">
                    <ImageCarousel images={imageUrls} preloadNext={false} priority={false} showDots />
                  </div>
                )}
                <div className="text-neutral mt-4 flex items-center gap-4 text-sm">
                  <button
                    aria-pressed={update.isLikedByViewer}
                    className={
                      update.isLikedByViewer
                        ? "text-primary inline-flex items-center gap-1"
                        : "hover:text-primary inline-flex items-center gap-1"
                    }
                    disabled={Boolean(likingId)}
                    onClick={() => void toggleLike(update)}
                    type="button"
                  >
                    <Heart aria-hidden fill={update.isLikedByViewer ? "currentColor" : "none"} size={17} />
                    <span>{i18n("Like")}</span>
                    <span>{update.likeCount}</span>
                  </button>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquareText aria-hidden size={17} />
                    {update.commentCount}
                  </span>
                </div>
                <CommentThread
                  canManage={canManage}
                  commentCount={update.commentCount}
                  comments={update.comments}
                  isAuthenticated={isAuthenticated}
                  viewerId={viewer?.id ?? null}
                  onDelete={(comment) => removeComment(update, comment)}
                  onEdit={(comment, commentBody) => editComment(update, comment, commentBody)}
                  onReport={(comment) => void reportComment(update, comment)}
                  onSubmit={(commentBody, parentId) => addComment(update, commentBody, parentId)}
                  updateId={update.id}
                />
              </article>
            );
          })}
          {data.nextCursor && (
            <div className="flex justify-center">
              <Button busy={isLoadingMore} onClick={() => void loadMore()} variant="outlined">
                {i18n("Load more updates")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          body={i18n("Updates from this venue or event will appear here.")}
          className="py-8"
          heading={i18n("No updates yet")}
          icon={<MessageSquareText aria-hidden size={50} />}
        />
      )}
    </section>
  );
};
