import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface MetadataRowProps {
  /** Optional icon to display before the label */
  icon?: LucideIcon;
  /** The label text */
  label: string;
  /** Whether to show decorative dots between label and value */
  showDots?: boolean;
  /** The value to display */
  value: ReactNode;
}

/**
 * A row component for displaying label-value pairs with optional decorative dots.
 *
 * @example
 * <MetadataRow label="Category" value="Clothing" showDots />
 * <MetadataRow icon={Users} label="Max guests" value={10} showDots />
 */
export const MetadataRow = ({ icon: Icon, label, showDots = false, value }: MetadataRowProps) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <div className="flex items-center gap-2 text-neutral">
        {Icon && <Icon size={16} />}
        <span>{label}</span>
      </div>
      {showDots && (
        <div
          className="mt-auto mb-1 h-px flex-1"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 0.5px, transparent 0.5px)",
            backgroundPosition: "bottom",
            backgroundRepeat: "repeat-x",
            backgroundSize: "6px 1px",
            opacity: 0.3,
          }}
        />
      )}
      <div className="font-medium text-on-surface">{value}</div>
    </div>
  );
};
