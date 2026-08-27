"use client";

import { ImagePlus, MessageSquareText, Pencil, Pin, PinOff, Plus, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  Tooltip,
} from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useTheme } from "~/contexts/ThemeContext";
import { ADD_ENTITY_BUTTON_CLASSES, AddEntityButton } from "~/features/shared/AddEntityButton";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { getPublicMediaUrl } from "~/lib/media";
import { RatingTargetType } from "~/lib/ratings/types";
import {
  CONTENT_UPDATE_IMAGE_ACCEPT,
  CONTENT_UPDATE_MAX_IMAGES,
  CONTENT_UPDATE_PAGE_SIZE,
  isContentUpdateImage,
} from "~/lib/updates/constants";
import { ContentUpdate, ContentUpdatesResponse } from "~/lib/updates/types";

type ContentUpdatesProps = {
  canManage: boolean;
  targetId: string;
  type: RatingTargetType;
};

const EMPTY_RESPONSE: ContentUpdatesResponse = { nextCursor: null, updates: [] };

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

export const ContentUpdates = ({ canManage, targetId, type }: ContentUpdatesProps) => {
  const i18n = useI18n();
  const locale = useLocale();
  const { isDark } = useTheme();
  const { openConfirmDialog } = useDialog();
  const { showError, showSuccess } = useNotifications();
  const [data, setData] = useState<ContentUpdatesResponse>(EMPTY_RESPONSE);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pinningId, setPinningId] = useState<null | string>(null);
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<null | string>(null);
  const [images, setImages] = useState<File[]>([]);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const load = useCallback(
    async (cursor?: null | string, append = false, signal?: AbortSignal) => {
      const query = new URLSearchParams({ limit: String(CONTENT_UPDATE_PAGE_SIZE), targetId, type });
      if (cursor) query.set("cursor", cursor);

      const response = await fetch(`/api/updates?${query}`, { signal });
      const result = (await response.json()) as ContentUpdatesResponse & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to load updates");

      setData((current) =>
        append
          ? { nextCursor: result.nextCursor, updates: [...current.updates, ...result.updates] }
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

  const addImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).filter(isContentUpdateImage);
    setImages((current) => [...current, ...selected].slice(0, CONTENT_UPDATE_MAX_IMAGES));
    event.target.value = "";
  };

  return (
    <section aria-label={i18n("Updates")} className="space-y-4">
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
                  accept={CONTENT_UPDATE_IMAGE_ACCEPT}
                  isMultiple
                  label={i18n("Add photos")}
                  onChange={addImages}
                  placeholder={i18n("Up to {count} photos", { count: CONTENT_UPDATE_MAX_IMAGES })}
                />
              ) : (
                <Button onClick={() => setShowImagePicker(true)} variant="outlined">
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
              <Button busy={isSaving} color="primary" disabled={!body.trim()} onClick={() => void save()}>
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
