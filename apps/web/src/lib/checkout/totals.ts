import { ShippingCountry, ValidatedItem } from "~/types";

import { constants } from "../constants";

export interface CheckoutTotals {
  shippingMinor: number;
  subtotalMinor: number;
  totalMinor: number;
}

export const calculateTotals = (validatedItems: ValidatedItem[], shippingCountry: ShippingCountry) => {
  const subtotalMinor = validatedItems.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);
  const { shippingCost } = constants;

  let shippingMinor;

  if (shippingCountry === "GB" && subtotalMinor >= shippingCost.freeThreshold) {
    shippingMinor = 0;
  } else if (shippingCountry === "GB") {
    shippingMinor = shippingCost.uk;
  } else if (shippingCountry === "EU") {
    shippingMinor = shippingCost.eu;
  } else {
    shippingMinor = shippingCost.row;
  }

  const totalMinor = subtotalMinor + shippingMinor;

  return { shippingMinor, subtotalMinor, totalMinor };
};
