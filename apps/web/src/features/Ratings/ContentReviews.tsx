"use client";

import { CalendarDays, Check, EyeOff, Flag, LogIn, Pencil, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Avatar, SignInForm } from "~/components/layout";
import { Button, SectionCard, Select } from "~/components/ui";
import { useAuth } from "~/contexts/AuthContext";
import { useDialog } from "~/contexts/DialogContext";
import { useNotifications } from "~/hooks/useNotifications";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { publishRatingRefresh, subscribeToRatingRefresh } from "~/lib/ratings/refresh";
import { RatingTargetType } from "~/lib/ratings/types";
import { getReviewQuestions } from "~/lib/reviews/questions";
import { ContentReview, ContentReviewsResponse, ReviewSort } from "~/lib/reviews/types";
import { User_Status_Enum } from "~/types";
import { OwnerResponseEditor } from "./components/OwnerResponseEditor";
import { ReviewReportForm } from "./components/ReviewReportForm";
import { ReviewEditor } from "./components/ReviewEditor";
import { ReviewStars } from "./components/ReviewStars";

type ContentReviewsProps = {
  context: string;
  targetId: string;
  type: RatingTargetType;
};

const emptyResponse: ContentReviewsResponse = {
  averageRating: 0,
  aspectAverages: {},
  canReview: false,
  canRespond: false,
  nextCursor: null,
  ownReview: null,
  ratingTotal: 0,
  reviews: [],
  total: 0,
};

