"use client";

import { Package, Truck } from "lucide-react";

import { useI18n } from "~/i18n/useI18n";

export const UK_SHIPPING_COST_MINOR = 399; // £3.99
export const EU_SHIPPING_COST_MINOR = 899; // £8.99
export const ROW_SHIPPING_COST_MINOR = 1499; // £14.99
export const FREE_SHIPPING_THRESHOLD_MINOR = 7000; // £70.00

interface ShippingInfoProps {
  compact?: boolean;
}

export function ShippingInfo({ compact = false }: ShippingInfoProps) {
  const i18n = useI18n();
  const thresholdLabel = `£${(FREE_SHIPPING_THRESHOLD_MINOR / 100).toFixed(2)}`;

  if (compact) {
    return (
      <div className="text-neutral/60 space-y-1 text-sm">
        <p>{i18n(`UK: £3.99 flat rate (free over ${thresholdLabel})`)}</p>
        <p>{i18n("EU: £8.99 flat rate")}</p>
        <p>{i18n("Rest of World: £14.99 flat rate")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Truck className="text-primary mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">{i18n("UK: £3.99")}</p>
          <p className="text-neutral/60 text-sm">
            {i18n("Royal Mail delivery, 3-5 working days.")}{" "}
            <strong className="text-on-surface">
              {i18n("Free shipping on orders over")} {thresholdLabel}
            </strong>
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Package className="text-primary mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">{i18n("EU: £8.99 flat rate")}</p>
          <p className="text-neutral/60 text-sm">{i18n("Tracked post, 5-7 working days.")}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Package className="text-primary mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">{i18n("Rest of World: £14.99 flat rate")}</p>
          <p className="text-neutral/60 text-sm">{i18n("7-14 working days depending on destination.")}</p>
        </div>
      </div>
    </div>
  );
}
