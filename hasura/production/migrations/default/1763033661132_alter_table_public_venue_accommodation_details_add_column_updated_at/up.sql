alter table "public"."venue_accommodation_details" add column "updated_at" timestamptz
 not null default now();
