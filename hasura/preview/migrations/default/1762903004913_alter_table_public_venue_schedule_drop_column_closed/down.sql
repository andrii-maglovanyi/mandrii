alter table "public"."venue_schedule" alter column "closed" drop not null;
alter table "public"."venue_schedule" add column "closed" bool;
