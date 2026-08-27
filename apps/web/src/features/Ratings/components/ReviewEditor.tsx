"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { Button, Textarea } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { RatingTargetType } from "~/lib/ratings/types";
import { getReviewQuestions } from "~/lib/reviews/questions";
import { ContentReview } from "~/lib/reviews/types";

type ReviewEditorProps = {
  context: string;
  initialReview: ContentReview | null;
  onError: (message: string) => void;
  onSaved: () => void;
  targetId: string;
  type: RatingTargetType;
};

const StarPicker = ({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) => {
  const i18n = useI18n();

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <p className="text-sm font-medium">{i18n(label)}</p>
      <div aria-label={i18n("Rate {label}", { label: i18n(label) })} className="flex gap-0.5 self-start" role="group">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            aria-label={i18n("Rate {count} out of 5", { count: star })}
            aria-pressed={value === star}
            className="text-neutral focus-visible:outline-primary inline-flex size-11 items-center justify-center rounded transition-colors hover:text-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2"
            key={star}
            onClick={() => onChange(star)}
            type="button"
          >
            <Star aria-hidden className={star <= value ? "fill-amber-400 text-amber-400" : undefined} size={21} />
          </button>
        ))}
      </div>
    </div>
  );
};

export const ReviewEditor = ({ context, initialReview, onError, onSaved, targetId, type }: ReviewEditorProps) => {
  const i18n = useI18n();
  const { closeDialog } = useDialog();
  const questions = getReviewQuestions(type, context, initialReview?.questionSet);
  const [body, setBody] = useState(initialReview?.body ?? "");
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [aspectRatings, setAspectRatings] = useState<Record<string, number>>(
    Object.fromEntries(questions.map((question) => [question.key, initialReview?.aspectRatings[question.key] ?? 0])),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showResponseWarning, setShowResponseWarning] = useState(false);
  const isComplete =
    rating > 0 &&
    body.trim().length >= 10 &&
    body.length <= 1500 &&
    questions.every((question) => aspectRatings[question.key] > 0);
  const hasChanges =
    Boolean(initialReview) &&
    (body.trim() !== initialReview?.body ||
      rating !== initialReview?.rating ||
      questions.some((question) => aspectRatings[question.key] !== initialReview?.aspectRatings[question.key]));
  const requiresResponseWarning = Boolean(initialReview?.ownerResponse && hasChanges);

  const save = async (responseRemovalConfirmed = false) => {
    if (!isComplete) return;
    if (requiresResponseWarning && !responseRemovalConfirmed) {
      setShowResponseWarning(true);
      return;
    }
    setIsSaving(true);

    try {
      const response = await fetch("/api/reviews", {
        body: JSON.stringify({ aspectRatings, body, rating, targetId, type }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to save review");

      sendToMixpanel(initialReview ? "Updated Content Review" : "Published Content Review", {
        rating,
        targetId,
        targetType: type,
      });
      onSaved();
      closeDialog();
    } catch (error) {
      onError(error instanceof Error ? error.message : i18n("Unable to save review"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-neutral text-sm">
        {i18n("Share what was useful for the community. Your review is public and can be edited later.")}
      </p>
      <StarPicker label={i18n("Overall rating")} onChange={setRating} value={rating} />
      <div className="border-on-surface/10 space-y-2 border-y py-4">
        {questions.map((question) => (
          <StarPicker
            key={question.key}
            label={question.label}
            onChange={(value) => setAspectRatings((current) => ({ ...current, [question.key]: value }))}
            value={aspectRatings[question.key]}
          />
        ))}
      </div>
      <Textarea
        label={i18n("Your review")}
        maxChars={1500}
        onChange={(event) => setBody(event.target.value)}
        placeholder={i18n("What should other community members know?")}
        rows={6}
        value={body}
      />
      {showResponseWarning && requiresResponseWarning && (
        <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4" role="alert">
          <p className="text-sm">
            {i18n(
              "Editing your review will remove the owner's response, because it may no longer reflect your updated review.",
            )}
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              disabled={isSaving}
              onClick={() => setShowResponseWarning(false)}
              variant="outlined"
            >
              {i18n("Back")}
            </Button>
            <Button
              busy={isSaving}
              className="w-full sm:w-auto"
              color="primary"
              onClick={() => void save(true)}
              variant="filled"
            >
              {i18n("Update review")}
            </Button>
          </div>
        </div>
      )}
      {(!showResponseWarning || !requiresResponseWarning) && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" disabled={isSaving} onClick={closeDialog} variant="outlined">
            {i18n("Cancel")}
          </Button>
          <Button
            busy={isSaving}
            className="w-full sm:w-auto"
            color="primary"
            disabled={!isComplete || (Boolean(initialReview) && !hasChanges)}
            onClick={() => void save()}
            variant="filled"
          >
            {initialReview ? i18n("Update review") : i18n("Publish review")}
          </Button>
        </div>
      )}
    </div>
  );
};
