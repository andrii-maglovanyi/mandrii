CREATE TABLE "public"."venue_accomodation_details" ("bedrooms" integer, "bathrooms" integer, "max_guests" integer, "check_in_time" timetz, "check_out_time" timetz, "minimum_stay_nights" integer, "amenities" json, "id" uuid NOT NULL DEFAULT gen_random_uuid(), "venue_id" uuid NOT NULL, PRIMARY KEY ("id") , UNIQUE ("id"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
