"use client";

import { useI18n } from "~/i18n/useI18n";
import { HelpCircle, ChevronDown, ChevronUp, Flag } from "lucide-react";

type ControlsBarProps = {
  showHints: boolean;
  onToggleHints: () => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  onFeedback?: () => void;
};

/** Pill button strip: hints toggle, advanced toggle, optional feedback button */
export function ControlsBar({
  showHints,
  onToggleHints,
  showAdvanced,
  onToggleAdvanced,
  onFeedback,
}: ControlsBarProps) {
  const i18n = useI18n();

  const pillClass = (active: boolean) =>
    [
      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border-primary text-primary bg-primary/10 hover:bg-primary/20"
        : "border-neutral/30 text-neutral hover:border-neutral/60",
    ].join(" ");

  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2 md:justify-end">
      <button type="button" onClick={onToggleHints} className={pillClass(showHints)} aria-pressed={showHints}>
        <HelpCircle size={14} strokeWidth={2.5} />
        {showHints ? i18n("Hide hints") : i18n("Show hints")}
      </button>

      <button type="button" onClick={onToggleAdvanced} className={pillClass(showAdvanced)} aria-pressed={showAdvanced}>
        {showAdvanced ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
        {showAdvanced ? i18n("Fewer options") : i18n("More options")}
      </button>

      {onFeedback && (
        <button type="button" onClick={onFeedback} className={pillClass(false)}>
          <Flag size={14} strokeWidth={2.5} />
          {i18n("Found an issue?")}
        </button>
      )}
    </div>
  );
}
