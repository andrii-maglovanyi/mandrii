import { describe, expect, it } from "vitest";
import { vi } from "vitest";

const { sqlMock } = vi.hoisted(() => ({ sqlMock: vi.fn() }));

vi.mock("~/lib/db/db", () => ({ default: sqlMock }));

import { getContentAlertDeliveryRetryOutcome } from "./content-subscription-alert-deliveries";

describe("content subscription external alert delivery", () => {
  it("uses bounded exponential retries and fails permanently after eight attempts", () => {
    expect(getContentAlertDeliveryRetryOutcome(1)).toEqual({ delaySeconds: 60, status: "PENDING" });
    expect(getContentAlertDeliveryRetryOutcome(2)).toEqual({ delaySeconds: 120, status: "PENDING" });
    expect(getContentAlertDeliveryRetryOutcome(8)).toEqual({ delaySeconds: null, status: "FAILED" });
  });
});
