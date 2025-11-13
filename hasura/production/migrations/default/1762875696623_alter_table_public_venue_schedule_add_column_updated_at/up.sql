alter table "public"."venue_schedule" add column "updated_at" time
 not null default now();
