import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export { MetadataRow } from "~/components/ui/MetadataRow/MetadataRow";

interface MetadataSectionProps {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}

export const MetadataSection = ({ children, icon: Icon, title }: MetadataSectionProps) => (
  <div className={`border-neutral/10 border-t pt-4 first:border-t-0 first:pt-0`}>
    <h3 className={`text-on-surface mb-3 flex items-center gap-2 text-lg font-semibold`}>
      <Icon size={20} />
      {title}
    </h3>
    {children}
  </div>
);

interface MetadataChipsProps {
  icon?: LucideIcon;
  items: string[];
}

export const MetadataChips = ({ icon: Icon, items }: MetadataChipsProps) => {
  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          className={`bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium`}
          key={item}
        >
          {Icon && <Icon size={14} />}
          {item}
        </span>
      ))}
    </div>
  );
};
