"use client";

import { useState } from "react";

import { Button, Textarea } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useI18n } from "~/i18n/useI18n";

const reasons = ["Spam or advertising", "Harassment or hate", "Not a genuine experience", "Other"];

export const ReviewReportForm = ({
  onError,
  onSaved,
  reviewId,
}: {
  onError: (message: string) => void;
  onSaved: () => void;
  reviewId: string;
}) => {
  const i18n = useI18n();
  const { closeDialog } = useDialog();
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        body: JSON.stringify({ reason: details.trim() ? `${reason}: ${details.trim()}` : reason }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? i18n("Unable to report this review"));
      onSaved();
      closeDialog();
    } catch (error) {
      onError(error instanceof Error ? error.message : i18n("Unable to report this review"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={(event) => void submit(event)}>
      <div className="flex flex-wrap gap-2">
        {reasons.map((option) => (
          <button
            aria-pressed={reason === option}
            className={`focus-visible:outline-primary min-h-11 rounded-full border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${reason === option ? "border-primary bg-primary/10 text-primary" : "border-on-surface/15"}`}
            key={option}
            onClick={() => setReason(option)}
            type="button"
          >
            {i18n(option)}
          </button>
        ))}
      </div>
      <Textarea
        label={i18n("Details (optional)")}
        maxChars={400}
        onChange={(event) => setDetails(event.target.value)}
        placeholder={i18n("Tell us what is wrong with this review")}
        value={details}
      />
      <div className="flex justify-end">
        <Button busy={isSaving} color="danger" type="submit">
          {i18n("Submit report")}
        </Button>
      </div>
    </form>
  );
};
