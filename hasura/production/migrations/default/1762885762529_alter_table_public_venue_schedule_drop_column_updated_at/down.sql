alter table "public"."venue_schedule" alter column "updated_at" set default now();
alter table "public"."venue_schedule" alter column "updated_at" drop not null;
alter table "public"."venue_schedule" add column "updated_at" time;
