"use client";

import { useMemo } from "react";

import { getContentStatusPresentation, Input, Select, type ContentStatus } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

type ContentDirectoryFiltersProps<TStatus extends ContentStatus> = {
  onSearchChange: (value: string) => void;
  onStatusChange: (status: TStatus | undefined) => void;
  searchPlaceholder: string;
  searchQuery: string;
  status: TStatus | undefined;
  statuses: TStatus[];
};

/** Shared search and status controls for user-managed venues and events. */
export const ContentDirectoryFilters = <TStatus extends ContentStatus>({
  onSearchChange,
  onStatusChange,
  searchPlaceholder,
  searchQuery,
  status,
  statuses,
}: ContentDirectoryFiltersProps<TStatus>) => {
  const i18n = useI18n();
  const statusOptions = useMemo(
    () => [
      { label: i18n("All statuses"), value: "" as "" | TStatus },
      ...statuses.map((value) => ({
        label: getContentStatusPresentation(value, i18n).label,
        value,
      })),
    ],
    [i18n, statuses],
  );

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
      <Input
        label={i18n("Search")}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        type="search"
        value={searchQuery}
      />
      <Select
        label={i18n("Status")}
        onChange={(event) => {
          const value = event.target.value as "" | TStatus;
          onStatusChange(value || undefined);
        }}
        options={statusOptions}
        value={status ?? ""}
      />
    </div>
  );
};
