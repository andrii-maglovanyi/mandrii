import { z } from "zod";

export const chainSchema = z.object({
  city: z.string().trim().max(120).nullable().optional(),
  country: z.string().trim().max(120).nullable().optional(),
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(160),
  parentChainId: z.string().uuid().nullable().optional(),
  slug: z.string().trim().max(180).optional(),
  venueIds: z.array(z.string().uuid()).max(5000),
});

export type ChainInput = z.infer<typeof chainSchema>;
