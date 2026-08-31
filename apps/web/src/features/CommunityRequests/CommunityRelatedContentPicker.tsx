"use client";

import { useEffect, useState } from "react";

import { Badge, Button, Input } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { CommunityRelatedContent } from "~/lib/community-requests/types";

type CommunityRelatedContentPickerProps = {
  onChange: (value: CommunityRelatedContent | null) => void;
  value: CommunityRelatedContent | null;
};

export function CommunityRelatedContentPicker({ onChange, value }: CommunityRelatedContentPickerProps) {
  const i18n = useI18n();
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<CommunityRelatedContent[]>([]);

  useEffect(() => setQuery(value?.name ?? ""), [value]);

  useEffect(() => {
    if (value || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void fetch(`/api/community-requests/related-content?q=${encodeURIComponent(query.trim())}`, {
        signal: controller.signal,
      })
        .then(async (response) => (response.ok ? ((await response.json()) as CommunityRelatedContent[]) : []))
        .then(setResults)
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setResults([]);
        });
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, value]);

  return (
    <div>
      <Input
        label={i18n("Related venue or event (optional)")}
        onChange={(event) => {
          onChange(null);
          setQuery(event.target.value);
        }}
        onSelectSuggestion={(id) => {
          const selected = results.find((result) => result.id === id);
          if (!selected) return;
          onChange(selected);
          setResults([]);
        }}
        placeholder={i18n("Search if this post is about a venue or event")}
        suggestions={results.map((result) => ({
          label: result.name,
          meta: (
            <Badge size="sm" variant={result.type === "VENUE" ? "neutral" : "info"}>
              {i18n(result.type === "VENUE" ? "Venue" : "Event")}
            </Badge>
          ),
          value: result.id,
        }))}
        type="search"
        value={query}
      />
      {value && (
        <div className="mt-1 flex justify-end">
          <Button
            color="neutral"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            {i18n("Clear related venue or event")}
          </Button>
        </div>
      )}
    </div>
  );
}
