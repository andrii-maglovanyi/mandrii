# Mobile and PWA behavior

Device controls live at `/en/user-profile/settings#device-settings` (also available in Ukrainian). Account-level feed/follow/email/Telegram preferences remain in their existing settings sections. Device notification enrollment is separate from account delivery preferences.

## Runtime and storage

- `PwaProvider` owns one install prompt, connectivity state, and service worker update listener. Footer controls and device settings share that runtime.
- The production worker registers for every visitor without requesting notification or location permission. Notification enrollment reuses the registration and has a bounded activation wait.
- `public/sw.js` caches only the public offline shell and up to 80 immutable build assets. API responses, HTML navigations, RSC requests, private messages, account data, maps, and mutations are never cached. Navigation failures get the offline shell; HTTP errors retain their server responses.
- Public post pages offer explicit text-only saving. `mandrii-offline-articles-v1` contains at most 20 articles, with a 500,000-character total budget and a 100,000-character per-article limit. Offline reading uses textContent, never saved HTML. The reader displays the saved date and supports removal; settings can clear all articles after confirmation.
- Bump the worker cache version whenever offline shell assets change. Updates do not force a reload; the user is prompted to save work and accept the update.
- Location is requested only by Find me, with a 10-second timeout, a one-minute cached position, no high-accuracy GPS request, and duplicate-tap protection. The device toggle disables this feature; browser/OS permission must be revoked in the browser/OS settings. Coordinates are used for the map and nearby queries, so this is not an exclusively local operation.
- Push notification links are same-origin only. A matching window is focused; unrelated windows are not navigated away from unsaved work. Malformed payloads still produce a visible fallback notification.
- Native sharing already exists; dismissing the share sheet does not copy a URL unexpectedly. Unread app-icon badges use feature detection.

## Platform limits

On iOS/iPadOS, Web Push requires a Home Screen web app and a supported OS (16.4+). Permission prompts require user interaction. Browser support for install prompts and app badges varies. Background location, unrestricted background work, offline maps, and offline payment/message submission are not provided. Permissions and remote push delivery must be tested on physical devices with deployed HTTPS and configured VAPID keys.

## Deployment on Vercel Hobby

`apps/web/vercel.json` schedules content alert processing once daily at `0 9 * * *`. Hobby can invoke it anywhere from 09:00 to 09:59 UTC. Daily and Monday weekly digests remain due at 09:00 UTC; UI labels describe approximate delivery.

Content writes also attempt immediate alert processing after the response. Failed/queued work waits for the daily retry job, whose current batch limit is 100. Monitor the existing queue metrics for backlog. More frequent retries or higher throughput require a supported paid schedule or a separately provisioned authenticated scheduler; this change does not provision one. Keep `CRON_SECRET` configured. Do not manually invoke production delivery endpoints during routine validation: they send real notifications.

## Verification

Unit coverage includes private-data cache exclusions, navigation failure recovery, malformed push payloads, safe notification links, worker registration coalescing/timeouts, bounded public article storage, location permissions/device opt-out, settings removal confirmation, server-rendered theme content, and preserving drafts across responsive layout changes.

Device acceptance checks:
1. Android Chrome and iOS Safari/Home Screen: install, relaunch, rotate, scroll the navigation menu, open the keyboard, and check safe areas and 200% zoom.
2. Save a public article, disconnect, navigate to another page, open the offline reader, and remove the saved copy.
3. Explicitly enroll notifications, receive a test notification in a controlled account, open its destination, disable enrollment, and check browser permission denial recovery.
4. Accept/deny location, disable Find me in device settings, and verify manual search remains available.
5. Deploy a worker version change while an edit is open; confirm no automatic reload and apply the update only after saving.

Verified locally on 2026-09-16: production build and 1,077 unit tests passed. Chrome checked the home, venues, events, community, English guides, and Ukrainian guides pages at 320, 390, 768, and 1280 pixels, with no document overflow or hydration errors. The browser also verified menu dismissal, the location dialog's close button within the mobile viewport, and reading a saved article with the local server stopped. These checks use browser emulation, not physical iOS/Android devices.
