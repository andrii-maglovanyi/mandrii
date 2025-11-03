import { z } from "zod";

import { detectAddressType } from "~/lib/utils";

export const getAddressSchema = (i18n: (key: string) => string) => {
  return z
    .object({
      address: z.string().min(3, i18n("Address is required")),
      is_physical: z.coerce.boolean().optional(),
    })
    .refine(
      (data) => {
        // If physical venue, address must be specific (not fuzzy)
        if (data.is_physical && data.address) {
          const addressType = detectAddressType(data.address);
          return addressType === "specific";
        }
        return true;
      },
      {
        message: i18n(
          "Physical venues require a complete address with a street number (e.g., '10 Oxford St, London W1D 1AW')",
        ),
        path: ["address"],
      },
    );
};
