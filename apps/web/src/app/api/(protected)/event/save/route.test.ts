import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { ForbiddenError } from "~/lib/api/errors";

import { POST } from "./route";

const { access, images, save, validate } = vi.hoisted(() => ({ access: vi.fn(), images: vi.fn(), save: vi.fn(), validate: vi.fn() }));
vi.mock("~/lib/api", async () => ({
  ...(await import("~/lib/api/errors")), ...(await import("~/lib/api/withErrorHandling")),
  getApiContext: async () => ({ i18n: (key: string) => key, session: { user: { id: "author" } } }),
  validateRequest: validate,
}));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn(), NextResponse: { json: Response.json } }));
vi.mock("~/lib/models/content-edit-access", () => ({ getEditableContentSlug: access }));
vi.mock("~/lib/models/event", () => ({ saveEvent: save }));
vi.mock("~/lib/models/content-subscription-alerts", () => ({ deliverPendingContentSubscriptionAlerts: vi.fn() }));
vi.mock("~/lib/slack/event", () => ({ sendSlackNotification: async () => {} }));
vi.mock("~/lib/utils/images", () => ({ processImages: images }));
vi.mock("~/lib/validation/event", () => ({ getEventSchema: () => ({}) }));
vi.mock("./validation", () => ({ checkIsSlugUnique: async () => true }));
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  validate.mockResolvedValue({ id: "event-id", price_type: "FREE", slug: "another-event-slug", title_en: "Title", title_uk: "Title" });
  access.mockResolvedValue("persisted-event-slug");
  images.mockResolvedValue([]);
  save.mockResolvedValue("event-id");
});
afterEach(() => vi.restoreAllMocks());
const request = () => new Request("https://mandrii.com/api/event/save", { method: "POST" });

it("rejects unauthorized edits before any image processing or database mutation", async () => {
  access.mockRejectedValue(new ForbiddenError());
  expect((await POST(request())).status).toBe(403);
  expect(images).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
});
it("uses the database slug instead of a submitted storage prefix", async () => {
  expect((await POST(request())).status).toBe(200);
  expect(images.mock.calls[0][1]).toMatch(/\/events\/persisted-event-slug\/images$/);
  expect(images.mock.calls[0][1]).not.toContain("another-event-slug");
});
