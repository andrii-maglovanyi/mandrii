import { validateRequest, withErrorHandling } from "~/lib/api";
import { requireChainAdmin } from "~/lib/chains/authorization";
import { listChains, saveChain } from "~/lib/models/chain";
import { chainSchema } from "~/lib/validation/chain";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => withErrorHandling(async () => {
  await requireChainAdmin(req);
  return Response.json({ chains: await listChains() });
});

export const POST = (req: Request) => withErrorHandling(async () => {
  const session = await requireChainAdmin(req);
  const input = await validateRequest(req, chainSchema);
  return Response.json({ chain: await saveChain(input, session.user.id) });
});
