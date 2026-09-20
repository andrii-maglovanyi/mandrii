# Public content caching

Public Apollo reads for venue/event discovery, map/list views, pickers and detail
fallbacks go through `/api/discovery`. Server-rendered detail pages use the same
cache loader. Personal/admin queries still use the authenticated Hasura client.

The endpoint executes an allowlist of fixed documents, ignores submitted query
text, applies public visibility filters, and calls Hasura as the anonymous public
role. Account tokens and cookies are never sent upstream. Failed/partial GraphQL
responses are not cached. The HTTP response itself uses `no-store`; persistence
is in the Next.js Data Cache, allowing server invalidation to take effect on the
next read without another browser/CDN cache hiding it.

## Lifetimes and invalidation

- Venue reads: 24-hour background revalidation.
- Event details, schedules and lists: 15-minute background revalidation.
- Public community pages: 60-second background revalidation. Viewer response IDs
  are fetched separately in one small query and never enter the shared cache.
- Venue/event saves, status changes, chain edits and event completion invalidate
  public content and related community entries immediately (`expire: 0`). Venue
  saves also invalidate after related metadata/schedule writes, even on partial
  failure. Community create/edit/close/respond operations invalidate the feed;
  profile edits invalidate cached author presentation.

Invalidation is deliberately broad across venues/events because current query
fragments embed related events, venues and chain members. Narrower entity/region
invalidation can follow once traffic measurements justify that complexity.

Public Apollo hooks show in-memory data immediately and check the server cache
when mounted. Invalidation affects subsequent server reads; it does not push an
update into already-open browser tabs.

## Filters and time

Cache keys sort object keys, preserve array ordering, and include the operation,
query document and variables. Default schedule lower bounds use a shared
15-minute window instead of a distinct millisecond timestamp per visitor.
Explicit date filters remain exact. Event display code still checks the real
clock; community cache hits filter out expired posts and preserve the pagination
cursor. Community totals can lag expiry until the next refresh.

Coordinates and distances remain exact. This preserves existing geographic
results, but distinct coordinates create distinct entries; geographic tiling is
not part of this change. Rich map/list fragments and event-map result sizes are
also unchanged. Compact marker queries and geographic reuse are follow-up query
optimizations, not prerequisites for this shared cache.

Venue queries that include a time-window filter get a new key when the window
changes, even though their configured revalidation interval is 24 hours.

## External writers

Application writes invalidate automatically. Direct SQL, Hasura console changes
and external imports must POST to `/api/cache/revalidate` with
`Authorization: Bearer <CRON_SECRET>` after committing. It accepts no cache keys
from callers and expires all public-content/community entries. It can also be
used as a Hasura event webhook with the same authorization header. No external
Hasura webhook is provisioned by this code change. Without that integration,
external writes become visible through normal time-based revalidation.

## Deployment and measurement

This uses Next.js Data Cache; on Vercel, it is managed by the platform. A
multi-instance self-hosted deployment needs a shared cache handler and coordinated
invalidation. It does not persist content onto users' devices or cache map tiles.

Compare Hasura/Postgres request counts and expensive-query timings before/after
release under equivalent traffic. Check Vercel cache reads/writes and function
usage as well: savings depend on repeated filters and cache cost, not just TTL.
Smoke-test the same public list/detail twice, edit it, then verify the next request
sees the change; repeat logged out and with two different accounts. Check an
expired community post and a completed/cancelled event. Automated tests cover
cache reuse/invalidation, public credentials, failed reads, operation validation
and separation of viewer response IDs.

## Regression audit

- Simultaneous misses share one origin read per server instance, including
  community queries. An overlapping local invalidation rejects the old read and
  retries once, preventing it from filling that instance's cache with old data.
  This is not a distributed transaction/lock across serverless instances; a
  simultaneous cold miss on different instances can still issue multiple reads.
- Cache keys normalize GraphQL defaults, zero offsets and unused total filters.
  Large mobile event lists reuse fixed 12-event batches, so previously loaded
  batches do not have to be read again from the database.
- Public discovery has its own rate-limit bucket, bounded streamed request
  bodies, filter-depth/operator validation and a 15-second upstream timeout.
  Pagination limits retain GraphQL semantics rather than breaking accumulated
  mobile lists at an arbitrary 1,000 items.
- Background event refreshes preserve matching cards, including on network
  failure; cached records are never reused for a different filter. Expired
  community pages retain a reachable Load more control.
- Map views resolve the requested tab before mounting a data loader. Event-map
  initial filters match later filters, and zero offsets do not change during
  mobile hydration. The homepage event preview also uses shared reads.

Validation after the audit: 1,098 unit tests passed; production build, TypeScript
and lint passed. Production browser checks covered desktop/mobile venue and event
lists, both map tabs, public detail pages, search/clear and venue pagination, with
no application or hydration errors. The Google Maps check used its existing
allowed localhost origin through a browser-only proxy to the test server.
Concurrent-read tests verify 10 identical cold reads produce one origin request
within an instance; mobile 12-to-24 event expansion fetches only the new batch.

The local environment has no CRON_SECRET, so the external invalidation endpoint
correctly returns 503 (disabled). Configure the secret and connect external writers
before relying on immediate invalidation for changes outside application flows.
Next's default Data Cache also has a 2 MB entry limit; oversized map responses
will not benefit from that cache in production. Keep monitoring response sizes
and use compact/paged marker queries before the dataset grows to that point.
