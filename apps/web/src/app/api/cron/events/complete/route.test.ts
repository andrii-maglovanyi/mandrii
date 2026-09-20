vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
import { beforeEach, expect, it, vi } from "vitest";

import { GET } from "./route";

const { authorize, sql, transaction } = vi.hoisted(() => {
  const transaction = vi.fn();
  const sql = Object.assign(vi.fn(), { begin: vi.fn() });
  return { authorize: vi.fn(), sql, transaction };
});
vi.mock("~/lib/cron/authorization", () => ({ getCronAuthorizationError: authorize }));
vi.mock("~/lib/db/db", () => ({ default: sql }));

beforeEach(() => {
  vi.resetAllMocks();
  authorize.mockReturnValue(null);
  sql.mockResolvedValue([{ id: "one-off" }]);
  sql.begin.mockImplementation((callback) => callback(transaction));
});

it("completes only finished series and includes one-off completions in its count", async () => {
  transaction
    .mockResolvedValueOnce([
      { id: "finished", recurrence_rule: "FREQ=WEEKLY;COUNT=2", start_date: "2000-01-01T09:00:00Z" },
      { id: "ongoing", recurrence_rule: "FREQ=WEEKLY", start_date: "2000-01-01T09:00:00Z" },
      { id: "future", recurrence_rule: "FREQ=WEEKLY;COUNT=2", start_date: "2099-01-01T09:00:00Z" },
    ])
    .mockResolvedValueOnce([{ id: "finished" }]);
  const response = await GET(new Request("https://mandrii.com/api/cron/events/complete"));
  expect(await response.json()).toEqual({ completed: 2 });
  expect(sql.begin).toHaveBeenCalledOnce();
  expect(transaction.mock.calls[0][0].join("")).toContain("FOR UPDATE");
  expect(transaction.mock.calls[1][1]).toEqual(["finished"]);
});

it("does not write to the database for unauthorized calls", async () => {
  authorize.mockReturnValue(new Response("Unauthorized", { status: 401 }));
  expect((await GET(new Request("https://mandrii.com/api/cron/events/complete"))).status).toBe(401);
  expect(sql).not.toHaveBeenCalled();
  expect(sql.begin).not.toHaveBeenCalled();
});
