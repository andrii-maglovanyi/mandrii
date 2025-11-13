alter table "public"."venue_restaurant_details" alter column "age_groups" drop not null;
alter table "public"."venue_restaurant_details" add column "age_groups" _text;