export const ContentReviews = ({ context, targetId, type }: ContentReviewsProps) => {
  const i18n = useI18n();
  const { profile, isLoading: isLoadingProfile } = useAuth();
  const { openConfirmDialog, openCustomDialog } = useDialog();
  const { showError, showSuccess } = useNotifications();
  const [data, setData] = useState<ContentReviewsResponse>(emptyResponse);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [votingReviewId, setVotingReviewId] = useState<string | null>(null);
  const [sort, setSort] = useState<ReviewSort>("newest");

  const load = useCallback(
    async (cursor?: string, append = false, signal?: AbortSignal) => {
      const params = new URLSearchParams({ sort, targetId, type });
      if (cursor) params.set("cursor", cursor);
      const response = await fetch(`/api/reviews?${params}`, { signal });
      const next = (await response.json()) as ContentReviewsResponse & { error?: string };
      if (!response.ok) throw new Error(next.error ?? "Unable to load reviews");

      setData((current) =>
        append
          ? { ...next, ownReview: next.ownReview ?? current.ownReview, reviews: [...current.reviews, ...next.reviews] }
          : next,
      );
    },
    [sort, targetId, type],
  );

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    void load(undefined, false, controller.signal)
      .catch((error) => {
        if (!controller.signal.aborted)
          showError(error instanceof Error ? error.message : i18n("Unable to load reviews"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [i18n, load, showError]);

  useEffect(() => subscribeToRatingRefresh(type, targetId, () => void load()), [load, targetId, type]);

  const openEditor = () => {
    void openCustomDialog({
      children: (
        <ReviewEditor
          context={context}
          initialReview={data.ownReview}
          onError={showError}
          onSaved={() => {
            publishRatingRefresh(type, targetId);
          }}
          targetId={targetId}
          type={type}
        />
      ),
      title: data.ownReview ? i18n("Edit your review") : i18n("Write a review"),
    });
  };

  const openResponseEditor = (review: ContentReview) => {
    void openCustomDialog({
      children: (
        <OwnerResponseEditor
          initialResponse={review.ownerResponse}
          onError={showError}
          onSaved={() => void load()}
          reviewId={review.id}
        />
      ),
      title: review.ownerResponse ? i18n("Edit your response") : i18n("Respond to review"),
    });
  };

  const openReportForm = (reviewId: string) => {
    void openCustomDialog({
      children: (
        <ReviewReportForm
          onError={showError}
          onSaved={() => {
            void load();
            showSuccess(i18n("Report submitted. I'm reviewing it."));
          }}
          reviewId={reviewId}
        />
      ),
      title: i18n("Report review"),
    });
  };

  const removeReview = async () => {
    const confirmed = await openConfirmDialog({
      message: i18n("Your written review will be removed, but your star rating will remain."),
      title: i18n("Remove review?"),
    });
    if (!confirmed) return;

    try {
      const response = await fetch("/api/reviews", {
        body: JSON.stringify({ targetId, type }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to remove review");
      sendToMixpanel("Removed Content Review", { targetId, targetType: type });
      publishRatingRefresh(type, targetId);
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to remove review"));
    }
  };

  const removeResponse = async (reviewId: string) => {
    const confirmed = await openConfirmDialog({
      message: i18n("Your public response will be removed from this review."),
      title: i18n("Remove response?"),
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}/response`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to remove response");
      await load();
      sendToMixpanel("Removed Content Review Response", { reviewId });
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to remove response"));
    }
  };

  const hideReview = async (reviewId: string) => {
    const confirmed = await openConfirmDialog({
      message: i18n("This removes the written review from public view. Its rating remains recorded."),
      title: i18n("Hide review?"),
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}/moderation`, {
        body: JSON.stringify({ status: "HIDDEN" }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to hide review");
      await load();
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to hide review"));
    }
  };

  const toggleVote = async (reviewId: string, vote: "HELPFUL" | "NOT_HELPFUL") => {
    setVotingReviewId(reviewId);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        body: JSON.stringify({ vote }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { active?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to update review feedback");
      await load();
      sendToMixpanel("Voted on Content Review", { active: result.active, reviewId, vote });
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to update review feedback"));
    } finally {
      setVotingReviewId(null);
    }
  };

  const activeUser = profile?.status === User_Status_Enum.Active;
  const isAdmin = profile?.role === "admin";
  const reviewLabel = data.total === 1 ? i18n("1 review") : i18n("{count} reviews", { count: data.total });
  const ratingLabel = data.ratingTotal === 1 ? i18n("1 rating") : i18n("{count} ratings", { count: data.ratingTotal });

  const questions = getReviewQuestions(type, context);
  const hasCurrentAspectAverages = questions.some((question) => data.aspectAverages[question.key] !== undefined);

  return (
    <div aria-busy={isLoading} className="space-y-8 pb-4">
      <SectionCard className="overflow-hidden p-0">
        <div className="from-primary/10 via-surface-tint/50 to-secondary/10 bg-gradient-to-br px-5 py-7 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-end gap-4 sm:gap-5">
              <div
                aria-live="polite"
                className="text-primary text-6xl leading-none font-semibold tracking-tight tabular-nums sm:text-7xl"
              >
                {isLoading ? "-" : data.averageRating.toFixed(1)}
              </div>
              <div className="min-w-0 pb-1.5">
                <ReviewStars
                  label={i18n("{count} out of 5", { count: data.averageRating.toFixed(1) })}
                  rating={Math.round(data.averageRating)}
                  size={24}
                />
                <p className="text-neutral mt-2 text-base">{isLoading ? i18n("Loading reviews…") : ratingLabel}</p>
              </div>
            </div>

            {!isLoadingProfile && !profile && (
              <Button
                className="w-full gap-2 sm:w-auto"
                onClick={() => openCustomDialog({ children: <SignInForm /> })}
                variant="outlined"
              >
                <LogIn size={18} />
                {i18n("Sign in to review")}
              </Button>
            )}
            {!isLoadingProfile && activeUser && data.canReview && (
              <Button className="w-full gap-2 sm:w-auto" color="primary" onClick={openEditor} variant="filled">
                <Pencil size={18} />
                {data.ownReview ? i18n("Edit your review") : i18n("Write a review")}
              </Button>
            )}
          </div>
          <p className="text-neutral mt-6 max-w-2xl text-base leading-7 sm:text-lg">
            {i18n("Ratings and first-hand reviews help people decide where to go and what to expect.")}
          </p>
          {!isLoadingProfile && activeUser && type === "event" && !data.canReview && !data.ownReview && (
            <p className="text-neutral mt-3 text-sm">{i18n("Reviews are available after this event is completed.")}</p>
          )}
        </div>

        {!isLoading && data.total > 0 && hasCurrentAspectAverages && (
          <dl className="border-on-surface/10 bg-on-surface/10 grid grid-cols-1 gap-px border-t sm:grid-cols-3 lg:grid-cols-4">
            {questions.map((question) => (
              <div className="bg-surface-tint/50 min-w-0 px-5 py-4 sm:px-6 sm:py-5" key={question.key}>
                <dt className="text-neutral truncate text-sm font-medium">{i18n(question.label)}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {data.aspectAverages[question.key]?.toFixed(1) ?? "-"}
                  <span className="text-neutral text-sm"> / 5</span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </SectionCard>

      <section aria-labelledby="review-list-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight" id="review-list-heading">
              {i18n("Community reviews")}
            </h2>
            {!isLoading && data.total > 0 && <p className="text-neutral mt-1 text-sm">{reviewLabel}</p>}
          </div>
          <Select
            aria-label={i18n("Sort reviews")}
            onChange={(event) => setSort(event.target.value as ReviewSort)}
            options={[
              { label: i18n("Newest"), value: "newest" },
              { label: i18n("Most helpful"), value: "helpful" },
            ]}
            value={sort}
          />
        </div>

        {!isLoading && data.reviews.length === 0 && (
          <div className="border-on-surface/10 mt-6 rounded-xl border border-dashed px-6 py-12 text-center">
            <p className="font-medium">{i18n("No written reviews yet")}</p>
            <p className="text-neutral mt-1 text-sm">
              {i18n("Be the first to share your experience with the community.")}
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {data.reviews.map((review) => {
            const questions = getReviewQuestions(type, context, review.questionSet);
            const isOwn = review.author.id === profile?.id;
            const date = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(
              new Date(review.createdAt),
            );

            return (
              <article className="border-on-surface/10 border-t py-8 md:[&:nth-child(-n+2)]:border-t-0" key={review.id}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <Avatar avatarSize={48} profile={review.author} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      {isOwn ? (
                        <span className="font-semibold">{i18n("You")}</span>
                      ) : (
                        <Link className="font-semibold" href={`/users/${review.author.id}`}>
                          {review.author.name}
                        </Link>
                      )}
                      <time className="text-neutral inline-flex items-center gap-1 text-sm" dateTime={review.createdAt}>
                        <CalendarDays aria-hidden size={15} />
                        {date}
                      </time>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <ReviewStars
                        label={i18n("{count} out of 5", { count: review.rating })}
                        rating={review.rating}
                        size={18}
                      />
                      {review.updatedAt !== review.createdAt && (
                        <span className="text-neutral text-xs">{i18n("Edited")}</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-base leading-7 whitespace-pre-wrap sm:text-lg sm:leading-8">{review.body}</p>
                <dl className="text-neutral mt-5 flex flex-wrap gap-2 text-sm">
                  {questions.map((question) => (
                    <div className="bg-surface-tint/70 inline-flex gap-1 rounded-full px-3 py-1" key={question.key}>
                      <dt>{i18n(question.label)}</dt>
                      <dd className="text-on-surface font-semibold tabular-nums">
                        {review.aspectRatings[question.key]}/5
                      </dd>
                    </div>
                  ))}
                </dl>
                {review.ownerResponse && (
                  <aside className="border-primary/20 bg-surface-tint/70 mt-5 rounded-xl border p-4">
                    <div className="flex items-start gap-3">
                      <Avatar avatarSize={32} profile={review.ownerResponse.author} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <span className="font-medium">{i18n("Response from the venue or event team")}</span>
                          <time className="text-neutral text-xs" dateTime={review.ownerResponse.createdAt}>
                            {new Intl.DateTimeFormat(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }).format(new Date(review.ownerResponse.createdAt))}
                            {review.ownerResponse.updatedAt !== review.ownerResponse.createdAt &&
                              ` · ${i18n("Edited")}`}
                          </time>
                        </div>
                        <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">{review.ownerResponse.body}</p>
                      </div>
                    </div>
                  </aside>
                )}
                {activeUser && data.canRespond && (
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <button
                      className="text-primary hover:text-primary/80 focus-visible:outline-primary inline-flex min-h-11 items-center gap-1 rounded text-xs font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                      onClick={() => openResponseEditor(review)}
                      type="button"
                    >
                      <Pencil aria-hidden size={14} />
                      {review.ownerResponse ? i18n("Edit response") : i18n("Respond publicly")}
                    </button>
                    {review.ownerResponse && (
                      <button
                        className="focus-visible:outline-primary inline-flex min-h-11 items-center gap-1 rounded text-xs font-medium text-red-600 hover:text-red-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                        onClick={() => void removeResponse(review.id)}
                        type="button"
                      >
                        <Trash2 aria-hidden size={14} />
                        {i18n("Remove response")}
                      </button>
                    )}
                  </div>
                )}
                <div className="mt-5 flex items-center gap-2">
                  {activeUser && review.canVote ? (
                    <>
                      <button
                        aria-label={i18n("This review was helpful")}
                        aria-pressed={review.myVote === "HELPFUL"}
                        className="border-on-surface/15 hover:bg-primary/10 focus-visible:outline-primary inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait"
                        disabled={votingReviewId === review.id}
                        onClick={() => void toggleVote(review.id, "HELPFUL")}
                        type="button"
                      >
                        <ThumbsUp
                          aria-hidden
                          className={review.myVote === "HELPFUL" ? "fill-primary text-primary" : undefined}
                          size={17}
                        />
                        {review.helpfulCount > 0 && <span className="tabular-nums">{review.helpfulCount}</span>}
                      </button>
                      <button
                        aria-label={i18n("This review was not helpful")}
                        aria-pressed={review.myVote === "NOT_HELPFUL"}
                        className="border-on-surface/15 hover:bg-primary/10 focus-visible:outline-primary inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait"
                        disabled={votingReviewId === review.id}
                        onClick={() => void toggleVote(review.id, "NOT_HELPFUL")}
                        type="button"
                      >
                        <ThumbsDown
                          aria-hidden
                          className={review.myVote === "NOT_HELPFUL" ? "fill-primary text-primary" : undefined}
                          size={17}
                        />
                        {review.notHelpfulCount > 0 && <span className="tabular-nums">{review.notHelpfulCount}</span>}
                      </button>
                    </>
                  ) : (
                    <>
                      {review.helpfulCount > 0 && (
                        <span className="text-neutral inline-flex items-center gap-1.5 text-sm">
                          <ThumbsUp aria-hidden size={16} />
                          <span className="tabular-nums">{review.helpfulCount}</span>
                        </span>
                      )}
                      {review.notHelpfulCount > 0 && (
                        <span className="text-neutral inline-flex items-center gap-1.5 text-sm">
                          <ThumbsDown aria-hidden size={16} />
                          <span className="tabular-nums">{review.notHelpfulCount}</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
                {activeUser &&
                  !isAdmin &&
                  !isOwn &&
                  (review.hasReported ? (
                    <p className="text-neutral mt-3 inline-flex min-h-11 items-center gap-1 text-xs font-medium">
                      <Check aria-hidden size={14} />
                      {i18n("You reported this review")}
                    </p>
                  ) : (
                    <button
                      className="text-neutral hover:text-on-surface focus-visible:outline-primary mt-3 inline-flex min-h-11 items-center gap-1 rounded text-xs font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                      onClick={() => openReportForm(review.id)}
                      type="button"
                    >
                      <Flag aria-hidden size={14} />
                      {i18n("Report review")}
                    </button>
                  ))}
                {(isOwn || isAdmin) && (
                  <div className="border-on-surface/10 mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                    {isOwn ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          className="text-primary hover:text-primary/80 focus-visible:outline-primary inline-flex min-h-11 items-center gap-1 rounded text-xs font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                          onClick={openEditor}
                          type="button"
                        >
                          <Pencil aria-hidden size={14} />
                          {i18n("Edit review")}
                        </button>
                        <button
                          className="focus-visible:outline-primary inline-flex min-h-11 items-center gap-1 rounded text-xs font-medium text-red-600 hover:text-red-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                          onClick={() => void removeReview()}
                          type="button"
                        >
                          <Trash2 aria-hidden size={14} />
                          {i18n("Remove review")}
                        </button>
                      </div>
                    ) : (
                      <span />
                    )}
                    {isAdmin && (
                      <button
                        className="focus-visible:outline-primary inline-flex min-h-11 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2"
                        onClick={() => void hideReview(review.id)}
                        type="button"
                      >
                        <EyeOff aria-hidden size={14} />
                        {i18n("Hide review")}
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {data.nextCursor && (
          <Button
            busy={isLoadingMore}
            disabled={isLoadingMore}
            onClick={() => {
              setIsLoadingMore(true);
              void load(data.nextCursor ?? undefined, true)
                .catch((error) => showError(error instanceof Error ? error.message : i18n("Unable to load reviews")))
                .finally(() => setIsLoadingMore(false));
            }}
            variant="outlined"
          >
            {i18n("Show more reviews")}
          </Button>
        )}
      </section>
    </div>
  );
};
