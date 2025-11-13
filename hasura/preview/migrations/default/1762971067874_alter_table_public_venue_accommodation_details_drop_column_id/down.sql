alter table "public"."venue_accommodation_details" alter column "id" set default gen_random_uuid();
alter table "public"."venue_accommodation_details" alter column "id" drop not null;
alter table "public"."venue_accommodation_details" add column "id" uuid;
