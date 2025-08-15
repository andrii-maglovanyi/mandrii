"use client";

import { format } from "date-fns";
import React, { useEffect, useState } from "react";

import { Button, Separator } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { compileMDX } from "~/lib/mdx/compiler";
import { ContentData } from "~/lib/mdx/reader";

interface ContentViewerProps {
  data: ContentData | null;
  id: string;
  type: string;
}

export const ContentViewer = ({ data, id, type }: ContentViewerProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showError, showSuccess } = useNotifications();

  const { content, meta } = data || {
    content: "",
    meta: { title: "" },
  };

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

  useEffect(() => {
    const loadMDX = async () => {
      try {
        const MDXContent = await compileMDX(content);

        setMdxModule(MDXContent);
      } catch (error) {
        showError(error instanceof Error ? error.message : "Failed to render content");
      }
    };

    loadMDX();
  }, [content, showError]);

  const [mdxModule, setMdxModule] = useState<{
    default: React.ComponentType;
  }>();

  const renderContent = () => {
    if (!mdxModule) {
      return <div>Loading content...</div>;
    }

    const Content = mdxModule.default;

    return (
      <article className={`
        prose max-w-none
        dark:prose-invert
      `}>
        <Content />
      </article>
    );
  };

  return (
    <div className="m-auto mx-auto max-w-5xl p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button
            busy={isGenerating}
            color="primary"
            disabled={isGenerating || !content.trim()}
            onClick={handleGeneratePDF}
            size="sm"
            variant="ghost"
          >
            {isGenerating ? "Generating PDF" : "Download as PDF"}
          </Button>
        </div>
        <Separator className="mb-12" />

        {renderContent()}
      </div>
    </div>
  );
};
