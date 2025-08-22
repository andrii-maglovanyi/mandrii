"use client";

import { format } from "date-fns";
import { Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useState } from "react";

import { ActionButton } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { ContentData } from "~/lib/mdx/reader";
import { sendToMixpanel } from "~/lib/mixpanel";
import { toSnakeCase } from "~/lib/utils/string";

interface DownloadContentButtonProps {
  id: string;
  meta: ContentData["meta"];
  type: string;
}

export const DownloadContentButton = ({ id, meta, type }: DownloadContentButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showError, showSuccess } = useNotifications();
  const { status } = useSession();
  const locale = useLocale();
  const i18n = useI18n();

  const handleGeneratePDF = async () => {
    sendToMixpanel("Clicked Generate PDF", { id, type });
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/pdf?locale=${locale}`, {
        body: JSON.stringify({
          id,
          type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${toSnakeCase(meta.title)}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess(i18n("PDF generated successfully"));
    } catch {
      showError(i18n("An error occurred while generating PDF"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ActionButton
      aria-label={isGenerating ? i18n("Generating PDF...") : i18n("Download as PDF")}
      busy={isGenerating}
      color="primary"
      disabled={isGenerating || status !== "authenticated"}
      icon={<Download />}
      onClick={handleGeneratePDF}
      size="sm"
      variant="ghost"
    />
  );
};
