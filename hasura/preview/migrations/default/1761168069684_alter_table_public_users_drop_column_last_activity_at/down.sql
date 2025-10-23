alter table "public"."users" alter column "last_activity_at" drop not null;
alter table "public"."users" add column "last_activity_at" timestamp;
