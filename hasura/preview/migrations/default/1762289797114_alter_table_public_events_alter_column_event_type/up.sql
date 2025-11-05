ALTER TABLE "public"."events" ALTER COLUMN "event_type" TYPE text;
alter table "public"."events" rename column "event_type" to "type";
