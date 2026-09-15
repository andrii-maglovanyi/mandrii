// @vitest-environment node
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { beforeEach, expect, it, vi } from "vitest";

const source = readFileSync(new URL("../../../public/sw.js", import.meta.url), "utf8");
let handlers: Record<string, (event: Record<string, unknown>) => void>;
let environment: ReturnType<typeof createEnvironment>;
function createEnvironment() {
  return {
    caches: {
      delete: vi.fn(),
      keys: vi.fn().mockResolvedValue([]),
      match: vi.fn().mockResolvedValue(new Response("Offline")),
      open: vi.fn(),
    },
    fetch: vi.fn(),
    Response,
    self: {
      addEventListener: (name: string, callback: (event: Record<string, unknown>) => void) => {
        handlers[name] = callback;
      },
      clients: {
        claim: vi.fn(),
        matchAll: vi.fn().mockResolvedValue([]),
        openWindow: vi.fn().mockResolvedValue(undefined),
      },
      location: { origin: "https://mandrii.test" },
      registration: { showNotification: vi.fn().mockResolvedValue(undefined) },
      skipWaiting: vi.fn(),
    },
    URL,
  };
}
beforeEach(() => {
  handlers = {};
  environment = createEnvironment();
  runInNewContext(source, environment);
});
it("serves offline recovery when navigation fails without caching private HTML", async () => {
  environment.fetch.mockRejectedValue(new Error("offline"));
  const respondWith = vi.fn();
  handlers.fetch({
    request: { method: "GET", mode: "navigate", url: "https://mandrii.test/en/settings" },
    respondWith,
  });
  expect(await (await respondWith.mock.calls[0][0]).text()).toBe("Offline");
  expect(environment.caches.open).not.toHaveBeenCalled();
});
it.each([
  ["GET", "https://mandrii.test/api/auth/session"],
  ["POST", "https://mandrii.test/api/conversations"],
  ["GET", "https://external.test/graphql"],
  ["GET", "https://mandrii.test/en/venues?_rsc=token"],
])("does not intercept %s %s", (method, url) => {
  const respondWith = vi.fn();
  handlers.fetch({ request: { method, mode: "cors", url }, respondWith });
  expect(respondWith).not.toHaveBeenCalled();
});
it("shows a fallback notification for malformed push data", async () => {
  const waitUntil = vi.fn();
  handlers.push({
    data: {
      json: () => {
        throw new Error("bad json");
      },
    },
    waitUntil,
  });
  await waitUntil.mock.calls[0][0];
  expect(environment.self.registration.showNotification).toHaveBeenCalledWith(
    "Mandrii",
    expect.objectContaining({ data: { url: "https://mandrii.test/" } }),
  );
});
it.each(["https://evil.test", "javascript:alert(1)", "//evil.test/path"])(
  "blocks notification navigation to %s",
  async (url) => {
    const waitUntil = vi.fn();
    handlers.notificationclick({ notification: { close: vi.fn(), data: { url } }, waitUntil });
    await waitUntil.mock.calls[0][0];
    expect(environment.self.clients.openWindow).toHaveBeenCalledWith("https://mandrii.test/");
  },
);
it("focuses an existing matching page without disrupting another tab", async () => {
  const focus = vi.fn();
  environment.self.clients.matchAll.mockResolvedValue([{ focus, url: "https://mandrii.test/en/events" }]);
  const waitUntil = vi.fn();
  handlers.notificationclick({ notification: { close: vi.fn(), data: { url: "/en/events" } }, waitUntil });
  await waitUntil.mock.calls[0][0];
  expect(focus).toHaveBeenCalledOnce();
  expect(environment.self.clients.openWindow).not.toHaveBeenCalled();
});
it("waits for explicit update acceptance before skipping the waiting phase", () => {
  const addAll = vi.fn().mockResolvedValue(undefined);
  environment.caches.open.mockResolvedValue({ addAll });
  handlers.install({ waitUntil: vi.fn() });
  expect(environment.self.skipWaiting).not.toHaveBeenCalled();
  handlers.message({ data: { type: "ACTIVATE_UPDATE" }, waitUntil: vi.fn() });
  expect(environment.self.skipWaiting).toHaveBeenCalledOnce();
});
