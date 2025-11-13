alter table "public"."venue_restaurant_details" alter column "languages_taught" drop not null;
alter table "public"."venue_restaurant_details" add column "languages_taught" _text;
