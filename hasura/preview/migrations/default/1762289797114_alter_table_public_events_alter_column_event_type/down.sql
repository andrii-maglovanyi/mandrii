alter table "public"."events" rename column "type" to "event_type";
ALTER TABLE "public"."events" ALTER COLUMN "event_type" TYPE USER-DEFINED;
