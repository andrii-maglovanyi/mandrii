alter table "public"."events" alter column "status" set default 'PENDING'::event_status_enum;
ALTER TABLE "public"."events" ALTER COLUMN "status" TYPE USER-DEFINED;
