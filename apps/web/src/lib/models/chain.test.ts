import { beforeEach, expect, it, vi } from "vitest";

import { saveChain } from "./chain";

const { begin, transaction } = vi.hoisted(() => ({ begin: vi.fn(), transaction: vi.fn() }));
vi.mock("~/lib/db/db", () => ({ default: { begin } }));
const id = "550e8400-e29b-41d4-a716-446655440000";
const venueId = "550e8400-e29b-41d4-a716-446655440001";
const input = { name: "Community venues", slug: "community-venues", venueIds: [venueId, venueId] };
beforeEach(() => {
  vi.resetAllMocks();
  begin.mockImplementation((callback) => callback(transaction));
  transaction.mockImplementation(async (strings: TemplateStringsArray) => {
    const query = strings.join("");
    if (query.includes("INSERT INTO chains")) return [{ id, name: input.name, slug: input.slug }];
    if (query.includes("SELECT id FROM venues")) return [{ id: venueId }];
    return [];
  });
});
it("deduplicates venue assignments and avoids rewriting unchanged venue membership", async () => {
  await expect(saveChain(input, id)).resolves.toMatchObject({ id });
  const venueUpdate = transaction.mock.calls.find(([strings]) =>
    strings.join("").includes("chain_id IS DISTINCT FROM"),
  )!;
  expect(venueUpdate[0].join("")).toContain("chain_id IS DISTINCT FROM");
  expect(venueUpdate[2]).toEqual([venueId]);
});
it("rejects conflicting slugs before changing any chain or venue", async () => {
  transaction.mockResolvedValue([{ id }]);
  await expect(saveChain(input, id)).rejects.toThrow("slug is already in use");
  expect(transaction.mock.calls.some(([strings]) => /INSERT|UPDATE chains|UPDATE venues/.test(strings.join("")))).toBe(
    false,
  );
});
it("preserves a short explicit slug across repeated saves", async () => {
  await saveChain({ ...input, slug: "cafe" }, id);
  await saveChain({ ...input, slug: "cafe" }, id);
  const inserts = transaction.mock.calls.filter(([strings]) => strings.join("").includes("INSERT INTO chains"));
  expect(inserts).toHaveLength(2);
  expect(inserts.map((call) => call[2])).toEqual(["cafe", "cafe"]);
});

it("rejects slugs that normalize to an empty URL segment before opening a transaction", async () => {
  await expect(saveChain({ ...input, slug: "!!!" }, id)).rejects.toMatchObject({ statusCode: 422 });
  expect(begin).not.toHaveBeenCalled();
});
it.each([
  [{ child_depth: 0, parent_depth: 1, would_create_cycle: true }, "one of its descendants"],
  [{ child_depth: 0, parent_depth: 2, would_create_cycle: false }, "one local branch"],
  [{ child_depth: 0, parent_depth: 0, would_create_cycle: false }, "no longer exists"],
])("rejects invalid parent hierarchies before writing", async (hierarchy, message) => {
  transaction.mockImplementation(async (strings: TemplateStringsArray) =>
    strings.join("").includes("WITH RECURSIVE") ? [hierarchy] : [],
  );
  await expect(saveChain({ ...input, parentChainId: id }, id)).rejects.toThrow(message);
  expect(transaction.mock.calls.some(([strings]) => /INSERT|UPDATE chains|UPDATE venues/.test(strings.join("")))).toBe(
    false,
  );
});

it("skips the venue existence query when saving an empty chain", async () => {
  await saveChain({ ...input, venueIds: [] }, id);
  expect(transaction.mock.calls.some(([strings]) => strings.join("").includes("SELECT id FROM venues"))).toBe(false);
  expect(transaction.mock.calls.some(([strings]) => strings.join("").includes("SET chain_id = NULL"))).toBe(true);
});
