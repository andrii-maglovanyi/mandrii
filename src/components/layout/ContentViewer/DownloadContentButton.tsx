"use client";

import { format } from "date-fns";
import { Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { ActionButton } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { ContentData } from "~/lib/mdx/reader";

interface DownloadContentButtonProps {
  id: string;
  meta: ContentData["meta"];
  type: string;
}

export const DownloadContentButton = ({ id, meta, type }: DownloadContentButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showError, showSuccess } = useNotifications();
  const { status } = useSession();
  const i18n = useI18n();

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      const filename = `${meta.title}_${format(new Date(), "yyyy-MM-dd")}.pdf`;

      const response = await fetch("/api/pdf", {
        body: JSON.stringify({
          filename,
          id,
          title: meta.title,
          type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      showError(error instanceof Error ? error.message : "An error occurred while generating PDF");
    } finally {
      showSuccess("PDF generated successfully");
      setIsGenerating(false);
    }
  };

  if (status !== "authenticated") {
    return null;
  }

  return (
    <ActionButton
      aria-label={isGenerating ? i18n("Generating PDF...") : i18n("Download as PDF")}
      busy={isGenerating}
      color="primary"
      disabled={isGenerating}
      icon={<Download />}
      onClick={handleGeneratePDF}
      size="sm"
      variant="ghost"
    />
  );
};
