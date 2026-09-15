import { z } from "zod";

import { BadRequestError, withErrorHandling } from "~/lib/api";
import { requireChainAdmin } from "~/lib/chains/authorization";
import { getChainDetails } from "~/lib/models/chain";

export const dynamic = "force-dynamic";

export const GET = (req: Request, { params }: { params: Promise<unknown> }) => withErrorHandling(async () => {
  await requireChainAdmin(req);
  const parsed = z.object({ chainId: z.string().uuid() }).safeParse(await params);
  if (!parsed.success) throw new BadRequestError("A valid chain ID is required");
  return Response.json(await getChainDetails(parsed.data.chainId));
});
