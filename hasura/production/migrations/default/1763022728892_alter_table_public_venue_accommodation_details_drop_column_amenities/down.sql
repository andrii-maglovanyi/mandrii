alter table "public"."venue_accommodation_details" alter column "amenities" drop not null;
alter table "public"."venue_accommodation_details" add column "amenities" text;
