"use client";

import { useMemo } from "react";

import { Checkbox, getContentStatusPresentation, Input, Select, type ContentStatus } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

type ContentDirectoryFiltersProps<TStatus extends ContentStatus> = {
  onSearchChange: (value: string) => void;
  onOwnedOnlyChange?: (ownedOnly: boolean) => void;
  onStatusChange: (status: TStatus | undefined) => void;
  ownedOnly?: boolean;
  ownedOnlyLabel?: string;
  searchPlaceholder: string;
  searchQuery: string;
  status: TStatus | undefined;
  statuses: TStatus[];
};

/** Shared search and status controls for user-managed venues and events. */
export const ContentDirectoryFilters = <TStatus extends ContentStatus>({
  onSearchChange,
  onOwnedOnlyChange,
  onStatusChange,
  ownedOnly = false,
  ownedOnlyLabel,
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
    <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
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
      {onOwnedOnlyChange && ownedOnlyLabel && (
        <div className="flex items-end pb-1">
          <Checkbox
            checked={ownedOnly}
            label={ownedOnlyLabel}
            onChange={(event) => onOwnedOnlyChange(event.target.checked)}
          />
        </div>
      )}
    </div>
  );
};
