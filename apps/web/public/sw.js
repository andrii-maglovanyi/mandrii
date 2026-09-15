/* Only the public offline shell and immutable build assets belong in this cache.
 * Never persist HTML navigations, API responses, session data, or mutations. */
const CACHE_PREFIX = "mandrii-shell-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const OFFLINE_URL = "/offline.html";
const SHELL = [OFFLINE_URL, "/offline.js", "/offline.css", "/static/icon-192.png"];
const MAX_ASSETS = 80;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") event.waitUntil(self.skipWaiting());
});
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        async () =>
          (await caches.match(OFFLINE_URL)) ??
          new Response("You are offline. Please reconnect.", {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            status: 503,
          }),
      ),
    );
    return;
  }
  if (!SHELL.includes(url.pathname) && !url.pathname.startsWith("/_next/static/")) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type !== "opaque") {
        const copy = response.clone();
        event.waitUntil(
          (async () => {
            await cache.put(request, copy);
            const keys = await cache.keys();
            const assets = keys.filter((key) => !SHELL.includes(new URL(key.url).pathname));
            for (const key of assets.slice(0, Math.max(0, assets.length - MAX_ASSETS))) await cache.delete(key);
          })().catch(() => {
            /* Storage pressure must not break a successful response. */
          }),
        );
      }
      return response;
    })(),
  );
});

function notificationUrl(value) {
  try {
    const url = new URL(typeof value === "string" ? value : "/", self.location.origin);
    if (url.origin === self.location.origin && !url.username && !url.password) return url.href;
  } catch {
    /* Fall back to the app, never an external or executable URL. */
  }
  return `${self.location.origin}/`;
}
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    /* Still show a visible fallback notification. */
  }
  if (!data || typeof data !== "object") data = {};
  event.waitUntil(
    self.registration.showNotification(typeof data.title === "string" ? data.title : "Mandrii", {
      body: typeof data.body === "string" ? data.body : "Open Mandrii to see your updates.",
      data: { url: notificationUrl(data.url) },
      icon: "/static/icon-192.png",
    }),
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = notificationUrl(event.notification.data?.url);
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows.find((client) => client.url === url);
      if (existing) return existing.focus();
      // Avoid navigating another tab away from an unsaved form.
      return self.clients.openWindow(url);
    })(),
  );
});
