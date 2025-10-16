import { z } from "zod";

import { isPotentiallyValidAddress } from "~/lib/utils";

export const getAddressSchema = (i18n: (key: string) => string) => {
  return z.object({
    address: z
      .string()
      .min(1, i18n("Address is required"))
      .refine(isPotentiallyValidAddress, {
        message: i18n("The address appears to be incomplete"),
      }),
  });
};
