alter table "public"."venue_beauty_salon_details" add column "updated_at" timestamptz
 not null default now();
