"use client";

import { ChevronRight, LogIn, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button, SectionCard } from "~/components/ui";
import { useAuth } from "~/contexts/AuthContext";
import { useDialog } from "~/contexts/DialogContext";
import { SignInForm } from "~/components/layout/Auth/SignInForm";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { publishRatingRefresh, subscribeToRatingRefresh } from "~/lib/ratings/refresh";
import { ContentRatingSummary, RatingTargetType } from "~/lib/ratings/types";
import { User_Status_Enum } from "~/types";

type ContentRatingProps = {
  onOpenReviews?: () => void;
  targetId: string;
  type: RatingTargetType;
};

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

const emptySummary: ContentRatingSummary = {
  average: 0,
  canRate: false,
  count: 0,
  hasReview: false,
  myRating: null,
};

export const ContentRating = ({ onOpenReviews, targetId, type }: ContentRatingProps) => {
  const i18n = useI18n();
  const { profile, isLoading: isLoadingProfile } = useAuth();
  const { openCustomDialog } = useDialog();
  const { showError } = useNotifications();
  const [summary, setSummary] = useState<ContentRatingSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<null | number>(null);
  const skipNextRefresh = useRef(false);

  const loadSummary = useCallback(
    async (signal?: AbortSignal) => {
      const query = new URLSearchParams({ targetId, type });
      const response = await fetch(`/api/ratings?${query}`, { signal });
      const data = (await response.json()) as ContentRatingSummary & { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Unable to load ratings");

      setSummary(data);
    },
    [targetId, type],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadSummary(controller.signal)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        showError(error instanceof Error ? error.message : i18n("Unable to load ratings"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [i18n, loadSummary, showError]);

  useEffect(
    () =>
      subscribeToRatingRefresh(type, targetId, () => {
        if (skipNextRefresh.current) {
          skipNextRefresh.current = false;
          return;
        }
        void loadSummary();
      }),
    [loadSummary, targetId, type],
  );

  const publishSummaryRefresh = () => {
    // The POST/DELETE response already contains this card's updated summary.
    // Other review UI still needs the shared refresh event.
    skipNextRefresh.current = true;
    publishRatingRefresh(type, targetId);
  };

  const saveRating = async (rating: number) => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/ratings", {
        body: JSON.stringify({ rating, targetId, type }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as ContentRatingSummary & { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Unable to save your rating");

      setSummary(data);
      sendToMixpanel("Rated Content", { rating, targetId, targetType: type });
      publishSummaryRefresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to save your rating"));
    } finally {
      setIsSaving(false);
    }
  };

  const removeRating = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/ratings", {
        body: JSON.stringify({ targetId, type }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      });
      const data = (await response.json()) as ContentRatingSummary & { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Unable to remove your rating");

      setSummary(data);
      sendToMixpanel("Removed Content Rating", { targetId, targetType: type });
      publishSummaryRefresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to remove your rating"));
    } finally {
      setIsSaving(false);
    }
  };

  const isActiveUser = profile?.status === User_Status_Enum.Active;
  const canRate = isActiveUser && summary.canRate;
  const displayedRating = hoveredRating ?? summary.myRating ?? 0;
  const ratingLabel = summary.count === 1 ? i18n("1 rating") : i18n("{count} ratings", { count: summary.count });

  return (
    <SectionCard title={i18n("Ratings & reviews")}>
      <div className="mt-4 space-y-4">
        <button
          aria-label={i18n("Open ratings and reviews")}
          className="focus-visible:outline-primary hover:bg-surface-tint -mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={onOpenReviews}
          type="button"
        >
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <Star aria-hidden="true" className="mb-1 fill-amber-400 text-amber-400" size={24} />
            <span className="text-3xl font-bold tabular-nums">{summary.average.toFixed(1)}</span>
            <span className="text-neutral">/ 5</span>
            <span aria-hidden="true" className="text-neutral">
              ·
            </span>
            <span aria-live="polite" className="text-neutral text-sm">
              {isLoading ? i18n("Loading ratings…") : ratingLabel}
            </span>
          </span>
          <ChevronRight aria-hidden className="text-primary shrink-0" size={20} />
        </button>

        {!isLoadingProfile && !profile && (
          <Button
            className="gap-2"
            color="primary"
            onClick={() => openCustomDialog({ children: <SignInForm /> })}
            size="sm"
            variant="outlined"
          >
            <LogIn size={16} />
            {i18n("Sign in to rate")}
          </Button>
        )}

        {!isLoadingProfile && profile && !isActiveUser && (
          <p className="text-neutral text-sm">{i18n("Your account must be active to rate content")}</p>
        )}

        {!isLoadingProfile && canRate && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{summary.myRating ? i18n("Your rating") : i18n("Rate this")}</p>
            <div
              aria-label={i18n("Choose a rating from 1 to 5 stars")}
              className="flex gap-0.5 sm:gap-1"
              onMouseLeave={() => setHoveredRating(null)}
              role="group"
            >
              {STAR_VALUES.map((value) => (
                <button
                  aria-label={i18n("Rate {count} out of 5", { count: value })}
                  aria-pressed={summary.myRating === value}
                  className="text-neutral focus-visible:outline-primary inline-flex size-11 items-center justify-center rounded transition-colors hover:text-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait"
                  disabled={isSaving}
                  key={value}
                  onBlur={() => setHoveredRating(null)}
                  onClick={() => void saveRating(value)}
                  onFocus={() => setHoveredRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  type="button"
                >
                  <Star
                    aria-hidden="true"
                    className={value <= displayedRating ? "fill-amber-400 text-amber-400" : undefined}
                    size={26}
                  />
                </button>
              ))}
            </div>
            {summary.myRating && !summary.hasReview && (
              <button
                className="text-primary hover:text-primary/80 focus-visible:outline-primary rounded text-xs font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                disabled={isSaving}
                onClick={() => void removeRating()}
                type="button"
              >
                {i18n("Remove your rating")}
              </button>
            )}
            {summary.myRating && summary.hasReview && onOpenReviews && (
              <button
                className="text-primary hover:text-primary/80 focus-visible:outline-primary rounded text-xs font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={onOpenReviews}
                type="button"
              >
                {i18n("Manage your rating in your review")}
              </button>
            )}
          </div>
        )}

        {!isLoadingProfile && profile && isActiveUser && !summary.canRate && !summary.myRating && (
          <p className="text-neutral text-sm">
            {type === "event"
              ? i18n("Ratings are available after an event is completed")
              : i18n("You cannot rate content you manage")}
          </p>
        )}
      </div>
    </SectionCard>
  );
};
