"use client";

import { Package, Truck } from "lucide-react";

import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";

export function ShippingInfo() {
  const i18n = useI18n();
  const { shippingCost } = constants;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-medium">{i18n("UK: £{cost}", { cost: (shippingCost.uk / 100).toFixed(2) })}</p>
          <p className="text-sm text-neutral/60">
            {i18n("Royal Mail delivery, 3-5 working days.")}{" "}
            <strong className="text-on-surface">
              {i18n("Free shipping on orders over £{thresholdLabel}", {
                thresholdLabel: (shippingCost.freeThreshold / 100).toFixed(2),
              })}
            </strong>
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-medium">{i18n("EU: £{cost} flat rate", { cost: (shippingCost.eu / 100).toFixed(2) })}</p>
          <p className="text-sm text-neutral/60">{i18n("Tracked post, 5-7 working days.")}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-medium">
            {i18n("Rest of World: £{cost} flat rate", { cost: (shippingCost.row / 100).toFixed(2) })}
          </p>
          <p className="text-sm text-neutral/60">{i18n("7-14 working days depending on destination.")}</p>
        </div>
      </div>
    </div>
  );
}
