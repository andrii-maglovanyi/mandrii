import clsx from "clsx";

import { useI18n } from "~/i18n/useI18n";
import { getColorHex, isLightColor } from "~/lib/constants/colors";

export interface ColorSelectorProps {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; stock?: number; value: string }>;
  value?: string;
}

/**
 * A color selector component that displays color swatches.
 * Shows actual color bubbles with the color name displayed in the label.
 */
export const ColorSelector = ({ disabled, label, onChange, options, value }: ColorSelectorProps) => {
  const i18n = useI18n();
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-on-surface">
        {label}
        {selectedLabel && <span className="text-neutral/70">: {selectedLabel}</span>}
      </label>
      <div className="mt-1 flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          const isOutOfStock = option.stock === 0;
          const isDisabled = disabled || isOutOfStock;
          const colorHex = getColorHex(option.value);

          return (
            <button
              aria-label={`${option.label}${isOutOfStock ? ` (${i18n("out of stock")})` : ""}`}
              className={clsx(
                `
                  group relative flex h-10 w-10 items-center justify-center
                  rounded-full transition-all
                `,
                isSelected && `
                  ring-2 ring-primary ring-offset-2 ring-offset-surface
                `,
                isDisabled && "cursor-not-allowed opacity-40",
                !isDisabled && !isSelected && `
                  hover:ring-2 hover:ring-neutral/30 hover:ring-offset-2
                `,
              )}
              disabled={isDisabled}
              key={option.value}
              onClick={() => onChange(option.value)}
              title={option.label}
              type="button"
            >
              <span
                className={clsx(
                  "h-8 w-8 rounded-full border",
                  isLightColor(colorHex) ? "border-neutral/30" : `
                    border-transparent
                  `,
                )}
                style={{ backgroundColor: colorHex }}
              />
              {isOutOfStock && <span className={`
                absolute h-px w-10 rotate-45 rounded-full bg-danger
              `} />}
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
              <p className={`
                text-xs text-orange-600
                dark:text-orange-400
              `}>
                {i18n("Only {count} left", { count: stock })}
              </p>
            );
          }
          return null;
        })()}
    </div>
  );
};
