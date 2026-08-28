"use client";

import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button, SectionCard } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";

type ModerationReview = {
  body: string;
  created_at: string;
  id: string;
  open_report_count: number;
  report_reasons: string[];
  status: "HIDDEN" | "PUBLISHED";
  target_name: string;
};

export const AdminReviewModerationQueue = () => {
  const i18n = useI18n();
  const { showError } = useNotifications();
  const [reviews, setReviews] = useState<ModerationReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reportedComments, setReportedComments] = useState<
    Array<{ body: string; comment_id: string; report_count: number; report_reasons: string[]; target_name: string }>
  >([]);
  const [blockedTerms, setBlockedTerms] = useState<Array<{ term: string }>>([]);
  const [term, setTerm] = useState("");
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/reviews", { cache: "no-store" });
      const result = (await response.json()) as { error?: string; reviews?: ModerationReview[] };
      if (!response.ok) throw new Error(result.error ?? "Unable to load review moderation");
      setReviews(result.reviews ?? []);
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to load review moderation"));
    } finally {
      setIsLoading(false);
    }
  }, [i18n, showError]);
  useEffect(() => void load(), [load]);

  const loadDiscussionModeration = useCallback(async () => {
    try {
      const [commentsResponse, termsResponse] = await Promise.all([
        fetch("/api/admin/update-comments"),
        fetch("/api/admin/blocked-comment-terms"),
      ]);
      if (!commentsResponse.ok || !termsResponse.ok) throw new Error("Unable to load discussion moderation");
      setReportedComments(((await commentsResponse.json()) as { comments: typeof reportedComments }).comments);
      setBlockedTerms(((await termsResponse.json()) as { terms: typeof blockedTerms }).terms);
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to load discussion moderation"));
    }
  }, [i18n, showError]);
  useEffect(() => void loadDiscussionModeration(), [loadDiscussionModeration]);

  const moderateComment = async (commentId: string, action: "REMOVE" | "RESOLVE") => {
    try {
      const response = await fetch(`/api/admin/update-comments/${commentId}`, {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      if (!response.ok) throw new Error("Unable to moderate comment");
      await loadDiscussionModeration();
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to moderate comment"));
    }
  };

  const saveTerm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    try {
      const response = await fetch("/api/admin/blocked-comment-terms", {
        body: JSON.stringify({ term: term.trim() }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) throw new Error("Unable to block term");
      setTerm("");
      await loadDiscussionModeration();
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to block term"));
    }
  };

  const update = async (
    review: ModerationReview,
    status: "HIDDEN" | "PUBLISHED",
    resolveReports = review.open_report_count > 0,
  ) => {
    setUpdatingId(review.id);
    try {
      const response = await fetch(`/api/reviews/${review.id}/moderation`, {
        body: JSON.stringify({ resolveReports, status }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? i18n("Unable to update this review"));
      await load();
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to update this review"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{i18n("Review moderation")}</h1>
          <p className="text-neutral mt-1">{i18n("Open reports and hidden reviews")}</p>
        </div>
        <Button busy={isLoading} onClick={() => void load()} size="sm" variant="outlined">
          <RefreshCw size={16} />
          {i18n("Refresh")}
        </Button>
      </div>
      {!isLoading && reviews.length === 0 && (
        <SectionCard>{i18n("There are no reported or hidden reviews.")}</SectionCard>
      )}
      {reviews.map((review) => (
        <SectionCard key={review.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{review.target_name}</p>
              <p className="text-neutral text-sm">
                {review.status === "HIDDEN" ? i18n("Hidden") : i18n("Reported")}
                {review.open_report_count > 0 &&
                  ` · ${i18n("{count} open reports", { count: review.open_report_count })}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {review.open_report_count > 0 && (
                <Button
                  busy={updatingId === review.id}
                  onClick={() => void update(review, review.status, true)}
                  size="sm"
                  variant="outlined"
                >
                  {i18n("Resolve reports")}
                </Button>
              )}
              <Button
                busy={updatingId === review.id}
                color={review.status === "HIDDEN" ? "primary" : "danger"}
                onClick={() => void update(review, review.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN")}
                size="sm"
                variant="outlined"
              >
                {review.status === "HIDDEN" ? <Eye size={16} /> : <EyeOff size={16} />}
                {review.status === "HIDDEN" ? i18n("Publish") : i18n("Hide and resolve")}
              </Button>
            </div>
          </div>
          <p className="mt-4 whitespace-pre-wrap">{review.body}</p>
          {review.report_reasons.length > 0 && (
            <ul className="text-neutral mt-4 list-disc space-y-1 pl-5 text-sm">
              {review.report_reasons.map((reason, index) => (
                <li key={`${review.id}-${index}`}>{reason}</li>
              ))}
            </ul>
          )}
        </SectionCard>
      ))}
      <section className="space-y-4 pt-6">
        <h2 className="text-2xl font-semibold">{i18n("Comment moderation")}</h2>
        {reportedComments.length === 0 ? (
          <SectionCard>{i18n("There are no reported comments.")}</SectionCard>
        ) : (
          reportedComments.map((comment) => (
            <SectionCard key={comment.comment_id}>
              <p className="font-semibold">
                {comment.target_name} · {i18n("{count} reports", { count: comment.report_count })}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{comment.body}</p>
              <ul className="text-neutral mt-2 list-disc pl-5 text-sm">
                {comment.report_reasons.map((reason, index) => (
                  <li key={`${comment.comment_id}-${index}`}>{reason}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => void moderateComment(comment.comment_id, "RESOLVE")}
                  size="sm"
                  variant="outlined"
                >
                  {i18n("Resolve reports")}
                </Button>
                <Button
                  color="danger"
                  onClick={() => void moderateComment(comment.comment_id, "REMOVE")}
                  size="sm"
                  variant="outlined"
                >
                  {i18n("Remove comment")}
                </Button>
              </div>
            </SectionCard>
          ))
        )}
        <SectionCard>
          <h3 className="font-semibold">{i18n("Blocked comment terms")}</h3>
          <form className="mt-3 flex gap-2" onSubmit={(event) => void saveTerm(event)}>
            <input
              aria-label={i18n("Add blocked term")}
              className="border-primary/20 min-w-0 flex-1 rounded border px-3 py-2"
              onChange={(event) => setTerm(event.target.value)}
              placeholder={i18n("Add blocked term")}
              value={term}
            />
            <Button type="submit">{i18n("Add")}</Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {blockedTerms.map(({ term: blockedTerm }) => (
              <button
                className="bg-surface-tint rounded-full px-3 py-1 text-sm"
                key={blockedTerm}
                onClick={() =>
                  void (async () => {
                    try {
                      const response = await fetch("/api/admin/blocked-comment-terms", {
                        body: JSON.stringify({ term: blockedTerm }),
                        headers: { "Content-Type": "application/json" },
                        method: "DELETE",
                      });
                      if (!response.ok) throw new Error("Unable to remove blocked term");
                      await loadDiscussionModeration();
                    } catch (error) {
                      showError(error instanceof Error ? error.message : i18n("Unable to remove blocked term"));
                    }
                  })()
                }
                type="button"
              >
                {blockedTerm} ×
              </button>
            ))}
          </div>
        </SectionCard>
      </section>
    </main>
  );
};
