"use client";

import { useState } from "react";

import { Button, Textarea } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { ContentReviewResponse } from "~/lib/reviews/types";

type OwnerResponseEditorProps = {
  initialResponse: ContentReviewResponse | null;
  onError: (message: string) => void;
  onSaved: () => void;
  reviewId: string;
};

export const OwnerResponseEditor = ({ initialResponse, onError, onSaved, reviewId }: OwnerResponseEditorProps) => {
  const i18n = useI18n();
  const { closeDialog } = useDialog();
  const [body, setBody] = useState(initialResponse?.body ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (!body.trim()) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/response`, {
        body: JSON.stringify({ body }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to save response");

      sendToMixpanel(initialResponse ? "Updated Content Review Response" : "Published Content Review Response", {
        reviewId,
      });
      onSaved();
      closeDialog();
    } catch (error) {
      onError(error instanceof Error ? error.message : i18n("Unable to save response"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-neutral text-sm">
        {i18n("Your response is public and appears directly below this community review.")}
      </p>
      <Textarea
        label={i18n("Your public response")}
        maxChars={1500}
        onChange={(event) => setBody(event.target.value)}
        placeholder={i18n("Thank the reviewer or add useful context for the community")}
        rows={6}
        value={body}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button className="w-full sm:w-auto" disabled={isSaving} onClick={closeDialog} variant="outlined">
          {i18n("Cancel")}
        </Button>
        <Button
          busy={isSaving}
          className="w-full sm:w-auto"
          color="primary"
          disabled={!body.trim()}
          onClick={() => void save()}
          variant="filled"
        >
          {initialResponse ? i18n("Update response") : i18n("Publish response")}
        </Button>
      </div>
    </div>
  );
};
