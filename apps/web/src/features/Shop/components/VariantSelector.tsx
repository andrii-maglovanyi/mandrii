import clsx from "clsx";

import { useI18n } from "~/i18n/useI18n";

export interface VariantSelectorProps {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; stock?: number; value: string }>;
  value?: string;
}

/**
 * A selector component for product variants (age group, gender, size).
 * Displays options as pill-shaped buttons with stock indicators.
 */
export const VariantSelector = ({ disabled, label, onChange, options, value }: VariantSelectorProps) => {
  const i18n = useI18n();

  return (
    <div className="space-y-3">
      <label className="text-on-surface text-sm font-medium">{label}</label>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          const isOutOfStock = option.stock === 0;
          const isDisabled = disabled || isOutOfStock;

          return (
            <button
              className={clsx(
                `rounded-xl border px-3.5 py-2 text-sm font-medium transition-all`,
                isSelected
                  ? "border-primary bg-primary text-surface"
                  : `border-neutral/20 hover:border-neutral/40 active:bg-neutral/10 bg-transparent`,
                isDisabled && "cursor-not-allowed opacity-40",
                isOutOfStock && "line-through",
              )}
              disabled={isDisabled}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {/* Show low stock warning only for selected option */}
      {value &&
        options.find((o) => o.value === value)?.stock !== undefined &&
        (() => {
          const stock = options.find((o) => o.value === value)?.stock ?? 0;
          if (stock > 0 && stock <= 5) {
            return (
              <p className={`text-xs text-orange-600 dark:text-orange-400`}>
                {i18n("Only {count} left", { count: stock })}
              </p>
            );
          }
          return null;
        })()}
    </div>
  );
};
