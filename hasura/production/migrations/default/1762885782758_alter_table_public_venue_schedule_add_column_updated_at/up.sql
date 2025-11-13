alter table "public"."venue_schedule" add column "updated_at" timestamp
 not null default now();
