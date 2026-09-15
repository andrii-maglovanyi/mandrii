// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("keeps configured Vercel jobs compatible with the Hobby daily limit", () => {
  const config = JSON.parse(readFileSync(new URL("../../../vercel.json", import.meta.url), "utf8"));
  for (const job of config.crons) expect(job.schedule).toMatch(/^\d{1,2} \d{1,2} \* \* \*$/);
  expect(
    config.crons.find((job: { path: string }) => job.path === "/api/cron/content-subscription-alerts").schedule,
  ).toBe("0 9 * * *");
});
